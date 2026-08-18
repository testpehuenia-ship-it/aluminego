import { PrismaClient as PrismaClientLocal } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient as PrismaClientRemote } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const localAdapter = new PrismaBetterSqlite3({ url: 'dev.db' });
const localDb = new PrismaClientLocal({ adapter: localAdapter });

const tursoUrl = process.env.TURSO_DATABASE_URL?.replace(/^libsql:\/\//, 'https://');
const tursoToken = process.env.TURSO_AUTH_TOKEN;

async function sync() {
  if (!tursoUrl || !tursoToken) {
    console.log('No Turso credentials in .env');
    return;
  }

  console.log('Connecting to Turso...');
  const remoteAdapter = new PrismaLibSql({
    url: tursoUrl,
    authToken: tursoToken,
  });
  const remoteDb = new PrismaClientRemote({ adapter: remoteAdapter });

  console.log('Fetching data from Turso...');
  const [
    categories,
    portalUsers,
    pricingConfigs,
    articles,
    businesses,
    menuItems,
    accommodations,
    features,
    adventures,
    localServices,
    commerces,
    commerceDetails,
    admins,
    routes,
    mapMarkers,
    publicities,
    subscriptions,
    payments,
    reviews
  ] = await Promise.all([
    remoteDb.category.findMany(),
    remoteDb.portalUser.findMany(),
    remoteDb.pricingConfig.findMany(),
    remoteDb.article.findMany(),
    remoteDb.business.findMany(),
    remoteDb.menuItem.findMany(),
    remoteDb.accommodation.findMany(),
    remoteDb.feature.findMany(),
    remoteDb.adventure.findMany(),
    remoteDb.localService.findMany(),
    remoteDb.commerce.findMany(),
    remoteDb.commerceDetail.findMany(),
    remoteDb.admin.findMany(),
    remoteDb.route.findMany(),
    remoteDb.mapMarker.findMany(),
    remoteDb.publicity.findMany(),
    remoteDb.subscription.findMany(),
    remoteDb.payment.findMany(),
    remoteDb.review.findMany(),
  ]);

  console.log(`Retrieved:
- ${categories.length} Categories
- ${portalUsers.length} PortalUsers
- ${pricingConfigs.length} PricingConfigs
- ${articles.length} Articles
- ${businesses.length} Businesses
- ${menuItems.length} MenuItems
- ${accommodations.length} Accommodations
- ${features.length} Features
- ${adventures.length} Adventures
- ${localServices.length} LocalServices
- ${commerces.length} Commerces
- ${commerceDetails.length} CommerceDetails
- ${admins.length} Admins
- ${routes.length} Routes
- ${mapMarkers.length} MapMarkers
- ${publicities.length} Publicities
- ${subscriptions.length} Subscriptions
- ${payments.length} Payments
- ${reviews.length} Reviews
`);

  console.log('Writing into local dev.db...');

  // 1. Categories
  for (const item of categories) {
    await localDb.category.upsert({
      where: { id: item.id },
      create: item,
      update: item,
    });
  }

  // 2. PortalUsers
  for (const item of portalUsers) {
    await localDb.portalUser.upsert({
      where: { id: item.id },
      create: item,
      update: item,
    });
  }

  // 3. PricingConfigs
  for (const item of pricingConfigs) {
    await localDb.pricingConfig.upsert({
      where: { id: item.id },
      create: item,
      update: item,
    });
  }

  // 4. Articles
  for (const item of articles) {
    await localDb.article.upsert({
      where: { id: item.id },
      create: item,
      update: item,
    });
  }

  // 5. Admins
  for (const item of admins) {
    await localDb.admin.upsert({
      where: { id: item.id },
      create: item,
      update: item,
    });
  }

  // 6. Routes
  for (const item of routes) {
    await localDb.route.upsert({
      where: { id: item.id },
      create: item,
      update: item,
    });
  }

  // 7. MapMarkers
  for (const item of mapMarkers) {
    await localDb.mapMarker.upsert({
      where: { id: item.id },
      create: item,
      update: item,
    });
  }

  // 8. Publicities
  for (const item of publicities) {
    await localDb.publicity.upsert({
      where: { id: item.id },
      create: item,
      update: item,
    });
  }

  // 9. Businesses
  for (const item of businesses) {
    await localDb.business.upsert({
      where: { id: item.id },
      create: item,
      update: item,
    });
  }

  // 10. MenuItems
  for (const item of menuItems) {
    await localDb.menuItem.upsert({
      where: { id: item.id },
      create: item,
      update: item,
    });
  }

  // 11. Accommodations
  for (const item of accommodations) {
    await localDb.accommodation.upsert({
      where: { id: item.id },
      create: item,
      update: item,
    });
  }

  // 12. Features
  for (const item of features) {
    await localDb.feature.upsert({
      where: { id: item.id },
      create: item,
      update: item,
    });
  }

  // 13. Adventures
  for (const item of adventures) {
    await localDb.adventure.upsert({
      where: { id: item.id },
      create: item,
      update: item,
    });
  }

  // 14. LocalServices
  for (const item of localServices) {
    await localDb.localService.upsert({
      where: { id: item.id },
      create: item,
      update: item,
    });
  }

  // 15. Commerces
  for (const item of commerces) {
    await localDb.commerce.upsert({
      where: { id: item.id },
      create: item,
      update: item,
    });
  }

  // 16. CommerceDetails
  for (const item of commerceDetails) {
    await localDb.commerceDetail.upsert({
      where: { id: item.id },
      create: item,
      update: item,
    });
  }

  // 17. Subscriptions
  for (const item of subscriptions) {
    await localDb.subscription.upsert({
      where: { id: item.id },
      create: item,
      update: item,
    });
  }

  // 18. Payments
  for (const item of payments) {
    await localDb.payment.upsert({
      where: { id: item.id },
      create: item,
      update: item,
    });
  }

  // 19. Reviews
  for (const item of reviews) {
    await localDb.review.upsert({
      where: { id: item.id },
      create: item,
      update: item,
    });
  }

  console.log('✅ Local database synced successfully with all Turso data!');
  await localDb.$disconnect();
}

sync().catch(console.error);
