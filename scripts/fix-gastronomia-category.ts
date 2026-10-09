import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@libsql/client';

async function main() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoUrl || !authToken) {
    console.error('Missing TURSO credentials in .env');
    return;
  }

  const client = createClient({
    url: tursoUrl,
    authToken: authToken,
  });

  const res = await client.execute({
    sql: 'UPDATE Category SET image = ?, link = ? WHERE title = ?',
    args: ['/images/comer_restaurante.png', '/comer', 'Gastronomía']
  });

  console.log('Turso rows affected:', res.rowsAffected);

  const check = await client.execute({
    sql: 'SELECT * FROM Category WHERE title = ?',
    args: ['Gastronomía']
  });

  console.log('Updated Gastronomía Category:', check.rows);
}

main().catch(console.error);
