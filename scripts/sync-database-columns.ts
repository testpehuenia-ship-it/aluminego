import 'dotenv/config';
import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';
import path from 'path';

async function syncLocal() {
  console.log('>>> [1/2] Sincronizando SQLite local (dev.db)...');
  try {
    const dbPath = path.resolve(process.cwd(), 'dev.db');
    const db = new Database(dbPath);

    const tablesWithDelivery = ['Business', 'LocalService', 'Commerce'];
    for (const table of tablesWithDelivery) {
      try {
        const columns = db.prepare(`PRAGMA table_info("${table}")`).all() as any[];
        const hasCol = columns.some(c => c.name === 'hasDelivery');
        if (!hasCol) {
          db.prepare(`ALTER TABLE "${table}" ADD COLUMN "hasDelivery" BOOLEAN NOT NULL DEFAULT 0`).run();
          console.log(`  + Columna hasDelivery agregada a tabla ${table} en local dev.db`);
        } else {
          console.log(`  ✓ Columna hasDelivery ya existe en ${table} (local)`);
        }
      } catch (err: any) {
        console.log(`  ⚠️ Error comprobando ${table}:`, err.message);
      }
    }

    try {
      const accCols = db.prepare(`PRAGMA table_info("Accommodation")`).all() as any[];
      if (!accCols.some(c => c.name === 'details')) {
        db.prepare(`ALTER TABLE "Accommodation" ADD COLUMN "details" TEXT`).run();
        console.log(`  + Columna details agregada a tabla Accommodation en local dev.db`);
      }
    } catch (err: any) {
      console.log(`  ⚠️ Error comprobando Accommodation details:`, err.message);
    }

    // Create AppInstallation table
    db.prepare(`
      CREATE TABLE IF NOT EXISTS "AppInstallation" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "deviceId" TEXT NOT NULL,
        "platform" TEXT NOT NULL,
        "browser" TEXT,
        "isStandalone" BOOLEAN NOT NULL DEFAULT 1,
        "hasPush" BOOLEAN NOT NULL DEFAULT 0,
        "language" TEXT,
        "screenSize" TEXT,
        "installedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "lastActiveAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "sessionCount" INTEGER NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    db.prepare(`
      CREATE UNIQUE INDEX IF NOT EXISTS "AppInstallation_deviceId_key" ON "AppInstallation"("deviceId")
    `).run();
    console.log(`  ✓ Tabla AppInstallation e índices verificados en local dev.db`);

    db.close();
  } catch (err: any) {
    console.error('  ❌ Error sincronizando local dev.db:', err.message);
  }
}

async function syncTurso() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.log('>>> [2/2] Omitiendo Turso (credenciales no encontradas en .env)');
    return;
  }

  console.log('>>> [2/2] Sincronizando Turso Cloud Database (' + url + ')...');
  const client = createClient({ url, authToken });

  try {
    const tablesWithDelivery = ['Business', 'LocalService', 'Commerce'];
    for (const table of tablesWithDelivery) {
      try {
        const info = await client.execute(`PRAGMA table_info("${table}")`);
        const hasCol = info.rows.some((r: any) => r.name === 'hasDelivery');
        if (!hasCol) {
          await client.execute(`ALTER TABLE "${table}" ADD COLUMN "hasDelivery" BOOLEAN NOT NULL DEFAULT 0`);
          console.log(`  + Columna hasDelivery agregada a ${table} en Turso Cloud`);
        } else {
          console.log(`  ✓ Columna hasDelivery ya existe en ${table} (Turso)`);
        }
      } catch (err: any) {
        console.log(`  ⚠️ Error en ${table} Turso:`, err.message);
      }
    }

    try {
      const accInfo = await client.execute(`PRAGMA table_info("Accommodation")`);
      const hasDetails = accInfo.rows.some((r: any) => r.name === 'details');
      if (!hasDetails) {
        await client.execute(`ALTER TABLE "Accommodation" ADD COLUMN "details" TEXT`);
        console.log(`  + Columna details agregada a Accommodation en Turso Cloud`);
      }
    } catch (err: any) {
      console.log(`  ⚠️ Error en Accommodation details Turso:`, err.message);
    }

    await client.execute(`
      CREATE TABLE IF NOT EXISTS "AppInstallation" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "deviceId" TEXT NOT NULL,
        "platform" TEXT NOT NULL,
        "browser" TEXT,
        "isStandalone" BOOLEAN NOT NULL DEFAULT 1,
        "hasPush" BOOLEAN NOT NULL DEFAULT 0,
        "language" TEXT,
        "screenSize" TEXT,
        "installedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "lastActiveAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "sessionCount" INTEGER NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.execute(`
      CREATE UNIQUE INDEX IF NOT EXISTS "AppInstallation_deviceId_key" ON "AppInstallation"("deviceId")
    `);
    console.log(`  ✓ Tabla AppInstallation e índices verificados en Turso Cloud`);

  } catch (err: any) {
    console.error('  ❌ Error sincronizando Turso:', err.message);
  } finally {
    client.close();
  }
}

async function main() {
  await syncLocal();
  await syncTurso();
  console.log('>>> Sincronización de esquemas finalizada con éxito!');
}

main();
