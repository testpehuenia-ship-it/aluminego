import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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
    const body = await request.json();
    const { name, type, image, whatsapp, description, features, selectedPricingKeys } = body;

    const result = await prisma.$transaction(async (tx: any) => {
      const accommodation = await tx.accommodation.create({
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
      }

      return accommodation;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating accommodation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
