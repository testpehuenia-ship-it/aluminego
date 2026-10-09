import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('❌ Falta TURSO_DATABASE_URL o TURSO_AUTH_TOKEN en .env');
  process.exit(1);
}

const client = createClient({ url, authToken });

async function main() {
  console.log('🚀 Creando tabla AppInstallation en Turso...');

  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS "AppInstallation" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "deviceId" TEXT NOT NULL,
        "platform" TEXT NOT NULL,
        "browser" TEXT,
        "isStandalone" BOOLEAN NOT NULL DEFAULT true,
        "hasPush" BOOLEAN NOT NULL DEFAULT false,
        "language" TEXT,
        "screenSize" TEXT,
        "installedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "lastActiveAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "sessionCount" INTEGER NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla AppInstallation creada correctamente en Turso');

    await client.execute(`
      CREATE UNIQUE INDEX IF NOT EXISTS "AppInstallation_deviceId_key" ON "AppInstallation"("deviceId")
    `);
    console.log('✅ Índice único deviceId creado correctamente en Turso');

    const result = await client.execute('SELECT COUNT(*) as count FROM "AppInstallation"');
    console.log('📊 Registros actuales en AppInstallation:', result.rows[0]);
  } catch (err: any) {
    console.error('❌ Error migrando AppInstallation:', err.message);
  } finally {
    client.close();
  }
}

main();
