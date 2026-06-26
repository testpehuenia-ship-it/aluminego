import { prisma } from './lib/db';

async function main() {
  const tables = ['Business', 'Accommodation', 'Adventure', 'LocalService', 'Commerce'];
  
  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE ${table} ADD COLUMN latitude REAL`);
      console.log(`Added latitude to ${table}`);
    } catch (e) {
      console.log(`Failed to add latitude to ${table} (maybe already exists)`);
    }
    
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE ${table} ADD COLUMN longitude REAL`);
      console.log(`Added longitude to ${table}`);
    } catch (e) {
      console.log(`Failed to add longitude to ${table} (maybe already exists)`);
    }
  }

  // Also try to create tables that might be completely new in this version
  const newTables = [
    `CREATE TABLE IF NOT EXISTS "CommerceDetail" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "commerceId" TEXT NOT NULL,
      CONSTRAINT "CommerceDetail_commerceId_fkey" FOREIGN KEY ("commerceId") REFERENCES "Commerce" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS "EventTracking" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "entityId" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "PushSubscription" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "endpoint" TEXT NOT NULL,
      "p256dh" TEXT NOT NULL,
      "auth" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "PushHistory" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "message" TEXT NOT NULL,
      "url" TEXT,
      "sentCount" INTEGER NOT NULL DEFAULT 0,
      "errorCount" INTEGER NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "Review" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "rating" INTEGER NOT NULL,
      "comment" TEXT NOT NULL,
      "author" TEXT NOT NULL,
      "email" TEXT,
      "approved" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "businessId" TEXT,
      "accommodationId" TEXT,
      "adventureId" TEXT,
      "localServiceId" TEXT,
      "commerceId" TEXT,
      CONSTRAINT "Review_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "Review_accommodationId_fkey" FOREIGN KEY ("accommodationId") REFERENCES "Accommodation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "Review_adventureId_fkey" FOREIGN KEY ("adventureId") REFERENCES "Adventure" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "Review_localServiceId_fkey" FOREIGN KEY ("localServiceId") REFERENCES "LocalService" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "Review_commerceId_fkey" FOREIGN KEY ("commerceId") REFERENCES "Commerce" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`
  ];

  for (const q of newTables) {
    try {
      await prisma.$executeRawUnsafe(q);
      console.log('Created a new table successfully.');
    } catch (e) {
      console.log('Failed to create new table', e);
    }
  }

  console.log('Migration complete.');
}

main().catch(console.error);
