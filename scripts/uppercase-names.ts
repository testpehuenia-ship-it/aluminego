import { createClient } from '@libsql/client';

const client = createClient({
  url: 'libsql://AluminéGO-testAluminé.aws-ap-south-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzg4ODAyNzcsImlkIjoiMDE5ZTJkODYtNTEwMS03OGU4LWJjYjUtN2QxMDcwYmZlMTAxIiwicmlkIjoiOGRhOTcxODMtMTU0Mi00Mzc0LThkNTktMGFhNWQzNjNhYjBkIn0.NHzG9vtw8ZSfnIi2q1bd_3_TxnMoaKfnLgsA5R0fS47skOd5kKSoW6rm99aZIlLVdsu71GnC-XoHHda9d8mhDA',
});

async function run() {
  try {
    const res = await client.execute(`UPDATE "LocalService" SET name = UPPER(name)`);
    console.log(`Updated ${res.rowsAffected} records to uppercase name in LocalService.`);

    const subRes = await client.execute(`UPDATE "Subscription" SET clientName = UPPER(clientName)`);
    console.log(`Updated ${subRes.rowsAffected} records to uppercase name in Subscription.`);

  } catch (e: any) {
    console.log(`Error: ${e.message}`);
  } finally {
    client.close();
  }
}

run();

