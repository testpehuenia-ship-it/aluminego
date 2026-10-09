import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@libsql/client';

async function main() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (tursoUrl && authToken) {
    const client = createClient({
      url: tursoUrl,
      authToken: authToken,
    });

    const res = await client.execute({
      sql: 'UPDATE Subscription SET dueDate = ? WHERE dueDate < ?',
      args: ['2027-12-31T23:59:59.000Z', '2027-01-01T00:00:00.000Z']
    });
    console.log('Turso Subscriptions updated to 2027. Rows affected:', res.rowsAffected);
  }
}

main().catch(console.error);
