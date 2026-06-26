import { createClient } from '@libsql/client';

const client = createClient({
  url: 'libsql://AluminéGO-testAluminé.aws-ap-south-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzg4ODAyNzcsImlkIjoiMDE5ZTJkODYtNTEwMS03OGU4LWJjYjUtN2QxMDcwYmZlMTAxIiwicmlkIjoiOGRhOTcxODMtMTU0Mi00Mzc0LThkNTktMGFhNWQzNjNhYjBkIn0.NHzG9vtw8ZSfnIi2q1bd_3_TxnMoaKfnLgsA5R0fS47skOd5kKSoW6rm99aZIlLVdsu71GnC-XoHHda9d8mhDA',
});

async function run() {
  try {
    console.log('Adding bonifiedKeys column...');
    await client.execute(`ALTER TABLE "Subscription" ADD COLUMN "bonifiedKeys" TEXT`);
    console.log('Added bonifiedKeys.');
  } catch (e: any) {
    console.log(`Error adding bonifiedKeys (might already exist): ${e.message}`);
  }

  try {
    console.log('Adding discountAmount column...');
    await client.execute(`ALTER TABLE "Subscription" ADD COLUMN "discountAmount" REAL NOT NULL DEFAULT 0`);
    console.log('Added discountAmount.');
  } catch (e: any) {
    console.log(`Error adding discountAmount (might already exist): ${e.message}`);
  }

  client.close();
}

run();

