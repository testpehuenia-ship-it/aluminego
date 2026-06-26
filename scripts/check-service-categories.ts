import { prisma } from '../lib/db';

async function main() {
  const categories = await prisma.localService.groupBy({
    by: ['category']
  });
  console.log('Categorías de servicios locales en Turso:', categories.map(c => c.category));
}

main().catch(console.error);
