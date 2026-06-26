import 'dotenv/config';
import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL!;
const authToken = process.env.TURSO_AUTH_TOKEN!;

const db = createClient({ url, authToken });

// All ALTER TABLE statements needed to bring old tables up to the new schema
const alterStatements = [
  // Business
  `ALTER TABLE "Business" ADD COLUMN "description" TEXT`,
  `ALTER TABLE "Business" ADD COLUMN "details" TEXT`,
  `ALTER TABLE "Business" ADD COLUMN "latitude" REAL`,
  `ALTER TABLE "Business" ADD COLUMN "longitude" REAL`,
  `ALTER TABLE "Business" ADD COLUMN "portalUserId" TEXT`,
  `ALTER TABLE "Business" ADD COLUMN "openingHours" TEXT`,
  `ALTER TABLE "Business" ADD COLUMN "categoryId" TEXT NOT NULL DEFAULT ''`,
  // Accommodation
  `ALTER TABLE "Accommodation" ADD COLUMN "description" TEXT`,
  `ALTER TABLE "Accommodation" ADD COLUMN "latitude" REAL`,
  `ALTER TABLE "Accommodation" ADD COLUMN "longitude" REAL`,
  `ALTER TABLE "Accommodation" ADD COLUMN "portalUserId" TEXT`,
  `ALTER TABLE "Accommodation" ADD COLUMN "openingHours" TEXT`,
  `ALTER TABLE "Accommodation" ADD COLUMN "type" TEXT NOT NULL DEFAULT ''`,
  // Adventure
  `ALTER TABLE "Adventure" ADD COLUMN "description" TEXT`,
  `ALTER TABLE "Adventure" ADD COLUMN "latitude" REAL`,
  `ALTER TABLE "Adventure" ADD COLUMN "longitude" REAL`,
  `ALTER TABLE "Adventure" ADD COLUMN "portalUserId" TEXT`,
  `ALTER TABLE "Adventure" ADD COLUMN "openingHours" TEXT`,
  `ALTER TABLE "Adventure" ADD COLUMN "category" TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE "Adventure" ADD COLUMN "details" TEXT NOT NULL DEFAULT ''`,
  // LocalService
  `ALTER TABLE "LocalService" ADD COLUMN "description" TEXT`,
  `ALTER TABLE "LocalService" ADD COLUMN "details" TEXT`,
  `ALTER TABLE "LocalService" ADD COLUMN "latitude" REAL`,
  `ALTER TABLE "LocalService" ADD COLUMN "longitude" REAL`,
  `ALTER TABLE "LocalService" ADD COLUMN "portalUserId" TEXT`,
  `ALTER TABLE "LocalService" ADD COLUMN "openingHours" TEXT`,
  `ALTER TABLE "LocalService" ADD COLUMN "subcategory" TEXT`,
  `ALTER TABLE "LocalService" ADD COLUMN "address" TEXT`,
  `ALTER TABLE "LocalService" ADD COLUMN "image" TEXT`,
  // Commerce
  `ALTER TABLE "Commerce" ADD COLUMN "description" TEXT`,
  `ALTER TABLE "Commerce" ADD COLUMN "details" TEXT`,
  `ALTER TABLE "Commerce" ADD COLUMN "latitude" REAL`,
  `ALTER TABLE "Commerce" ADD COLUMN "longitude" REAL`,
  `ALTER TABLE "Commerce" ADD COLUMN "portalUserId" TEXT`,
  `ALTER TABLE "Commerce" ADD COLUMN "openingHours" TEXT`,
  `ALTER TABLE "Commerce" ADD COLUMN "slug" TEXT`,
  `ALTER TABLE "Commerce" ADD COLUMN "type" TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE "Commerce" ADD COLUMN "locality" TEXT DEFAULT 'Aluminé'`,
  // Subscription new fields
  `ALTER TABLE "Subscription" ADD COLUMN "hasBannerTop" BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE "Subscription" ADD COLUMN "hasBannerMiddle" BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE "Subscription" ADD COLUMN "hasBannerBottom" BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE "Subscription" ADD COLUMN "hasBannerPortada" BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE "Subscription" ADD COLUMN "bonifiedKeys" TEXT`,
  `ALTER TABLE "Subscription" ADD COLUMN "discountAmount" REAL NOT NULL DEFAULT 0`,
  `ALTER TABLE "Subscription" ADD COLUMN "adventureId" TEXT`,
  `ALTER TABLE "Subscription" ADD COLUMN "localServiceId" TEXT`,
  `ALTER TABLE "Subscription" ADD COLUMN "commerceId" TEXT`,
  // MapMarker
  `ALTER TABLE "MapMarker" ADD COLUMN "color" TEXT NOT NULL DEFAULT '#ea580c'`,
];

// Tables that might not exist at all
const createStatements = [
  `CREATE TABLE IF NOT EXISTS "Feature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "accommodationId" TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "CommerceDetail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "commerceId" TEXT NOT NULL
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
    "rating" INTEGER NOT NULL DEFAULT 5,
    "comment" TEXT NOT NULL DEFAULT '',
    "author" TEXT NOT NULL DEFAULT '',
    "email" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "businessId" TEXT,
    "accommodationId" TEXT,
    "adventureId" TEXT,
    "localServiceId" TEXT,
    "commerceId" TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS "PortalUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "PricingConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "image" TEXT,
    "author" TEXT DEFAULT 'AluminéGO',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subscriptionId" TEXT NOT NULL,
    "amount" REAL NOT NULL DEFAULT 0,
    "paymentDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodPaid" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "PortalUser_email_key" ON "PortalUser"("email")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "PricingConfig_key_key" ON "PricingConfig"("key")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Article_slug_key" ON "Article"("slug")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint")`,
];

async function main() {
  let ok = 0, skip = 0, fail = 0;

  console.log('--- Applying CREATE statements ---');
  for (const stmt of createStatements) {
    try {
      await db.execute(stmt);
      ok++;
      console.log(`✓ ${stmt.substring(0, 60)}`);
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        skip++;
      } else {
        fail++;
        console.error(`✗ FAIL: ${stmt.substring(0, 60)}\n  ${e.message}`);
      }
    }
  }

  console.log('\n--- Applying ALTER statements ---');
  for (const stmt of alterStatements) {
    try {
      await db.execute(stmt);
      ok++;
      console.log(`✓ ${stmt}`);
    } catch (e: any) {
      if (e.message?.includes('duplicate column') || e.message?.includes('already exists')) {
        skip++;
      } else {
        fail++;
        console.error(`✗ FAIL: ${stmt}\n  ${e.message}`);
      }
    }
  }

  console.log(`\nDone: ${ok} applied, ${skip} skipped (already exist), ${fail} failed`);
}

main().catch(console.error);
