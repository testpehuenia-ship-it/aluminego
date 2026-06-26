import 'dotenv/config';
import { prisma } from './lib/db';

async function main() {
  const tables = ['Business', 'Accommodation', 'Adventure', 'LocalService', 'Commerce'];
  
  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE ${table} ADD COLUMN portalUserId TEXT`);
      console.log(`Added portalUserId to ${table}`);
    } catch (e) {
      console.log(`Failed to add portalUserId to ${table}`);
    }
    
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE ${table} ADD COLUMN openingHours TEXT`);
      console.log(`Added openingHours to ${table}`);
    } catch (e) {
      console.log(`Failed to add openingHours to ${table}`);
    }
  }

  // specific to Commerce
  try {
      await prisma.$executeRawUnsafe(`ALTER TABLE Commerce ADD COLUMN locality TEXT`);
      console.log(`Added locality to Commerce`);
  } catch (e) {
      console.log(`Failed to add locality to Commerce`);
  }

  console.log('Migration complete.');
}

main().catch(console.error);
