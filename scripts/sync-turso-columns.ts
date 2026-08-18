import 'dotenv/config';
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  console.log('>>> Sincronizando columnas isVerified y showSchedule en Turso Cloud...');

  const tables = ['Business', 'Accommodation', 'Adventure', 'LocalService', 'Commerce'];

  for (const table of tables) {
    try {
      await client.execute(`ALTER TABLE "${table}" ADD COLUMN isVerified BOOLEAN NOT NULL DEFAULT 0;`);
      console.log(`+ Added isVerified to ${table}`);
    } catch (e: any) {
      console.log(`isVerified in ${table}: ${e.message}`);
    }

    try {
      await client.execute(`ALTER TABLE "${table}" ADD COLUMN showSchedule BOOLEAN NOT NULL DEFAULT 0;`);
      console.log(`+ Added showSchedule to ${table}`);
    } catch (e: any) {
      console.log(`showSchedule in ${table}: ${e.message}`);
    }
  }

  console.log('>>> Listo!');
  client.close();
}

main().catch(console.error);
