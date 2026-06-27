import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifySession, hashPassword } from '@/lib/auth';
import { cookies } from 'next/headers';
import { generateUniqueSlug } from '@/lib/slugs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const commerces = await prisma.commerce.findMany({
      include: {
        details: true,
        subscription: true
      },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(commerces);
  } catch (error) {
    console.error('Error fetching commerces:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;
    if (!verifySession(token)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, image, whatsapp, description, details, selectedPricingKeys, latitude, longitude, locality, openingHours } = body;
    const finalLocality = locality || 'Aluminé';
    const slug = await generateUniqueSlug(name, finalLocality);
    
    const latFloat = (latitude !== undefined && latitude !== null && String(latitude).trim() !== '' && parseFloat(String(latitude)) !== 0) ? parseFloat(String(latitude)) : -39.237200;
    const lngFloat = (longitude !== undefined && longitude !== null && String(longitude).trim() !== '' && parseFloat(String(longitude)) !== 0) ? parseFloat(String(longitude)) : -70.931400;
    const DEFAULT_SCHEDULE_STRING = JSON.stringify([
      { day: 1, dayName: 'Lunes', closed: false, periods: [{ open: '09:00', close: '13:00' }, { open: '17:00', close: '21:00' }] },
      { day: 2, dayName: 'Martes', closed: false, periods: [{ open: '09:00', close: '13:00' }, { open: '17:00', close: '21:00' }] },
      { day: 3, dayName: 'Miércoles', closed: false, periods: [{ open: '09:00', close: '13:00' }, { open: '17:00', close: '21:00' }] },
      { day: 4, dayName: 'Jueves', closed: false, periods: [{ open: '09:00', close: '13:00' }, { open: '17:00', close: '21:00' }] },
      { day: 5, dayName: 'Viernes', closed: false, periods: [{ open: '09:00', close: '13:00' }, { open: '17:00', close: '21:00' }] },
      { day: 6, dayName: 'Sábado', closed: false, periods: [{ open: '09:00', close: '13:00' }, { open: '17:00', close: '21:00' }] },
      { day: 0, dayName: 'Domingo', closed: true, periods: [] }
    ]);
    const finalOpeningHours = (openingHours && openingHours.trim().length > 0) ? openingHours : DEFAULT_SCHEDULE_STRING;

    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Crear el Comercio
      const commerce = await tx.commerce.create({
        data: {
          name,
          slug,
          type,
          image,
          whatsapp,
          description,
          latitude: latFloat,
          longitude: lngFloat,
          locality: finalLocality,
          openingHours: finalOpeningHours,
          details: {
            create: details ? details.map((d: string) => ({ name: d })) : []
          }
        },
        include: {
          details: true
        }
      });

      let generatedCredentials = null;
      if (selectedPricingKeys && Array.isArray(selectedPricingKeys) && selectedPricingKeys.length > 0) {
        const configs = await tx.pricingConfig.findMany({
          where: { key: { in: selectedPricingKeys } }
        });
        const totalCost = configs.reduce((sum: number, conf: any) => sum + conf.price, 0);

        if (totalCost > 0) {
          const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          const newSub = await tx.subscription.create({
            data: {
              clientName: name,
              planType: selectedPricingKeys.join(', '),
              price: totalCost,
              dueDate,
              commerceId: commerce.id,
              hasBannerTop: selectedPricingKeys.includes('banner_top'),
              hasBannerMiddle: selectedPricingKeys.includes('banner_middle'),
              hasBannerBottom: selectedPricingKeys.includes('banner_bottom'),
              hasBannerPortada: selectedPricingKeys.includes('portada_principal'),
            }
          });

          await tx.payment.create({
            data: {
              amount: totalCost,
              subscriptionId: newSub.id,
              periodPaid: dueDate
            }
          });
        }

        // 3. Generación automática de PortalUser
        if (selectedPricingKeys.includes('plan_comercio_completo') || selectedPricingKeys.includes('plan_basico_destacado')) {
          const safeName = commerce.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const email = `${safeName}@AluminéGO.ar`;
          
          const today = new Date();
          const d = String(today.getDate()).padStart(2, '0');
          const m = String(today.getMonth() + 1).padStart(2, '0');
          const y = today.getFullYear();
          const password = `AluminéGO${d}${m}${y}`;

          // Verificar si ya existe el usuario
          let portalUser = await tx.portalUser.findUnique({ where: { email } });
          if (!portalUser) {
            portalUser = await tx.portalUser.create({
              data: {
                name: commerce.name,
                email,
                password: hashPassword(password),
              }
            });
            generatedCredentials = { email, password };
          } else {
            generatedCredentials = { email, password: "Tu contraseña ya fue creada anteriormente. Si la olvidaste, contactanos." };
          }

          // Conectar Comercio con PortalUser
          await tx.commerce.update({
            where: { id: commerce.id },
            data: { portalUserId: portalUser.id }
          });
        }
      }

      return { commerce, generatedCredentials };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating commerce:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


