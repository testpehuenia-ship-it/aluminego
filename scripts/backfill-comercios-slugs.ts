import 'dotenv/config';
import { prisma } from '../lib/db';
import { generateUniqueSlug } from '../lib/slugs';

async function main() {
  console.log('>>> Iniciando backfill de Slugs y Localidades para Comercios...');
  
  const commerces = await prisma.commerce.findMany();
  console.log(`>>> Encontrados ${commerces.length} comercios.`);
  
  let updated = 0;
  for (const commerce of commerces) {
    const locality = commerce.locality || 'Aluminé';
    const slug = await generateUniqueSlug(commerce.name, locality, commerce.id);
    
    await prisma.commerce.update({
      where: { id: commerce.id },
      data: {
        slug,
        locality
      }
    });
    console.log(`✓ Actualizado: "${commerce.name}" -> ${slug} (${locality})`);
    updated++;
  }
  
  console.log(`>>> Backfill completado. Se actualizaron ${updated} comercios.`);
}

main()
  .catch(e => {
    console.error('Error durante el backfill:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

