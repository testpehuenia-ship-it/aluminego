import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifySession, hashPassword } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;
    // if (!verifySession(token)) {
    //   return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    // }
    const { id } = await params;
    console.log('[DEBUG PUT] id:', id);
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

    // 1. Fetch existing service, subscription, and portal user details in a single query outside the transaction
    const existingService = await prisma.localService.findUnique({
      where: { id },
      include: {
        portalUser: true,
        subscription: {
          include: {
            business: true,
            accommodation: true,
            adventure: true,
            commerce: true
          }
        }
      }
    });

    if (!existingService) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 });
    }

    // 2. Fetch pricing configs outside the transaction
    let configs: any[] = [];
    if (selectedPricingKeys && Array.isArray(selectedPricingKeys)) {
      configs = await prisma.pricingConfig.findMany({
        where: { key: { in: selectedPricingKeys } }
      });
    }

    // 3. Fetch existing category for Gastronomía outside the transaction if needed
    const catTitle = subcategory || category;
    let existingBizCat = null;
    if (selectedPricingKeys && selectedPricingKeys.includes('plan_comercio_completo') && linkedSections && Array.isArray(linkedSections) && linkedSections.includes('gastronomia') && catTitle) {
      existingBizCat = await prisma.category.findFirst({
        where: { title: { equals: catTitle } }
      });
    }

    // 4. Fetch matching portal users in bulk outside the transaction if portal user needs to be auto-generated
    let matchingPortalUsers: { email: string }[] = [];
    const safeName = name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '';
    const needsPortalUser = selectedPricingKeys && (selectedPricingKeys.includes('plan_comercio_completo') || selectedPricingKeys.includes('plan_basico_destacado'));
    if (needsPortalUser && !existingService.portalUserId && safeName) {
      matchingPortalUsers = await prisma.portalUser.findMany({
        where: { email: { startsWith: safeName } },
        select: { email: true }
      });
    }

    const result = await prisma.$transaction(async (tx: any) => {
      let generatedCredentials = null;
      const upperName = name ? name.toUpperCase() : '';
      const updatedService = await tx.localService.update({
        where: { id },
        data: { name: upperName, category, subcategory, address: finalAddress, whatsapp, image, description, details, latitude: latFloat, longitude: lngFloat, openingHours: finalOpeningHours }
      });

      if (selectedPricingKeys && Array.isArray(selectedPricingKeys)) {
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

        const existingSub = existingService.subscription;
        let targetSubId = existingSub?.id || null;

        if (selectedPricingKeys && selectedPricingKeys.length > 0) {
          const dueDate = existingSub ? existingSub.dueDate : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

          if (existingSub) {
            await tx.subscription.update({
              where: { id: existingSub.id },
              data: {
                clientName: upperName,
                planType: selectedPricingKeys.join(', '),
                price: totalCost,
                hasBannerTop: selectedPricingKeys.includes('banner_top'),
                hasBannerMiddle: selectedPricingKeys.includes('banner_middle'),
                hasBannerBottom: selectedPricingKeys.includes('banner_bottom'),
                hasBannerPortada: selectedPricingKeys.includes('portada_principal'),
                bonifiedKeys: Array.isArray(bonifiedKeys) ? bonifiedKeys.join(', ') : '',
                discountAmount: discountAmount || 0,
              }
            });
          } else {
            const newSub = await tx.subscription.create({
              data: {
                clientName: upperName,
                planType: selectedPricingKeys.join(', '),
                price: totalCost,
                dueDate,
                localServiceId: id,
                hasBannerTop: selectedPricingKeys.includes('banner_top'),
                hasBannerMiddle: selectedPricingKeys.includes('banner_middle'),
                hasBannerBottom: selectedPricingKeys.includes('banner_bottom'),
                hasBannerPortada: selectedPricingKeys.includes('portada_principal'),
                bonifiedKeys: Array.isArray(bonifiedKeys) ? bonifiedKeys.join(', ') : '',
                discountAmount: discountAmount || 0,
              }
            });
            targetSubId = newSub.id;

            await tx.payment.create({
              data: {
                amount: totalCost,
                subscriptionId: newSub.id,
                periodPaid: dueDate
              }
            });
          }
          
          if (targetSubId) {
            if (linkedSections && Array.isArray(linkedSections) && selectedPricingKeys.includes('plan_comercio_completo')) {
              // Gastronomia
              if (linkedSections.includes('gastronomia')) {
                const catTitle = subcategory || category;
                let bizCat = existingBizCat;
                if (!bizCat && catTitle) {
                  const safeLink = '/' + catTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  bizCat = await tx.category.create({ data: { title: catTitle, link: safeLink, image: image || '' } });
                }
                const bizData = {
                  name: upperName,
                  whatsapp: whatsapp || '',
                  image: image || '',
                  categoryId: bizCat.id,
                  latitude: latFloat,
                  longitude: lngFloat,
                  description: description || '',
                  details: details || '',
                  openingHours: openingHours || null
                };
                if (!existingSub?.business) {
                  await tx.business.create({
                    data: { ...bizData, subscription: { connect: { id: targetSubId } } }
                  });
                } else {
                  await tx.business.update({
                    where: { id: existingSub.business.id },
                    data: bizData
                  });
                }
              } else if (existingSub?.business) {
                await tx.subscription.update({ where: { id: existingSub.id }, data: { businessId: null } });
                await tx.menuItem.deleteMany({ where: { businessId: existingSub.business.id } });
                await tx.eventTracking.deleteMany({ where: { entityId: existingSub.business.id } });
                await tx.business.delete({ where: { id: existingSub.business.id } });
              }

              // Alojamiento
              if (linkedSections.includes('alojamiento')) {
                const detailArray = details ? details.split(',').map((d: string) => d.trim()).filter(Boolean) : [];
                const accData = {
                  name: upperName,
                  whatsapp: whatsapp || '',
                  image: image || '',
                  type: subcategory || category || 'Cabañas',
                  latitude: latFloat,
                  longitude: lngFloat,
                  description: description || '',
                  openingHours: openingHours || null
                };
                if (!existingSub?.accommodation) {
                  await tx.accommodation.create({
                    data: {
                      ...accData,
                      subscription: { connect: { id: targetSubId } },
                      features: { create: detailArray.map((featName: string) => ({ name: featName })) }
                    }
                  });
                } else {
                  await tx.accommodation.update({
                    where: { id: existingSub.accommodation.id },
                    data: accData
                  });
                  await tx.feature.deleteMany({ where: { accommodationId: existingSub.accommodation.id } });
                  if (detailArray.length > 0) {
                    await tx.feature.createMany({
                      data: detailArray.map((featName: string) => ({ name: featName, accommodationId: existingSub.accommodation.id }))
                    });
                  }
                }
              } else if (existingSub?.accommodation) {
                await tx.subscription.update({ where: { id: existingSub.id }, data: { accommodationId: null } });
                await tx.feature.deleteMany({ where: { accommodationId: existingSub.accommodation.id } });
                await tx.eventTracking.deleteMany({ where: { entityId: existingSub.accommodation.id } });
                await tx.accommodation.delete({ where: { id: existingSub.accommodation.id } });
              }

              // Aventuras
              if (linkedSections.includes('aventuras')) {
                const advData = {
                  name: upperName,
                  whatsapp: whatsapp || '',
                  image: image || '',
                  category: subcategory || category || 'Trekking',
                  details: details || '',
                  latitude: latFloat,
                  longitude: lngFloat,
                  description: description || '',
                  openingHours: openingHours || null
                };
                if (!existingSub?.adventure) {
                  await tx.adventure.create({
                    data: { ...advData, subscription: { connect: { id: targetSubId } } }
                  });
                } else {
                  await tx.adventure.update({
                    where: { id: existingSub.adventure.id },
                    data: advData
                  });
                }
              } else if (existingSub?.adventure) {
                await tx.subscription.update({ where: { id: existingSub.id }, data: { adventureId: null } });
                await tx.eventTracking.deleteMany({ where: { entityId: existingSub.adventure.id } });
                await tx.adventure.delete({ where: { id: existingSub.adventure.id } });
              }

              // Comercios
              if (linkedSections.includes('comercios')) {
                const detailArray = details ? details.split(',').map((d: string) => d.trim()).filter(Boolean) : [];
                const commData = {
                  name: upperName,
                  whatsapp: whatsapp || '',
                  image: image || '',
                  type: subcategory || category || 'Tienda',
                  latitude: latFloat,
                  longitude: lngFloat,
                  description: description || '',
                  openingHours: openingHours || null
                };
                if (!existingSub?.commerce) {
                  await tx.commerce.create({
                    data: {
                      ...commData,
                      subscription: { connect: { id: targetSubId } },
                      details: { create: detailArray.map((detailName: string) => ({ name: detailName })) }
                    }
                  });
                } else {
                  await tx.commerce.update({
                    where: { id: existingSub.commerce.id },
                    data: commData
                  });
                  await tx.commerceDetail.deleteMany({ where: { commerceId: existingSub.commerce.id } });
                  if (detailArray.length > 0) {
                    await tx.commerceDetail.createMany({
                      data: detailArray.map((detailName: string) => ({ name: detailName, commerceId: existingSub.commerce.id }))
                    });
                  }
                }
              } else if (existingSub?.commerce) {
                await tx.subscription.update({ where: { id: existingSub.id }, data: { commerceId: null } });
                await tx.commerceDetail.deleteMany({ where: { commerceId: existingSub.commerce.id } });
                await tx.eventTracking.deleteMany({ where: { entityId: existingSub.commerce.id } });
                await tx.commerce.delete({ where: { id: existingSub.commerce.id } });
              }
            } else {
              // Delete all links if they don't have comercio_completo
              if (existingSub?.business) {
                await tx.subscription.update({ where: { id: existingSub.id }, data: { businessId: null } });
                await Promise.all([
                  tx.menuItem.deleteMany({ where: { businessId: existingSub.business.id } }),
                  tx.eventTracking.deleteMany({ where: { entityId: existingSub.business.id } }),
                  tx.business.delete({ where: { id: existingSub.business.id } })
                ]);
              }
              if (existingSub?.accommodation) {
                await tx.subscription.update({ where: { id: existingSub.id }, data: { accommodationId: null } });
                await Promise.all([
                  tx.feature.deleteMany({ where: { accommodationId: existingSub.accommodation.id } }),
                  tx.eventTracking.deleteMany({ where: { entityId: existingSub.accommodation.id } }),
                  tx.accommodation.delete({ where: { id: existingSub.accommodation.id } })
                ]);
              }
              if (existingSub?.adventure) {
                await tx.subscription.update({ where: { id: existingSub.id }, data: { adventureId: null } });
                await Promise.all([
                  tx.eventTracking.deleteMany({ where: { entityId: existingSub.adventure.id } }),
                  tx.adventure.delete({ where: { id: existingSub.adventure.id } })
                ]);
              }
              if (existingSub?.commerce) {
                await tx.subscription.update({ where: { id: existingSub.id }, data: { commerceId: null } });
                await Promise.all([
                  tx.commerceDetail.deleteMany({ where: { commerceId: existingSub.commerce.id } }),
                  tx.eventTracking.deleteMany({ where: { entityId: existingSub.commerce.id } }),
                  tx.commerce.delete({ where: { id: existingSub.commerce.id } })
                ]);
              }
            }
          }
          
        } else {
          if (existingSub) {
            await tx.subscription.update({
              where: { id: existingSub.id },
              data: { businessId: null, accommodationId: null, adventureId: null, commerceId: null }
            });
            const cleanupTasks = [];
            if (existingSub.business) {
              cleanupTasks.push(
                tx.menuItem.deleteMany({ where: { businessId: existingSub.business.id } }),
                tx.eventTracking.deleteMany({ where: { entityId: existingSub.business.id } }),
                tx.business.delete({ where: { id: existingSub.business.id } })
              );
            }
            if (existingSub.accommodation) {
              cleanupTasks.push(
                tx.feature.deleteMany({ where: { accommodationId: existingSub.accommodation.id } }),
                tx.eventTracking.deleteMany({ where: { entityId: existingSub.accommodation.id } }),
                tx.accommodation.delete({ where: { id: existingSub.accommodation.id } })
              );
            }
            if (existingSub.adventure) {
              cleanupTasks.push(
                tx.eventTracking.deleteMany({ where: { entityId: existingSub.adventure.id } }),
                tx.adventure.delete({ where: { id: existingSub.adventure.id } })
              );
            }
            if (existingSub.commerce) {
              cleanupTasks.push(
                tx.commerceDetail.deleteMany({ where: { commerceId: existingSub.commerce.id } }),
                tx.eventTracking.deleteMany({ where: { entityId: existingSub.commerce.id } }),
                tx.commerce.delete({ where: { id: existingSub.commerce.id } })
              );
            }
            cleanupTasks.push(tx.subscription.delete({ where: { id: existingSub.id } }));
            
            // Delete banners case-insensitively
            const allBanners = await tx.publicity.findMany({});
            const bannerIds = allBanners
              .filter((b: any) => b.title?.toLowerCase() === name.toLowerCase())
              .map((b: any) => b.id);
            if (bannerIds.length > 0) {
              cleanupTasks.push(tx.publicity.deleteMany({ where: { id: { in: bannerIds } } }));
            }
            
            await Promise.all(cleanupTasks);
          }
        }
        
        // 4. Auto-generate PortalUser if they are upgraded and don't have one
        if (selectedPricingKeys && (selectedPricingKeys.includes('plan_comercio_completo') || selectedPricingKeys.includes('plan_basico_destacado'))) {
          if (!existingService?.portalUserId) {
            const existingEmails = new Set(matchingPortalUsers.map(u => u.email));
            let email = `${safeName}@aluminego.ar`;
            let counter = 1;
            while (existingEmails.has(email)) {
              email = `${safeName}${counter}@aluminego.ar`;
              counter++;
            }
            
            const today = new Date();
            const password = `aluminego${String(today.getDate()).padStart(2, '0')}${String(today.getMonth() + 1).padStart(2, '0')}${today.getFullYear()}`;
            
            const newUser = await tx.portalUser.create({
              data: { name: upperName, email, password: hashPassword(password) }
            });
            
            await tx.localService.update({
              where: { id },
              data: { portalUserId: newUser.id }
            });
            
            // Link any associated sub-entities
            if (targetSubId) {
              const subDetails = await tx.subscription.findUnique({
                where: { id: targetSubId },
                select: { businessId: true, accommodationId: true, adventureId: true, commerceId: true }
              });
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
            }
            
            generatedCredentials = { email, password };
          } else if (existingService.portalUser) {
            generatedCredentials = {
              email: existingService.portalUser.email,
              password: "Tu contraseña ya fue creada anteriormente. Si la olvidaste, contactanos."
            };
          }
        }
      }

      return { updatedService, generatedCredentials };
    }, { maxWait: 15000, timeout: 30000 });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error updating service' }, { status: 500 });
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

    await prisma.$transaction(async (tx: any) => {
      // Load the service and its subscription with all linked entities
      const service = await tx.localService.findUnique({
        where: { id },
        include: {
          subscription: {
            include: {
              business: true,
              accommodation: true,
              adventure: true,
              commerce: true,
            }
          }
        }
      });

      if (!service) return;

      const sub = service.subscription;

      if (sub) {
        // Save entity names for publicity cleanup BEFORE deleting
        const bizName = sub.business?.name;
        const accName = sub.accommodation?.name;
        const advName = sub.adventure?.name;
        const commName = sub.commerce?.name;
        const bizId = sub.business?.id;
        const accId = sub.accommodation?.id;
        const advId = sub.adventure?.id;
        const commId = sub.commerce?.id;

        // 1. Delete payments (cascade on subscription delete may not work in all DBs)
        await tx.payment.deleteMany({ where: { subscriptionId: sub.id } });

        // 2. Null out subscription's entity foreign keys to allow safe entity deletion
        await tx.subscription.update({
          where: { id: sub.id },
          data: {
            businessId: null,
            accommodationId: null,
            adventureId: null,
            commerceId: null,
            localServiceId: null,
          }
        });

        // 3. Delete linked entity data and entities
        const cleanupTasks = [];
        if (bizId) {
          cleanupTasks.push(
            tx.menuItem.deleteMany({ where: { businessId: bizId } }),
            tx.review.deleteMany({ where: { businessId: bizId } }),
            tx.eventTracking.deleteMany({ where: { entityId: bizId } }),
            tx.business.delete({ where: { id: bizId } })
          );
        }

        if (accId) {
          cleanupTasks.push(
            tx.feature.deleteMany({ where: { accommodationId: accId } }),
            tx.review.deleteMany({ where: { accommodationId: accId } }),
            tx.eventTracking.deleteMany({ where: { entityId: accId } }),
            tx.accommodation.delete({ where: { id: accId } })
          );
        }

        if (advId) {
          cleanupTasks.push(
            tx.review.deleteMany({ where: { adventureId: advId } }),
            tx.eventTracking.deleteMany({ where: { entityId: advId } }),
            tx.adventure.delete({ where: { id: advId } })
          );
        }

        if (commId) {
          cleanupTasks.push(
            tx.commerceDetail.deleteMany({ where: { commerceId: commId } }),
            tx.review.deleteMany({ where: { commerceId: commId } }),
            tx.eventTracking.deleteMany({ where: { entityId: commId } }),
            tx.commerce.delete({ where: { id: commId } })
          );
        }
        await Promise.all(cleanupTasks);

        // 4. Delete subscription itself
        await tx.subscription.delete({ where: { id: sub.id } });
      }

      // Delete the portal user if it only belongs to this local service
      if (service.portalUserId) {
        const portalUser = await tx.portalUser.findUnique({
          where: { id: service.portalUserId },
          include: {
            businesses: true,
            accommodations: true,
            adventures: true,
            commerces: true,
            localServices: true,
          }
        });
        if (portalUser) {
          const totalLinked =
            portalUser.businesses.length +
            portalUser.accommodations.length +
            portalUser.adventures.length +
            portalUser.commerces.length +
            portalUser.localServices.length;
          if (totalLinked <= 1) {
            await tx.portalUser.delete({ where: { id: service.portalUserId } });
          }
        }
      }

      // Delete publicity banners matching this service name (case-insensitive)
      const allBanners = await tx.publicity.findMany({});
      const bannerIdsToDelete = allBanners
        .filter((b: any) => b.title?.toLowerCase() === service.name.toLowerCase())
        .map((b: any) => b.id);
      if (bannerIdsToDelete.length > 0) {
        await tx.publicity.deleteMany({ where: { id: { in: bannerIdsToDelete } } });
      }

      // Delete reviews for the local service itself
      await tx.review.deleteMany({ where: { localServiceId: id } });

      // Finally delete the local service itself
      await tx.localService.delete({ where: { id } });
    }, { maxWait: 15000, timeout: 30000 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting local service:', error);
    return NextResponse.json({ error: 'Error deleting service' }, { status: 500 });
  }
}
