import 'dotenv/config';
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  console.log('>>> Analizando correspondencias entre tablas de categorías y Guía Local (LocalService) en Turso...');

  // 1. Obtener todos los registros de cada tabla
  const localServices = await client.execute('SELECT id, name, category, subcategory, whatsapp FROM "LocalService"');
  const commerceTable = await client.execute('SELECT id, name, type, whatsapp FROM "Commerce"');
  const businessTable = await client.execute('SELECT id, name, whatsapp FROM "Business"');
  const accommodationTable = await client.execute('SELECT id, name, whatsapp FROM "Accommodation"');
  const adventureTable = await client.execute('SELECT id, name, whatsapp FROM "Adventure"');

  const subscriptions = await client.execute(
    'SELECT id, planType, localServiceId, businessId, accommodationId, adventureId, commerceId FROM "Subscription"'
  );

  console.log(`\nEstadísticas Generales:`);
  console.log(`- LocalServices: ${localServices.rows.length}`);
  console.log(`- Commerce (Comercios): ${commerceTable.rows.length}`);
  console.log(`- Business (Gastronomía): ${businessTable.rows.length}`);
  console.log(`- Accommodation (Alojamientos): ${accommodationTable.rows.length}`);
  console.log(`- Adventure (Aventuras/Actividades): ${adventureTable.rows.length}`);
  console.log(`- Subscriptions: ${subscriptions.rows.length}`);

  // 2. Mapear suscripciones
  const subByLocalServiceId = new Map();
  const subByCommerceId = new Map();
  const subByBusinessId = new Map();
  const subByAccommodationId = new Map();
  const subByAdventureId = new Map();

  for (const row of subscriptions.rows) {
    if (row.localServiceId) subByLocalServiceId.set(row.localServiceId, row);
    if (row.commerceId) subByCommerceId.set(row.commerceId, row);
    if (row.businessId) subByBusinessId.set(row.businessId, row);
    if (row.accommodationId) subByAccommodationId.set(row.accommodationId, row);
    if (row.adventureId) subByAdventureId.set(row.adventureId, row);
  }

  // 3. Revisar comercios huérfanos de LocalService
  // Es decir, Commerce que no tiene una suscripción vinculada a un LocalService
  console.log(`\n--- Análisis de "Commerce" (Comercios) ---`);
  let commerceUnlinked = 0;
  for (const com of commerceTable.rows) {
    const sub = subByCommerceId.get(com.id);
    if (!sub || !sub.localServiceId) {
      console.log(`⚠️ Commerce unlinked: "${com.name}" (ID: ${com.id}) - Sub: ${sub ? 'Yes, but no localServiceId' : 'No'}`);
      commerceUnlinked++;
    }
  }
  console.log(`Total Commerce unlinked: ${commerceUnlinked}`);

  console.log(`\n--- Análisis de "Business" (Gastronomía) ---`);
  let businessUnlinked = 0;
  for (const biz of businessTable.rows) {
    const sub = subByBusinessId.get(biz.id);
    if (!sub || !sub.localServiceId) {
      console.log(`⚠️ Business unlinked: "${biz.name}" (ID: ${biz.id}) - Sub: ${sub ? 'Yes, but no localServiceId' : 'No'}`);
      businessUnlinked++;
    }
  }
  console.log(`Total Business unlinked: ${businessUnlinked}`);

  console.log(`\n--- Análisis de "Accommodation" (Alojamientos) ---`);
  let accommodationUnlinked = 0;
  for (const acc of accommodationTable.rows) {
    const sub = subByAccommodationId.get(acc.id);
    if (!sub || !sub.localServiceId) {
      console.log(`⚠️ Accommodation unlinked: "${acc.name}" (ID: ${acc.id}) - Sub: ${sub ? 'Yes, but no localServiceId' : 'No'}`);
      accommodationUnlinked++;
    }
  }
  console.log(`Total Accommodation unlinked: ${accommodationUnlinked}`);

  console.log(`\n--- Análisis de "Adventure" (Aventuras) ---`);
  let adventureUnlinked = 0;
  for (const adv of adventureTable.rows) {
    const sub = subByAdventureId.get(adv.id);
    if (!sub || !sub.localServiceId) {
      console.log(`⚠️ Adventure unlinked: "${adv.name}" (ID: ${adv.id}) - Sub: ${sub ? 'Yes, but no localServiceId' : 'No'}`);
      adventureUnlinked++;
    }
  }
  console.log(`Total Adventure unlinked: ${adventureUnlinked}`);

  client.close();
}

main().catch(console.error);
