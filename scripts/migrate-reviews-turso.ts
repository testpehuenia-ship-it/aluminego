import 'dotenv/config';
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function run() {
  console.log("Creating Review table on Turso...");
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS "Review" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "rating" INTEGER NOT NULL,
        "comment" TEXT NOT NULL,
        "author" TEXT NOT NULL,
        "email" TEXT,
        "approved" BOOLEAN NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "businessId" TEXT,
        "accommodationId" TEXT,
        "adventureId" TEXT,
        "localServiceId" TEXT,
        CONSTRAINT "Review_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "Review_accommodationId_fkey" FOREIGN KEY ("accommodationId") REFERENCES "Accommodation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "Review_adventureId_fkey" FOREIGN KEY ("adventureId") REFERENCES "Adventure" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "Review_localServiceId_fkey" FOREIGN KEY ("localServiceId") REFERENCES "LocalService" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    console.log("✅ Review table created successfully on Turso!");
  } catch (error) {
    console.error("❌ Error creating Review table:", error);
  } finally {
    client.close();
  }
}

run();
