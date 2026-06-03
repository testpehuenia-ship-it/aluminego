import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        menu: true,
        category: true,
        subscription: true
      }
    });

    if (!business) {
      return NextResponse.json({ error: 'Comercio no encontrado' }, { status: 404 });
    }

    return NextResponse.json(business);
  } catch (error: any) {
    console.error('Error fetching business:', error);
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
    const { name, image, whatsapp, categoryId, menu, selectedPricingKeys } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID del comercio no proporcionado' }, { status: 400 });
    }

    // Usamos una transacción para asegurar que todo se actualice o nada
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Actualizar el comercio
      const updatedBusiness = await tx.business.update({
        where: { id },
        data: {
          name,
          image,
          whatsapp,
          categoryId,
        }
      });

      // 2. Si viene el menú, lo actualizamos
      if (menu && Array.isArray(menu)) {
        // Borramos items anteriores
        await tx.menuItem.deleteMany({
          where: { businessId: id }
        });

        // Filtramos y preparamos los nuevos
        const validMenuItems = menu
          .filter((item: any) => item.name && !isNaN(parseFloat(String(item.price))))
          .map((item: any) => ({
            name: item.name,
            description: item.description || '',
            price: parseFloat(String(item.price)),
            image: item.image || null,
            businessId: id
          }));

        if (validMenuItems.length > 0) {
          await tx.menuItem.createMany({
            data: validMenuItems
          });
        }
      }

      // 3. Gestionar Suscripción
      if (selectedPricingKeys && Array.isArray(selectedPricingKeys)) {
        const configs = await tx.pricingConfig.findMany({
          where: { key: { in: selectedPricingKeys } }
        });
        
        const totalCost = configs.reduce((sum: number, conf: any) => sum + conf.price, 0);
        
        // Buscar suscripción existente
        const existingSub = await tx.subscription.findUnique({
          where: { businessId: id }
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
                businessId: id,
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
          // Si totalCost es 0, podríamos eliminar la suscripción o actualizar a $0
          if (existingSub) {
            await tx.subscription.delete({
              where: { id: existingSub.id }
            });
          }
        }
      }

      return updatedBusiness;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error updating business:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error',
      code: error.code,
      meta: error.meta
    }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.$transaction(async (tx: any) => {
      await tx.menuItem.deleteMany({
        where: { businessId: id }
      });
      await tx.business.delete({
        where: { id }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting business:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
