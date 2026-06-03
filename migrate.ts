import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Faltan credenciales de Turso en .env");
  process.exit(1);
}

const client = createClient({
  url: url.replace('libsql://', 'https://'), // usar https para más seguridad
  authToken
});

async function main() {
  try {
    console.log("Conectando a Turso...");
    
    // 1. Crear tabla PageVisit
    console.log("Asegurando que la tabla PageVisit existe...");
    await client.execute(`
      CREATE TABLE IF NOT EXISTS "PageVisit" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "path" TEXT NOT NULL,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Agregar columna isHeavy a Publicity
    console.log("Agregando isHeavy a Publicity...");
    try {
      await client.execute(`
        ALTER TABLE "Publicity" ADD COLUMN "isHeavy" BOOLEAN NOT NULL DEFAULT 0;
      `);
      console.log("Columna agregada.");
    } catch (e: any) {
      if (e.message.includes('duplicate column name')) {
        console.log("La columna isHeavy ya existe.");
      } else {
        throw e;
      }
    }

    console.log("✅ Migración completada en Turso exitosamente.");
  } catch (error) {
    console.error("❌ Error al migrar:", error);
  }
}

main();
