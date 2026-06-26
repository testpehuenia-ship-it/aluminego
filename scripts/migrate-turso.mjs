import { createClient } from '@libsql/client';

const client = createClient({
  url: "libsql://pehueniago-testpehuenia.aws-ap-south-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzg4ODAyNzcsImlkIjoiMDE5ZTJkODYtNTEwMS03OGU4LWJjYjUtN2QxMDcwYmZlMTAxIiwicmlkIjoiOGRhOTcxODMtMTU0Mi00Mzc0LThkNTktMGFhNWQzNjNhYjBkIn0.NHzG9vtw8ZSfnIi2q1bd_3_TxnMoaKfnLgsA5R0fS47skOd5kKSoW6rm99aZIlLVdsu71GnC-XoHHda9d8mhDA",
});

async function main() {
  try {
    console.log("Creating PricingConfig...");
    await client.execute(`
      CREATE TABLE IF NOT EXISTS "PricingConfig" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "key" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "price" REAL NOT NULL,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL
      );
    `);
    await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS "PricingConfig_key_key" ON "PricingConfig"("key");`);

    console.log("Creating Subscription...");
    await client.execute(`
      CREATE TABLE IF NOT EXISTS "Subscription" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "clientName" TEXT NOT NULL,
          "planType" TEXT NOT NULL,
          "hasBannerTop" BOOLEAN NOT NULL DEFAULT 0,
          "hasBannerMiddle" BOOLEAN NOT NULL DEFAULT 0,
          "hasBannerBottom" BOOLEAN NOT NULL DEFAULT 0,
          "hasBannerPortada" BOOLEAN NOT NULL DEFAULT 0,
          "price" REAL NOT NULL,
          "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "dueDate" DATETIME NOT NULL,
          "businessId" TEXT,
          "accommodationId" TEXT,
          "adventureId" TEXT,
          "localServiceId" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL,
          CONSTRAINT "Subscription_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "Subscription_accommodationId_fkey" FOREIGN KEY ("accommodationId") REFERENCES "Accommodation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "Subscription_adventureId_fkey" FOREIGN KEY ("adventureId") REFERENCES "Adventure" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "Subscription_localServiceId_fkey" FOREIGN KEY ("localServiceId") REFERENCES "LocalService" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_businessId_key" ON "Subscription"("businessId");`);
    await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_accommodationId_key" ON "Subscription"("accommodationId");`);
    await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_adventureId_key" ON "Subscription"("adventureId");`);
    await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_localServiceId_key" ON "Subscription"("localServiceId");`);

    console.log("Creating Payment...");
    await client.execute(`
      CREATE TABLE IF NOT EXISTS "Payment" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "subscriptionId" TEXT NOT NULL,
          "amount" REAL NOT NULL,
          "paymentDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "periodPaid" DATETIME NOT NULL,
          CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    console.log("Creating PushSubscription...");
    await client.execute(`
      CREATE TABLE IF NOT EXISTS "PushSubscription" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "endpoint" TEXT NOT NULL,
          "p256dh" TEXT NOT NULL,
          "auth" TEXT NOT NULL,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");`);

    console.log("Creating PushHistory...");
    await client.execute(`
      CREATE TABLE IF NOT EXISTS "PushHistory" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "title" TEXT NOT NULL,
          "message" TEXT NOT NULL,
          "url" TEXT,
          "sentCount" INTEGER NOT NULL DEFAULT 0,
          "errorCount" INTEGER NOT NULL DEFAULT 0,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Altering columns...");
    try { await client.execute(`ALTER TABLE "Accommodation" ADD COLUMN "description" TEXT;`); } catch(e) { console.log("Accommodation description likely exists"); }
    try { await client.execute(`ALTER TABLE "MenuItem" ADD COLUMN "image" TEXT;`); } catch(e) { console.log("MenuItem image likely exists"); }
    try { await client.execute(`ALTER TABLE "Publicity" ADD COLUMN "title" TEXT;`); } catch(e) { console.log("Publicity title likely exists"); }
    try { await client.execute(`ALTER TABLE "Publicity" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT 1;`); } catch(e) { console.log("Publicity isActive likely exists"); }
    
    console.log("DONE");

  } catch (error) {
    console.error(error);
  }
}

main();
