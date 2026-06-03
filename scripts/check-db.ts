import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';

// Load .env explicitly
dotenv.config({ path: path.join(__dirname, '../.env') });

const adapter = new PrismaBetterSqlite3({ url: 'dev.db' });
const prisma = new PrismaClient({ adapter });

async function checkDb() {
  console.log('--- LOCAL SQLITE (dev.db) ---');
  try {
    const categories = await prisma.category.findMany();
    const businesses = await prisma.business.findMany();
    const menuItems = await prisma.menuItem.findMany();
    const accommodations = await prisma.accommodation.findMany();
    const adventures = await prisma.adventure.findMany();
    const localServices = await prisma.localService.findMany();

    console.log(`Categories: ${categories.length}`);
    console.log(`Businesses: ${businesses.length}`);
    console.log(`MenuItems: ${menuItems.length}`);
    console.log(`Accommodations: ${accommodations.length}`);
    console.log(`Adventures: ${adventures.length}`);
    console.log(`LocalServices: ${localServices.length}`);
    
    console.log('\n--- Categories ---');
    console.log(categories.map(c => ({ id: c.id, title: c.title, link: c.link })));
  } catch (error) {
    console.error('Error reading local dev.db:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function checkTurso() {
  console.log('\n--- REMOTE TURSO DATABASE ---');
  if (!process.env.TURSO_DATABASE_URL) {
    console.log('No TURSO_DATABASE_URL found in .env');
    return;
  }
  const { PrismaLibSql } = require('@prisma/adapter-libsql');
  const { PrismaClient: PrismaClientRemote } = require('@prisma/client');
  
  let databaseUrl = process.env.TURSO_DATABASE_URL.replace(/^libsql:\/\//, 'https://');
  const token = process.env.TURSO_AUTH_TOKEN;
  
  console.log(`Connecting to Turso: ${databaseUrl}`);
  try {
    const adapterRemote = new PrismaLibSql({
      url: databaseUrl,
      authToken: token,
    });
    const prismaRemote = new PrismaClientRemote({ adapter: adapterRemote });
    
    const categories = await prismaRemote.category.findMany();
    const businesses = await prismaRemote.business.findMany();
    const menuItems = await prismaRemote.menuItem.findMany();
    const accommodations = await prismaRemote.accommodation.findMany();
    const adventures = await prismaRemote.adventure.findMany();
    const localServices = await prismaRemote.localService.findMany();

    console.log(`Categories: ${categories.length}`);
    console.log(`Businesses: ${businesses.length}`);
    console.log(`MenuItems: ${menuItems.length}`);
    console.log(`Accommodations: ${accommodations.length}`);
    console.log(`Adventures: ${adventures.length}`);
    console.log(`LocalServices: ${localServices.length}`);
    
    console.log('\n--- Categories in Turso ---');
    console.log(categories.map(c => ({ id: c.id, title: c.title, link: c.link })));
  } catch (error) {
    console.error('Error reading Turso db:', error);
  }
}

async function main() {
  await checkDb();
  await checkTurso();
}

main();
