import 'dotenv/config';
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  console.log('>>> Inspeccionando registros en Turso con categoría "Aventuras" sin suscripción...');

  // Consulta para obtener todos los servicios en Turso cuya categoría es "Aventuras" y no tienen suscripción
  const result = await client.execute(`
    SELECT ls.id, ls.name, ls.category, ls.subcategory, s.id as sub_id
    FROM "LocalService" ls
    LEFT JOIN "Subscription" s ON s.localServiceId = ls.id
    WHERE ls.category = 'Aventuras' AND s.id IS NULL
  `);

  console.log(`Encontrados ${result.rows.length} servicios.`);
  for (const row of result.rows) {
    console.log(`ID: ${row.id} | Name: ${row.name} | Subcategory: ${row.subcategory}`);
  }

  client.close();
}

main().catch(console.error);
