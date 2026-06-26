import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifySession, hashPassword } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accommodation = await prisma.accommodation.findUnique({
      where: { id },
      include: {
        features: true
      }
    });

    if (!accommodation) {
      return NextResponse.json({ error: 'Alojamiento no encontrado' }, { status: 404 });
    }

    return NextResponse.json(accommodation);
  } catch (error: any) {
    console.error('Error fetching accommodation:', error);
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
    const { name, type, image, whatsapp, description, features, selectedPricingKeys, latitude, longitude, openingHours } = body;

    const result = await prisma.$transaction(async (tx: any) => {
      let generatedCredentials = null;
      await tx.feature.deleteMany({
        where: { accommodationId: id }
      });

      const accommodation = await tx.accommodation.update({
        where: { id },
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

      if (selectedPricingKeys && Array.isArray(selectedPricingKeys)) {
        const configs = await tx.pricingConfig.findMany({
          where: { key: { in: selectedPricingKeys } }
        });
        const totalCost = configs.reduce((sum: number, conf: any) => sum + conf.price, 0);

        const existingSub = await tx.subscription.findUnique({
          where: { accommodationId: id }
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
                accommodationId: id,
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

        // 4. Auto-generate PortalUser if they are upgraded and don't have one
        if (selectedPricingKeys.includes('plan_comercio_completo') || selectedPricingKeys.includes('plan_basico_destacado')) {
          const accCheck = await tx.accommodation.findUnique({ 
            where: { id }, 
            select: { portalUserId: true, name: true, portalUser: true } 
          });
          if (!accCheck?.portalUserId) {
            const safeName = accCheck.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
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
              data: { name: accCheck.name, email, password: hashPassword(password) }
            });
            
            await tx.accommodation.update({
              where: { id },
              data: { portalUserId: newUser.id }
            });
            
            generatedCredentials = { email, password };
          } else if (accCheck.portalUser) {
            generatedCredentials = {
              email: accCheck.portalUser.email,
              password: "Tu contraseña ya fue creada anteriormente. Si la olvidaste, contactanos."
            };
          }
        }
      }

      return { accommodation, generatedCredentials };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error updating accommodation:', error);
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
    // Primero eliminamos las características relacionadas
    await prisma.feature.deleteMany({
      where: { accommodationId: id }
    });

    // Luego eliminamos el alojamiento
    await prisma.accommodation.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting accommodation:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
