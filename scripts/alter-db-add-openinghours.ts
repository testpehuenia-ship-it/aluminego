import 'dotenv/config';
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function run() {
  console.log('>>> Modificando base de datos remota de Turso para agregar columnas openingHours...');

  const tables = ['Business', 'Accommodation', 'Adventure', 'LocalService', 'Commerce'];

  for (const table of tables) {
    try {
      console.log(`Adding openingHours column to ${table}...`);
      await client.execute(`ALTER TABLE "${table}" ADD COLUMN "openingHours" TEXT`);
      console.log(`Added openingHours column to ${table} successfully.`);
    } catch (e: any) {
      console.log(`⚠️  ${table} openingHours column: ${e.message}`);
    }
  }

  console.log('>>> Modificaciones completadas.');
  client.close();
}

run();
