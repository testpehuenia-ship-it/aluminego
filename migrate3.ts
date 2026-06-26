import 'dotenv/config';
import { prisma } from './lib/db';

async function main() {
  const tables = ['Business', 'Accommodation', 'Adventure', 'LocalService', 'Commerce'];
  
  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE ${table} ADD COLUMN description TEXT`);
      console.log(`Added description to ${table}`);
    } catch (e) {
      console.log(`Failed to add description to ${table}`);
    }
    
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE ${table} ADD COLUMN details TEXT`);
      console.log(`Added details to ${table}`);
    } catch (e) {
      console.log(`Failed to add details to ${table}`);
    }
  }

  // specific fixes
  try {
      await prisma.$executeRawUnsafe(`ALTER TABLE Accommodation ADD COLUMN type TEXT`);
      console.log(`Added type to Accommodation`);
  } catch (e) { }

  try {
      await prisma.$executeRawUnsafe(`ALTER TABLE Adventure ADD COLUMN category TEXT`);
      console.log(`Added category to Adventure`);
  } catch (e) { }

  try {
      await prisma.$executeRawUnsafe(`ALTER TABLE Commerce ADD COLUMN type TEXT`);
      console.log(`Added type to Commerce`);
  } catch (e) { }

  console.log('Migration complete.');
}

main().catch(console.error);
