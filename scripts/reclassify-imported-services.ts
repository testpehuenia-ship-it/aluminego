import 'dotenv/config';
import * as cheerio from 'cheerio';
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const urls = [
  { url: 'https://villaAluminé.gob.ar/alojamientos-en-villa-Aluminé-3', category: 'Alojamiento' },
  { url: 'https://villaAluminé.gob.ar/servicios-y-comercios-2', category: 'Comercios' },
  { url: 'https://villaAluminé.gob.ar/gastronomia-en-villa-Aluminé-moquehue', category: 'Gastronomía' }
];

async function run() {
  console.log('>>> Iniciando reclasificación de servicios importados desde las páginas oficiales...');

  for (const { url, category } of urls) {
    console.log('Fetching', url);
    try {
      const res = await fetch(url);
      const html = await res.text();
      const $ = cheerio.load(html);

      let count = 0;
      const namesToUpdate: string[] = [];

      $('tr').each((i, el) => {
        const name = $(el).find('.item-title').text().trim();
        if (!name || name === 'Nombre') return;
        namesToUpdate.push(name.trim().toUpperCase());
      });

      console.log(`Encontrados ${namesToUpdate.length} nombres para la categoría "${category}". Actualizando en Turso...`);

      for (const name of namesToUpdate) {
        let finalCategory = category;
        if (name.includes('TAXI') || name.includes('REMIS') || name.includes('ALBUS')) {
          finalCategory = 'Transporte';
        }

        const result = await client.execute({
          sql: 'UPDATE "LocalService" SET "category" = ? WHERE UPPER(TRIM("name")) = ?',
          args: [finalCategory, name]
        });
        if (result.rowsAffected > 0) {
          count += result.rowsAffected;
        }
      }

      console.log(`Actualizados ${count} registros a la categoría "${category}" (o derivados).`);
    } catch (e: any) {
      console.error(`Error al procesar ${url}:`, e.message);
    }
  }

  // Por último, para las aventuras reales, restaurar "Aventuras"
  console.log('>>> Seteando categoría "Aventuras" para las aventuras reales...');
  const tursoServices = await client.execute(`
    SELECT ls.id, ls.name FROM "LocalService" ls
    JOIN "Subscription" s ON s.localServiceId = ls.id
    WHERE s.adventureId IS NOT NULL
  `);

  let advCount = 0;
  for (const row of tursoServices.rows) {
    const id = row.id as string;
    const name = row.name as string;
    await client.execute({
      sql: "UPDATE \"LocalService\" SET \"category\" = 'Aventuras' WHERE \"id\" = ?",
      args: [id]
    });
    advCount++;
  }
  console.log(`>>> Se marcaron ${advCount} aventuras reales como "Aventuras".`);

  client.close();
  console.log('>>> Reclasificación completa.');
}

run().catch(console.error);

