import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifySession, hashPassword } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const services = await prisma.localService.findMany({
      include: { 
        subscription: {
          include: {
            business: true,
            accommodation: true,
            adventure: true,
            commerce: true
          }
        } 
      },
      orderBy: { category: 'asc' }
    });
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching services' }, { status: 500 });
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
    const { name, category, subcategory, address, whatsapp, image, description, details, selectedPricingKeys, bonifiedKeys, discountAmount, linkedSections, latitude, longitude, openingHours } = body;
    
    const latFloat = (latitude !== undefined && latitude !== null && String(latitude).trim() !== '' && parseFloat(String(latitude)) !== 0) ? parseFloat(String(latitude)) : -39.237200;
    const lngFloat = (longitude !== undefined && longitude !== null && String(longitude).trim() !== '' && parseFloat(String(longitude)) !== 0) ? parseFloat(String(longitude)) : -70.931400;
    const finalAddress = (address && address.trim().length > 0) ? address.trim() : 'Aluminé';
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
      const upperName = name ? name.toUpperCase() : '';
      const service = await tx.localService.create({
        data: { name: upperName, category, subcategory, address: finalAddress, whatsapp, image, description, details, latitude: latFloat, longitude: lngFloat, openingHours: finalOpeningHours }
      });

      if (selectedPricingKeys && Array.isArray(selectedPricingKeys) && selectedPricingKeys.length > 0) {
        const configs = await tx.pricingConfig.findMany({
          where: { key: { in: selectedPricingKeys } }
        });
        
        const sectionMultiplier = (selectedPricingKeys.includes('plan_comercio_completo') && linkedSections && Array.isArray(linkedSections))
          ? Math.max(1, linkedSections.length)
          : 1;

        let totalCost = configs.reduce((sum: number, conf: any) => {
          if (bonifiedKeys && Array.isArray(bonifiedKeys) && bonifiedKeys.includes(conf.key)) {
            return sum;
          }
          return sum + conf.price;
        }, 0);

        totalCost = totalCost * sectionMultiplier;

        if (discountAmount && typeof discountAmount === 'number') {
          totalCost -= discountAmount;
        }
        if (totalCost < 0) totalCost = 0;

        if (selectedPricingKeys && selectedPricingKeys.length > 0) {
          const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          const newSub = await tx.subscription.create({
            data: {
              clientName: upperName,
              planType: selectedPricingKeys.join(', '),
              price: totalCost,
              dueDate,
              localServiceId: service.id,
              hasBannerTop: selectedPricingKeys.includes('banner_top'),
              hasBannerMiddle: selectedPricingKeys.includes('banner_middle'),
              hasBannerBottom: selectedPricingKeys.includes('banner_bottom'),
              hasBannerPortada: selectedPricingKeys.includes('portada_principal'),
              bonifiedKeys: Array.isArray(bonifiedKeys) ? bonifiedKeys.join(', ') : '',
              discountAmount: discountAmount || 0,
            }
          });

          await tx.payment.create({
            data: {
              amount: totalCost,
              subscriptionId: newSub.id,
              periodPaid: dueDate
            }
          });

          // Sync linked sections
          if (linkedSections && Array.isArray(linkedSections) && selectedPricingKeys.includes('plan_comercio_completo')) {
            if (linkedSections.includes('gastronomia')) {
              const catTitle = subcategory || category;
              let bizCat = await tx.category.findFirst({ where: { title: { equals: catTitle } } });
              if (!bizCat) {
                const safeLink = '/' + catTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                bizCat = await tx.category.create({ data: { title: catTitle, link: safeLink, image: image || '' } });
              }
              await tx.business.create({
                data: {
                  name: upperName,
                  whatsapp: whatsapp || '',
                  image: image || '',
                  categoryId: bizCat.id,
                  latitude: latFloat,
                  longitude: lngFloat,
                  description: description || '',
                  details: details || '',
                  openingHours: openingHours || null,
                  subscription: { connect: { id: newSub.id } }
                }
              });
            }
            if (linkedSections.includes('alojamiento')) {
              const detailArray = details ? details.split(',').map((d: string) => d.trim()).filter(Boolean) : [];
              await tx.accommodation.create({
                data: {
                  name: upperName,
                  whatsapp: whatsapp || '',
                  image: image || '',
                  type: subcategory || category || 'Cabañas',
                  latitude: latFloat,
                  longitude: lngFloat,
                  description: description || '',
                  openingHours: openingHours || null,
                  subscription: { connect: { id: newSub.id } },
                  features: {
                    create: detailArray.map((featName: string) => ({ name: featName }))
                  }
                }
              });
            }
            if (linkedSections.includes('aventuras')) {
              await tx.adventure.create({
                data: {
                  name: upperName,
                  whatsapp: whatsapp || '',
                  image: image || '',
                  category: subcategory || category || 'Trekking',
                  details: details || '',
                  latitude: latFloat,
                  longitude: lngFloat,
                  description: description || '',
                  openingHours: openingHours || null,
                  subscription: { connect: { id: newSub.id } }
                }
              });
            }
            if (linkedSections.includes('comercios')) {
              const detailArray = details ? details.split(',').map((d: string) => d.trim()).filter(Boolean) : [];
              await tx.commerce.create({
                data: {
                  name: upperName,
                  whatsapp: whatsapp || '',
                  image: image || '',
                  type: subcategory || category || 'Tienda',
                  latitude: latFloat,
                  longitude: lngFloat,
                  description: description || '',
                  openingHours: openingHours || null,
                  subscription: { connect: { id: newSub.id } },
                  details: {
                    create: detailArray.map((detailName: string) => ({ name: detailName }))
                  }
                }
              });
            }
          }

          // 4. Auto-generate PortalUser if they have portal plans
          if (selectedPricingKeys.includes('plan_comercio_completo') || selectedPricingKeys.includes('plan_basico_destacado')) {
            const safeName = service.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            let email = `${safeName}@AluminéGO.ar`;
            const today = new Date();
            const password = `AluminéGO${String(today.getDate()).padStart(2, '0')}${String(today.getMonth() + 1).padStart(2, '0')}${today.getFullYear()}`;
            
            let portalUser = await tx.portalUser.findUnique({ where: { email } });
            let counter = 1;
            while (portalUser) {
              email = `${safeName}${counter}@AluminéGO.ar`;
              portalUser = await tx.portalUser.findUnique({ where: { email } });
              counter++;
            }
            
            const newUser = await tx.portalUser.create({
              data: { name: service.name, email, password: hashPassword(password) }
            });
            
            await tx.localService.update({
              where: { id: service.id },
              data: { portalUserId: newUser.id }
            });
            
            // Also link newly created businesses, accommodations, adventures, commerces if any
            const subDetails = await tx.subscription.findUnique({ where: { id: newSub.id }, select: { businessId: true, accommodationId: true, adventureId: true, commerceId: true } });
            if (subDetails?.businessId) {
              await tx.business.update({ where: { id: subDetails.businessId }, data: { portalUserId: newUser.id } });
            }
            if (subDetails?.accommodationId) {
              await tx.accommodation.update({ where: { id: subDetails.accommodationId }, data: { portalUserId: newUser.id } });
            }
            if (subDetails?.adventureId) {
              await tx.adventure.update({ where: { id: subDetails.adventureId }, data: { portalUserId: newUser.id } });
            }
            if (subDetails?.commerceId) {
              await tx.commerce.update({ where: { id: subDetails.commerceId }, data: { portalUserId: newUser.id } });
            }
            
            generatedCredentials = { email, password };
          }
        }
      }
      return { localService: service, generatedCredentials };
    }, { maxWait: 15000, timeout: 30000 });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error creating service' }, { status: 500 });
  }
}


