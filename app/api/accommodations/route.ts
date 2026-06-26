import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifySession, hashPassword } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const accommodations = await prisma.accommodation.findMany({
      include: {
        features: true,
        subscription: true
      },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(accommodations);
  } catch (error) {
    console.error('Error fetching accommodations:', error);
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
    const { name, type, image, whatsapp, description, features, selectedPricingKeys, latitude, longitude, openingHours } = body;

    const result = await prisma.$transaction(async (tx: any) => {
      const accommodation = await tx.accommodation.create({
        data: {
          name,
          type,
          image,
          whatsapp,
          description,
          latitude: latitude ? parseFloat(String(latitude)) : null,
          longitude: longitude ? parseFloat(String(longitude)) : null,
          openingHours: openingHours || null,
          features: {
            create: features.map((f: string) => ({ name: f }))
          }
        },
        include: {
          features: true
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
              accommodationId: accommodation.id,
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
        // 3. Auto-generate PortalUser if applicable
        if (selectedPricingKeys.includes('plan_comercio_completo') || selectedPricingKeys.includes('plan_basico_destacado')) {
          const safeName = accommodation.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const email = `${safeName}@AluminéGO.ar`;
          
          const today = new Date();
          const d = String(today.getDate()).padStart(2, '0');
          const m = String(today.getMonth() + 1).padStart(2, '0');
          const y = today.getFullYear();
          const password = `AluminéGO${d}${m}${y}`;

          // Check if user exists
          let portalUser = await tx.portalUser.findUnique({ where: { email } });
          if (!portalUser) {
            portalUser = await tx.portalUser.create({
              data: {
                name: accommodation.name,
                email,
                password: hashPassword(password),
              }
            });
            generatedCredentials = { email, password };
          } else {
            generatedCredentials = { email, password: "Tu contraseña ya fue creada anteriormente. Si la olvidaste, contactanos." };
          }

          // Connect Accommodation to PortalUser
          await tx.accommodation.update({
            where: { id: accommodation.id },
            data: { portalUserId: portalUser.id }
          });
        }
      }

      return { accommodation, generatedCredentials };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating accommodation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


