import 'dotenv/config';
import { createClient } from '@libsql/client';

// Conexión local a dev.db usando @libsql/client
const localClient = createClient({
  url: 'file:./dev.db'
});

// Conexión remota a Turso usando @libsql/client
const tursoClient = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  console.log('>>> Leyendo categorías originales desde la base de datos local dev.db...');

  // 1. Obtener todas las categorías de LocalService en dev.db
  const localServices = await localClient.execute('SELECT name, category FROM "LocalService"');
  console.log(`Leídos ${localServices.rows.length} servicios desde dev.db.`);

  let restoredCount = 0;
  for (const row of localServices.rows) {
    const name = row.name as string;
    const category = row.category as string;

    try {
      const result = await tursoClient.execute({
        sql: 'UPDATE "LocalService" SET "category" = ? WHERE UPPER(TRIM("name")) = ?',
        args: [category, name.trim().toUpperCase()]
      });

      if (result.rowsAffected > 0) {
        console.log(`Restaurado "${name}" -> "${category}" (${result.rowsAffected} filas afectadas)`);
        restoredCount += result.rowsAffected;
      }
    } catch (e: any) {
      console.error(`Error al restaurar "${name}":`, e.message);
    }
  }

  console.log(`>>> Restauración por nombre completada. Se restauraron ${restoredCount} registros en Turso.`);

  // Ahora, para las aventuras reales, cambiémoslas a "Aventuras".
  console.log('>>> Configurando categorías de Aventuras correctas...');
  const tursoServices = await tursoClient.execute(`
    SELECT ls.id, ls.name FROM "LocalService" ls
    JOIN "Subscription" s ON s.localServiceId = ls.id
    WHERE s.adventureId IS NOT NULL
  `);

  let advCount = 0;
  for (const row of tursoServices.rows) {
    const id = row.id as string;
    const name = row.name as string;
    console.log(`Seteando categoría "Aventuras" para la aventura real: ${name}`);
    await tursoClient.execute({
      sql: "UPDATE \"LocalService\" SET \"category\" = 'Aventuras' WHERE \"id\" = ?",
      args: [id]
    });
    advCount++;
  }

  console.log(`>>> Se marcaron ${advCount} aventuras reales como "Aventuras" en Turso.`);

  localClient.close();
  tursoClient.close();
}

main().catch(console.error);
