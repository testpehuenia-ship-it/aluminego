import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifySession, hashPassword } from '@/lib/auth';
import { cookies } from 'next/headers';
import { generateUniqueSlug } from '@/lib/slugs';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const commerce = await prisma.commerce.findUnique({
      where: { id },
      include: {
        details: true
      }
    });

    if (!commerce) {
      return NextResponse.json({ error: 'Comercio no encontrado' }, { status: 404 });
    }

    return NextResponse.json(commerce);
  } catch (error: any) {
    console.error('Error fetching commerce:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;
    if (!verifySession(token)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, type, image, whatsapp, description, details, selectedPricingKeys, latitude, longitude, locality, openingHours } = body;
    const finalLocality = locality || 'Aluminé';
    const slug = await generateUniqueSlug(name, finalLocality, id);
    
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
      let generatedCredentials = null;
      
      // Eliminar detalles anteriores
      await tx.commerceDetail.deleteMany({
        where: { commerceId: id }
      });

      // Actualizar el comercio
      const commerce = await tx.commerce.update({
        where: { id },
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

      if (selectedPricingKeys && Array.isArray(selectedPricingKeys)) {
        const configs = await tx.pricingConfig.findMany({
          where: { key: { in: selectedPricingKeys } }
        });
        const totalCost = configs.reduce((sum: number, conf: any) => sum + conf.price, 0);

        const existingSub = await tx.subscription.findUnique({
          where: { commerceId: id }
        });

        if (totalCost > 0) {
          const dueDate = existingSub ? existingSub.dueDate : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          
          if (existingSub) {
            await tx.subscription.update({
              where: { id: existingSub.id },
              data: {
                clientName: name,
                planType: selectedPricingKeys.join(', '),
                price: totalCost,
                hasBannerTop: selectedPricingKeys.includes('banner_top'),
                hasBannerMiddle: selectedPricingKeys.includes('banner_middle'),
                hasBannerBottom: selectedPricingKeys.includes('banner_bottom'),
                hasBannerPortada: selectedPricingKeys.includes('portada_principal'),
              }
            });
          } else {
            const newSub = await tx.subscription.create({
              data: {
                clientName: name,
                planType: selectedPricingKeys.join(', '),
                price: totalCost,
                dueDate,
                commerceId: id,
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
        } else {
          if (existingSub) {
            await tx.subscription.delete({
              where: { id: existingSub.id }
            });
          }
        }

        // 4. Auto-generar PortalUser si se actualiza a plan de portal y no tiene
        if (selectedPricingKeys.includes('plan_comercio_completo') || selectedPricingKeys.includes('plan_basico_destacado')) {
          const commerceCheck = await tx.commerce.findUnique({ 
            where: { id }, 
            select: { portalUserId: true, name: true, portalUser: true } 
          });
          if (!commerceCheck?.portalUserId) {
            const safeName = commerceCheck.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            let email = `${safeName}@aluminego.ar`;
            const today = new Date();
            const password = `aluminego${String(today.getDate()).padStart(2, '0')}${String(today.getMonth() + 1).padStart(2, '0')}${today.getFullYear()}`;
            
            let portalUser = await tx.portalUser.findUnique({ where: { email } });
            let counter = 1;
            while (portalUser) {
              email = `${safeName}${counter}@aluminego.ar`;
              portalUser = await tx.portalUser.findUnique({ where: { email } });
              counter++;
            }
            
            const newUser = await tx.portalUser.create({
              data: { name: commerceCheck.name, email, password: hashPassword(password) }
            });
            
            await tx.commerce.update({
              where: { id },
              data: { portalUserId: newUser.id }
            });
            
            generatedCredentials = { email, password };
          } else if (commerceCheck.portalUser) {
            generatedCredentials = {
              email: commerceCheck.portalUser.email,
              password: "Tu contraseña ya fue creada anteriormente. Si la olvidaste, contactanos."
            };
          }
        }
      }

      return { commerce, generatedCredentials };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error updating commerce:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;
    if (!verifySession(token)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    
    // Primero eliminamos los detalles relacionados
    await prisma.commerceDetail.deleteMany({
      where: { commerceId: id }
    });

    // Luego eliminamos el comercio
    await prisma.commerce.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting commerce:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
