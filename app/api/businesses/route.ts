import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifySession, hashPassword } from '@/lib/auth';
import { cookies } from 'next/headers';

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
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;
    if (!verifySession(token)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, image, whatsapp, categoryId, menu, selectedPricingKeys, description, details, latitude, longitude, openingHours } = body;

    // Use a transaction if we are also creating subscriptions
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the Business
      const business = await tx.business.create({
        data: {
          name,
          image,
          whatsapp,
          categoryId,
          description: description || null,
          details: details || null,
          latitude: latitude ? parseFloat(String(latitude)) : null,
          longitude: longitude ? parseFloat(String(longitude)) : null,
          openingHours: openingHours || null,
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
      let generatedCredentials = null;
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
          // 3. Auto-generate PortalUser if applicable
          if (selectedPricingKeys.includes('plan_comercio_completo') || selectedPricingKeys.includes('plan_basico_destacado')) {
            const safeName = business.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const email = `${safeName}@AluminéGO.ar`;
            
            const today = new Date();
            const d = String(today.getDate()).padStart(2, '0');
            const m = String(today.getMonth() + 1).padStart(2, '0');
            const y = today.getFullYear();
            const password = `AluminéGO${d}${m}${y}`;

            // Check if user exists (to prevent unique constraint error)
            let portalUser = await tx.portalUser.findUnique({ where: { email } });
            if (!portalUser) {
              portalUser = await tx.portalUser.create({
                data: {
                  name: business.name,
                  email,
                  password: hashPassword(password),
                }
              });
              generatedCredentials = { email, password };
            } else {
              generatedCredentials = { email, password: "Tu contraseña ya fue creada anteriormente. Si la olvidaste, contactanos." };
            }

            // Connect Business to PortalUser
            await tx.business.update({
              where: { id: business.id },
              data: { portalUserId: portalUser.id }
            });
          }
        }

      return { business, generatedCredentials };
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


