import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const tursoUrl = process.env.TURSO_DATABASE_URL?.replace(/^libsql:\/\//, 'https://');
const tursoToken = process.env.TURSO_AUTH_TOKEN;

async function check() {
  if (!tursoUrl || !tursoToken) {
    console.log('No credentials');
    return;
  }
  const client = createClient({ url: tursoUrl, authToken: tursoToken });

  const tables = ['Business', 'Commerce', 'Accommodation', 'LocalService', 'Adventure'];
  for (const table of tables) {
    const res = await client.execute(`SELECT id, name, latitude, longitude FROM ${table}`);
    const withCoords = res.rows.filter(r => r.latitude !== null && r.longitude !== null && Number(r.latitude) !== 0);
    console.log(`Table ${table}: Total = ${res.rows.length}, With coords = ${withCoords.length}`);
    const nullRows = res.rows.filter(r => r.latitude === null || Number(r.latitude) === 0);
    if (nullRows.length > 0) {
      console.log(`  Null coords sample:`, nullRows.slice(0, 3).map(r => r.name));
    }
  }
}

check().catch(console.error);
