import { prisma } from '../lib/db';

async function main() {
  const services = await prisma.localService.findMany();
  console.log(`Total LocalServices: ${services.length}`);
  services.forEach(s => {
    console.log(`ID: ${s.id} | Name: ${s.name} | Address: "${s.address}" | Category: ${s.category}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
