import 'dotenv/config';
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function run() {
  console.log('>>> Modificando base de datos remota de Turso para agregar columnas hasDelivery...');

  const tables = ['Business', 'LocalService', 'Commerce'];

  for (const table of tables) {
    try {
      console.log(`Adding hasDelivery column to ${table}...`);
      await client.execute(`ALTER TABLE "${table}" ADD COLUMN "hasDelivery" BOOLEAN NOT NULL DEFAULT 0`);
      console.log(`Added hasDelivery column to ${table} successfully.`);
    } catch (e: any) {
      console.log(`⚠️  ${table} hasDelivery column: ${e.message}`);
    }
  }

  console.log('>>> Modificaciones completadas.');
  client.close();
}

run();
