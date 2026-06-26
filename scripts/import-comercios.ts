import * as cheerio from 'cheerio';
import { createClient } from '@libsql/client';

const client = createClient({
  url: 'libsql://AluminéGO-testAluminé.aws-ap-south-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzg4ODAyNzcsImlkIjoiMDE5ZTJkODYtNTEwMS03OGU4LWJjYjUtN2QxMDcwYmZlMTAxIiwicmlkIjoiOGRhOTcxODMtMTU0Mi00Mzc0LThkNTktMGFhNWQzNjNhYjBkIn0.NHzG9vtw8ZSfnIi2q1bd_3_TxnMoaKfnLgsA5R0fS47skOd5kKSoW6rm99aZIlLVdsu71GnC-XoHHda9d8mhDA',
});

const urls = [
  { url: 'https://villaAluminé.gob.ar/alojamientos-en-villa-Aluminé-3', category: 'Alojarse' },
  { url: 'https://villaAluminé.gob.ar/servicios-y-comercios-2', category: 'Comercios' },
  { url: 'https://villaAluminé.gob.ar/gastronomia-en-villa-Aluminé-moquehue', category: 'GastronomÃ­a' }
];

async function run() {
  const allServices: any[] = [];
  const seenNames = new Set<string>();

  for (const { url, category } of urls) {
    console.log('Fetching', url);
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    $('tr').each((i, el) => {
      const name = $(el).find('.item-title').text().trim();
      let phone = $(el).find('.item-phone').text().trim();
      let address = $(el).find('.item-extra_field_2').text().trim();
      
      if (!name || name === 'Nombre') return;

      phone = phone.replace(/[^0-9]/g, '');
      const normalizedName = name.toLowerCase().replace(/\s+/g, ' ');

      if (!seenNames.has(normalizedName)) {
        seenNames.add(normalizedName);
        allServices.push({
          id: `import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: name,
          category: category,
          whatsapp: phone,
          address: address
        });
      }
    });
  }

  console.log(`Found ${allServices.length} unique services. Inserting via batch...`);

  const stmts = allServices.map(s => ({
    sql: `INSERT OR IGNORE INTO "LocalService" ("id", "name", "category", "whatsapp", "address", "createdAt", "updatedAt") 
          VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    args: [s.id, s.name, s.category, s.whatsapp, s.address]
  }));

  // Batch insert in chunks of 50
  for (let i = 0; i < stmts.length; i += 50) {
    const chunk = stmts.slice(i, i + 50);
    try {
      await client.batch(chunk, 'write');
      console.log(`Inserted chunk ${i / 50 + 1}`);
    } catch (e: any) {
      console.log(`Failed chunk: ${e.message}`);
    }
  }

  console.log(`Successfully completed batch insertion!`);
  client.close();
}

run();

