import { prisma } from '../lib/db';

async function main() {
  console.log('=== CATEGORIES ===');
  const cats = await prisma.category.findMany();
  console.table(cats);

  console.log('\n=== BUSINESSES (GASTRONOMIA) ===');
  const biz = await prisma.business.findMany({
    include: { category: true, subscription: true }
  });
  console.table(biz.map(b => ({
    id: b.id,
    name: b.name,
    categoryTitle: b.category?.title,
    categoryLink: b.category?.link,
    planType: b.subscription?.planType
  })));

  console.log('\n=== COMMERCES ===');
  const comm = await prisma.commerce.findMany({
    include: { subscription: true }
  });
  console.table(comm.map(c => ({
    id: c.id,
    name: c.name,
    type: c.type,
    planType: c.subscription?.planType
  })));
}

main().catch(console.error);
