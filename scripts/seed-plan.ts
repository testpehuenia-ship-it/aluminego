import { createClient } from '@libsql/client';

const client = createClient({
  url: 'libsql://AluminéGO-testAluminé.aws-ap-south-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzg4ODAyNzcsImlkIjoiMDE5ZTJkODYtNTEwMS03OGU4LWJjYjUtN2QxMDcwYmZlMTAxIiwicmlkIjoiOGRhOTcxODMtMTU0Mi00Mzc0LThkNTktMGFhNWQzNjNhYjBkIn0.NHzG9vtw8ZSfnIi2q1bd_3_TxnMoaKfnLgsA5R0fS47skOd5kKSoW6rm99aZIlLVdsu71GnC-XoHHda9d8mhDA',
});

async function main() {
  console.log('Insertando plan_comercio_completo en PricingConfig...');
  
  try {
    await client.execute({
      sql: `INSERT OR IGNORE INTO "PricingConfig" ("id", "key", "name", "price", "createdAt", "updatedAt") 
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      args: ['plan-comercio-completo', 'plan_comercio_completo', 'Plan Comercio Completo (GuÃ­a Local)', 4000],
    });
    console.log('âœ… Plan insertado con Ã©xito en Turso.');
  } catch (error) {
    console.error('Error insertando plan:', error);
  }

  client.close();
}

main();

