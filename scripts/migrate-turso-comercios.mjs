import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "libsql://pehueniago-testpehuenia.aws-ap-south-1.turso.io",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  try {
    console.log("Creating Commerce table...");
    await client.execute(`
      CREATE TABLE IF NOT EXISTS "Commerce" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "image" TEXT NOT NULL,
        "whatsapp" TEXT NOT NULL,
        "description" TEXT,
        "latitude" REAL,
        "longitude" REAL,
        "portalUserId" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        CONSTRAINT "Commerce_portalUserId_fkey" FOREIGN KEY ("portalUserId") REFERENCES "PortalUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
    `);

    console.log("Creating CommerceDetail table...");
    await client.execute(`
      CREATE TABLE IF NOT EXISTS "CommerceDetail" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "commerceId" TEXT NOT NULL,
        CONSTRAINT "CommerceDetail_commerceId_fkey" FOREIGN KEY ("commerceId") REFERENCES "Commerce" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    console.log("Adding commerceId to Subscription...");
    try {
      await client.execute(`
        ALTER TABLE "Subscription" ADD COLUMN "commerceId" TEXT REFERENCES "Commerce"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);
      console.log("  Added commerceId column to Subscription");
    } catch(e) {
      console.log("  Subscription.commerceId likely already exists or failed to add");
    }

    try {
      await client.execute(`
        CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_commerceId_key" ON "Subscription"("commerceId");
      `);
      console.log("  Created unique index on Subscription.commerceId");
    } catch(e) {
      console.log("  Index on Subscription.commerceId likely already exists");
    }

    console.log("Adding commerceId to Review...");
    try {
      await client.execute(`
        ALTER TABLE "Review" ADD COLUMN "commerceId" TEXT REFERENCES "Commerce"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);
      console.log("  Added commerceId column to Review");
    } catch(e) {
      console.log("  Review.commerceId likely already exists or failed to add");
    }

    console.log("Checking and adding latitude/longitude columns to existing tables...");
    const tables = ["Business", "Accommodation", "Adventure", "LocalService"];
    for (const table of tables) {
      try {
        await client.execute(`ALTER TABLE "${table}" ADD COLUMN "latitude" REAL;`);
        console.log(`  Added latitude to ${table}`);
      } catch(e) {
        console.log(`  Latitude already exists in ${table}`);
      }
      try {
        await client.execute(`ALTER TABLE "${table}" ADD COLUMN "longitude" REAL;`);
        console.log(`  Added longitude to ${table}`);
      } catch(e) {
        console.log(`  Longitude already exists in ${table}`);
      }
    }

    console.log("Migration executed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    client.close();
  }
}

main();
