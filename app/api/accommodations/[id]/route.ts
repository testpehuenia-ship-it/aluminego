import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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
    const { id } = await params;
    const body = await request.json();
    const { name, type, image, whatsapp, description, features, selectedPricingKeys } = body;

    const result = await prisma.$transaction(async (tx: any) => {
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
      }

      return accommodation;
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
