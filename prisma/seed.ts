import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import dotenv from 'dotenv';
import path from 'path';

// Import local data sources
import { CATEGORIES_DATA } from '../data/categories';
import { COMERCIOS } from '../data/comercios';
import { ALOJAMIENTOS } from '../data/alojamientos';
import { AVENTURAS } from '../data/aventuras';
import { GUIA_ITEMS } from '../data/guia';

// Load environmental variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const url = process.env['TURSO_DATABASE_URL'] || process.env['DATABASE_URL'];
const token = process.env['TURSO_AUTH_TOKEN'];

let prisma: PrismaClient;

// Set up dynamic database client based on config
const isLocalForce = process.argv.includes('--local');

if (!isLocalForce && url && (url.startsWith('libsql') || url.startsWith('https'))) {
  let databaseUrl = url.replace(/^libsql:\/\//, 'https://');
  if (databaseUrl.endsWith('.turso.i')) {
    databaseUrl += 'o';
  }
  console.log('>>> [SEED] Conectando a la base de datos remota de Turso:', databaseUrl);
  const adapter = new PrismaLibSql({
    url: databaseUrl,
    authToken: token,
  });
  prisma = new PrismaClient({ adapter });
} else {
  console.log('>>> [SEED] Conectando a la base de datos local SQLite (dev.db) [FORZADO LOCAL]');
  const adapter = new PrismaBetterSqlite3({ url: 'dev.db' });
  prisma = new PrismaClient({ adapter });
}

async function main() {
  // 1. Clean Database
  console.log('1. Limpiando base de datos anterior...');
  await prisma.feature.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.business.deleteMany();
  await prisma.category.deleteMany();
  await prisma.accommodation.deleteMany();
  await prisma.adventure.deleteMany();
  await prisma.localService.deleteMany();
  await prisma.admin.deleteMany();
  console.log('✓ Base de datos limpia.');

  // 2. Seed Categories
  console.log('2. Sembrando Categorías...');
  for (const cat of CATEGORIES_DATA) {
    await prisma.category.create({
      data: {
        title: cat.title,
        link: cat.link,
        image: cat.image
      }
    });
  }
  console.log(`✓ Sembradas ${CATEGORIES_DATA.length} categorías.`);

  // 3. Seed Businesses & MenuItems
  console.log('3. Sembrando Comercios y Menús...');
  let bizCount = 0;
  for (const biz of COMERCIOS) {
    const category = await prisma.category.findUnique({
      where: { title: biz.category }
    });
    if (!category) {
      console.warn(`⚠️ Categoría "${biz.category}" no encontrada para el comercio "${biz.name}"`);
      continue;
    }
    await prisma.business.create({
      data: {
        name: biz.name,
        image: biz.image,
        whatsapp: biz.whatsapp,
        categoryId: category.id,
        menu: {
          create: biz.menu.map(item => ({
            name: item.name,
            description: item.description,
            price: item.price
          }))
        }
      }
    });
    bizCount++;
  }
  console.log(`✓ Sembrados ${bizCount} comercios.`);

  // 4. Seed Accommodations & Features
  console.log('4. Sembrando Alojamientos...');
  for (const acc of ALOJAMIENTOS) {
    await prisma.accommodation.create({
      data: {
        name: acc.name,
        type: acc.category,
        image: acc.image,
        whatsapp: acc.whatsapp,
        description: acc.description,
        features: {
          create: acc.amenities.map(feat => ({
            name: feat
          }))
        }
      }
    });
  }
  console.log(`✓ Sembrados ${ALOJAMIENTOS.length} alojamientos.`);

  // 5. Seed Adventures
  console.log('5. Sembrando Aventuras...');
  for (const adv of AVENTURAS) {
    await prisma.adventure.create({
      data: {
        name: adv.name,
        description: adv.description,
        image: adv.image,
        whatsapp: adv.whatsapp,
        category: adv.category,
        details: adv.details.join(',')
      }
    });
  }
  console.log(`✓ Sembradas ${AVENTURAS.length} aventuras.`);

  // 6. Seed LocalServices
  console.log('6. Sembrando Guía Local (Servicios locales)...');
  for (const service of GUIA_ITEMS) {
    await prisma.localService.create({
      data: {
        name: service.nombre,
        category: service.categoria,
        address: service.direccion,
        whatsapp: null,
        image: null
      }
    });
  }
  console.log(`✓ Sembrados ${GUIA_ITEMS.length} servicios de la Guía Local.`);

  // 7. Seed Admin
  console.log('7. Creando usuario administrador por defecto...');
  await prisma.admin.create({
    data: {
      username: 'admin',
      password: 'admin123'
    }
  });
  console.log('✓ Sembrado administrador.');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('>>> [SEED] Desconectado de la base de datos.');
  });
