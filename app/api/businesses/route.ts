import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');

  try {
    const businesses = await prisma.business.findMany({
      where: categoryId ? { categoryId } : {},
      include: {
        menu: true,
        category: true,
        subscription: true
      },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(businesses);
  } catch (error: any) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, image, whatsapp, categoryId, menu, selectedPricingKeys } = body;

    // Use a transaction if we are also creating subscriptions
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the Business
      const business = await tx.business.create({
        data: {
          name,
          image,
          whatsapp,
          categoryId,
          menu: {
            create: menu 
              ? menu
                  .filter((item: any) => item.name && !isNaN(parseFloat(String(item.price))))
                  .map((item: any) => ({
                    name: item.name,
                    description: item.description || '',
                    price: parseFloat(String(item.price)),
                    image: item.image || null
                  })) 
              : []
          }
        },
        include: {
          menu: true,
          category: true
        }
      });

      // 2. Check if we have selected pricing keys
      if (selectedPricingKeys && Array.isArray(selectedPricingKeys) && selectedPricingKeys.length > 0) {
        // Fetch pricing
        const configs = await tx.pricingConfig.findMany({
          where: { key: { in: selectedPricingKeys } }
        });
        
        const totalCost = configs.reduce((sum, conf) => sum + conf.price, 0);

        if (totalCost > 0) {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 30); // Valid for 30 days

          // Create Subscription
          const sub = await tx.subscription.create({
            data: {
              clientName: business.name,
              planType: selectedPricingKeys.join(', '),
              price: totalCost,
              dueDate,
              businessId: business.id,
              // Map banners if any
              hasBannerTop: selectedPricingKeys.includes('banner_top'),
              hasBannerMiddle: selectedPricingKeys.includes('banner_middle'),
              hasBannerBottom: selectedPricingKeys.includes('banner_bottom'),
              hasBannerPortada: selectedPricingKeys.includes('portada_principal'),
            }
          });

          // Create Initial Payment (considered paid right now)
          await tx.payment.create({
            data: {
              amount: totalCost,
              subscriptionId: sub.id,
              periodPaid: dueDate // The due date this payment is covering
            }
          });
        }
      }

      return business;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error creating business:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error',
      code: error.code,
      meta: error.meta
    }, { status: 500 });
  }
}
