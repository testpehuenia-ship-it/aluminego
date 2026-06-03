import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url: url!, authToken: authToken! });

async function main() {
  const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table';");
  console.log("📋 Tablas encontradas en Turso:");
  console.table(result.rows);
  client.close();
}

main();
