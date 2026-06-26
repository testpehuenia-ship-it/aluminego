import { prisma } from '../lib/db';

async function main() {
  const configs = await prisma.pricingConfig.findMany();
  console.log('📋 Configs de precios en la BD:');
  console.log(configs);
}

main().catch(console.error).finally(() => prisma.$disconnect());
