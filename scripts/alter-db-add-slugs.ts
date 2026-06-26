import 'dotenv/config';
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function run() {
  console.log('>>> Modificando base de datos remota de Turso para agregar columnas slug y locality...');

  try {
    console.log('Adding slug column to Commerce...');
    await client.execute(`ALTER TABLE "Commerce" ADD COLUMN "slug" TEXT`);
    console.log('Added slug column successfully.');
  } catch (e: any) {
    console.log(`âš ï¸  slug column: ${e.message}`);
  }

  try {
    console.log('Creating unique index on Commerce(slug)...');
    await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS "Commerce_slug_key" ON "Commerce"("slug")`);
    console.log('Created index successfully.');
  } catch (e: any) {
    console.log(`âš ï¸  index: ${e.message}`);
  }

  try {
    console.log('Adding locality column to Commerce...');
    await client.execute(`ALTER TABLE "Commerce" ADD COLUMN "locality" TEXT DEFAULT 'Aluminé'`);
    console.log('Added locality column successfully.');
  } catch (e: any) {
    console.log(`âš ï¸  locality column: ${e.message}`);
  }

  console.log('>>> Modificaciones completadas.');
  client.close();
}

run();

