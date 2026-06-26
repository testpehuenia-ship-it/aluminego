import { createClient } from '@libsql/client';

const client = createClient({
  url: 'libsql://AluminéGO-testAluminé.aws-ap-south-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzg4ODAyNzcsImlkIjoiMDE5ZTJkODYtNTEwMS03OGU4LWJjYjUtN2QxMDcwYmZlMTAxIiwicmlkIjoiOGRhOTcxODMtMTU0Mi00Mzc0LThkNTktMGFhNWQzNjNhYjBkIn0.NHzG9vtw8ZSfnIi2q1bd_3_TxnMoaKfnLgsA5R0fS47skOd5kKSoW6rm99aZIlLVdsu71GnC-XoHHda9d8mhDA',
});

function calculateScore(record: any) {
  let score = 0;
  if (record.whatsapp && record.whatsapp.trim() !== '') score += 10;
  if (record.address && record.address.trim() !== '') score += 5;
  if (record.image && record.image.trim() !== '') score += 20; // image is highly valuable
  if (record.subcategory && record.subcategory.trim() !== '') score += 5;
  if (record.description && record.description.trim() !== '') score += 10;
  if (record.details && record.details.trim() !== '') score += 10;
  
  // Checking subscription if we had it joined, but since it's just LocalService, we rely on the fields.
  return score;
}

function normalizeName(name: string) {
  return name.toLowerCase()
    .replace(/[^\w\sÃ±Ã¡Ã©Ã­Ã³Ãº]/gi, '') // remove special chars but keep letters/numbers/spaces/accents
    .replace(/\s+/g, ' ') // collapse multiple spaces
    .trim();
}

async function run() {
  try {
    console.log('Fetching all local services...');
    const res = await client.execute(`SELECT * FROM "LocalService"`);
    const records = res.rows as any[];
    console.log(`Found ${records.length} total records.`);

    // Group by normalized name
    const grouped = new Map<string, any[]>();
    for (const r of records) {
      const norm = normalizeName(r.name);
      if (!grouped.has(norm)) {
        grouped.set(norm, []);
      }
      grouped.get(norm)!.push(r);
    }

    const toDelete: string[] = [];

    for (const [normName, group] of grouped.entries()) {
      if (group.length > 1) {
        // We have duplicates
        console.log(`\nFound duplicate group for: "${normName}" (${group.length} records)`);
        
        // Sort by score descending
        group.sort((a, b) => calculateScore(b) - calculateScore(a));

        const keep = group[0];
        console.log(`  -> KEEP: ${keep.name} (Score: ${calculateScore(keep)}) | Phone: ${keep.whatsapp || 'None'}`);

        for (let i = 1; i < group.length; i++) {
          const drop = group[i];
          console.log(`  -> DROP: ${drop.name} (Score: ${calculateScore(drop)}) | Phone: ${drop.whatsapp || 'None'}`);
          toDelete.push(drop.id);
        }
      }
    }

    console.log(`\nTotal records to delete: ${toDelete.length}`);

    if (toDelete.length > 0) {
      // Execute deletions in batches
      for (let i = 0; i < toDelete.length; i += 50) {
        const chunk = toDelete.slice(i, i + 50);
        const placeholders = chunk.map(() => '?').join(',');
        await client.execute({
          sql: `DELETE FROM "LocalService" WHERE id IN (${placeholders})`,
          args: chunk
        });
        console.log(`Deleted chunk of ${chunk.length} records...`);
      }
      console.log('Deduplication completed successfully!');
    } else {
      console.log('No duplicates found.');
    }

  } catch (e: any) {
    console.error('Error:', e.message);
  } finally {
    client.close();
  }
}

run();

