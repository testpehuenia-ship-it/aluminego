import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const adventures = await prisma.adventure.findMany({
      include: { subscription: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(adventures);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching adventures' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, image, whatsapp, category, details, selectedPricingKeys } = body;

    const result = await prisma.$transaction(async (tx: any) => {
      const adventure = await tx.adventure.create({
        data: { name, description, image, whatsapp, category, details: details || '' }
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
              adventureId: adventure.id,
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

      return adventure;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error creating adventure' }, { status: 500 });
  }
}
