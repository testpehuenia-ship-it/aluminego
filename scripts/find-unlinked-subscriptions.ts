import { prisma } from '../lib/db';

async function main() {
  console.log('>>> Buscando suscripciones sin localServiceId...');

  const unlinkedSubs = await prisma.subscription.findMany({
    where: {
      localServiceId: null
    },
    include: {
      business: true,
      accommodation: true,
      adventure: true,
      commerce: true
    }
  });

  console.log(`Encontradas ${unlinkedSubs.length} suscripciones sin localServiceId:`);
  for (const sub of unlinkedSubs) {
    let entityType = '';
    let entityName = '';
    let details = '';

    if (sub.business) {
      entityType = 'Gastronomía (Business)';
      entityName = sub.business.name;
      details = `ID: ${sub.business.id}`;
    } else if (sub.accommodation) {
      entityType = 'Alojamientos (Accommodation)';
      entityName = sub.accommodation.name;
      details = `ID: ${sub.accommodation.id}`;
    } else if (sub.adventure) {
      entityType = 'Aventuras (Adventure)';
      entityName = sub.adventure.name;
      details = `ID: ${sub.adventure.id}`;
    } else if (sub.commerce) {
      entityType = 'Comercios (Commerce)';
      entityName = sub.commerce.name;
      details = `ID: ${sub.commerce.id}`;
    }

    console.log(`- Sub ID: ${sub.id} | Tipo: ${entityType} | Nombre: ${entityName} | ${details}`);
  }
}

main().catch(console.error);
