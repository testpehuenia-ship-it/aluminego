import 'dotenv/config';
import { prisma } from '../lib/db';

async function main() {
  console.log('>>> Iniciando migración de comercios/servicios de demostración a Guía Local (LocalService)...');

  // Buscamos todas las suscripciones que no tienen localServiceId
  const unlinkedSubs = await prisma.subscription.findMany({
    where: {
      localServiceId: null
    },
    include: {
      business: {
        include: {
          category: true
        }
      },
      accommodation: {
        include: {
          features: true
        }
      },
      adventure: true,
      commerce: {
        include: {
          details: true
        }
      }
    }
  });

  console.log(`Encontradas ${unlinkedSubs.length} suscripciones para migrar.`);

  for (const sub of unlinkedSubs) {
    let sourceEntity: any = null;
    let category = '';
    let subcategory = '';
    let detailsString = '';
    let address = '';

    if (sub.business) {
      sourceEntity = sub.business;
      category = 'Gastronomía';
      subcategory = sub.business.category?.title || '';
      detailsString = sub.business.details || '';
      address = (sub.business as any).address || ''; // Por las dudas
    } else if (sub.accommodation) {
      sourceEntity = sub.accommodation;
      category = 'Alojamiento';
      subcategory = sub.accommodation.type || '';
      detailsString = sub.accommodation.features.map(f => f.name).join(', ');
    } else if (sub.adventure) {
      sourceEntity = sub.adventure;
      category = 'Servicios Varios y Actividades';
      subcategory = sub.adventure.category || '';
      detailsString = sub.adventure.details || '';
    } else if (sub.commerce) {
      sourceEntity = sub.commerce;
      category = 'Comercios';
      subcategory = sub.commerce.type || '';
      detailsString = sub.commerce.details.map(d => d.name).join(', ');
    }

    if (!sourceEntity) {
      console.log(`⚠️ Suscripción ${sub.id} no tiene ninguna entidad vinculada. Omitiendo.`);
      continue;
    }

    console.log(`Migrando "${sourceEntity.name}" (${category} -> ${subcategory})...`);

    try {
      await prisma.$transaction(async (tx) => {
        // 1. Crear el LocalService
        const localService = await tx.localService.create({
          data: {
            name: sourceEntity.name.toUpperCase(),
            category,
            subcategory,
            address: address || null,
            whatsapp: sourceEntity.whatsapp || null,
            image: sourceEntity.image || null,
            description: sourceEntity.description || null,
            details: detailsString || null,
            latitude: sourceEntity.latitude || null,
            longitude: sourceEntity.longitude || null,
            openingHours: sourceEntity.openingHours || null,
            portalUserId: sourceEntity.portalUserId || null
          }
        });

        // 2. Vincular la Suscripción al nuevo LocalService
        await tx.subscription.update({
          where: { id: sub.id },
          data: {
            localServiceId: localService.id
          }
        });

        console.log(`✅ Creado LocalService ID: ${localService.id} y vinculado a Suscripción ID: ${sub.id}`);
      });
    } catch (e: any) {
      console.error(`❌ Error al migrar ${sourceEntity.name}:`, e.message);
    }
  }

  console.log('>>> Migración completada.');
}

main().catch(console.error);
