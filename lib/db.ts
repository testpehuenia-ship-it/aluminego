import type { PrismaClient } from '@prisma/client';

console.log('>>> [DB_INIT] Cargando módulo lib/db.ts');

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createInstance(): PrismaClient {
  // Usamos notación de corchetes para evitar que Next.js reemplace process.env.DATABASE_URL
  // estáticamente en tiempo de compilación con 'file:./dev.db'.
  if (!process.env['DATABASE_URL']) {
    console.log('>>> [DB_INIT] Inyectando DATABASE_URL de fallback temporal: file:./dev.db');
    process.env['DATABASE_URL'] = 'file:./dev.db';
  }

  // Cargamos los módulos de forma síncrona aquí para garantizar que la inyección
  // de DATABASE_URL ocurra antes de la inicialización interna de PrismaClient.
  const { PrismaClient: PrismaClientCtor } = require('@prisma/client');
  const { PrismaLibSql } = require('@prisma/adapter-libsql');

  const url = process.env['TURSO_DATABASE_URL'] || process.env['DATABASE_URL'];
  const token = process.env['TURSO_AUTH_TOKEN'];

  console.log('>>> [DB_INIT] Creando nueva instancia de PrismaClient');
  console.log('>>> [DB_INIT] URL Detectada:', url ? url.substring(0, 20) + '...' : '❌ NULL');

  if (process.env['VERCEL'] === '1' || (url && (url.startsWith('libsql') || url.startsWith('https')))) {
    // Si la URL empieza con libsql://, la convertimos a https:// para entornos Serverless
    // para garantizar una conexión HTTP POST robusta y rápida (evitando problemas de WebSocket).
    let databaseUrl = url ? url.replace(/^libsql:\/\//, 'https://') : 'https://error.turso.io';

    // Corrección defensiva: si el dominio se recortó como ".turso.i" en Vercel, agregamos la "o" faltante.
    if (databaseUrl.endsWith('.turso.i')) {
      console.log('>>> [DB_INIT] Detectada URL recortada en Vercel (.turso.i). Corrigiendo a .turso.io');
      databaseUrl += 'o';
    }

    console.log('>>> [DB_INIT] Instanciando PrismaLibSql con URL segura:', databaseUrl.substring(0, 25) + '...');

    // En Prisma 7, PrismaLibSql constructor recibe el objeto de configuración (Config)
    // de @libsql/client directamente, no la instancia del cliente.
    const adapter = new PrismaLibSql({
      url: databaseUrl,
      authToken: token,
    });
    return new PrismaClientCtor({ adapter });
  }

  const localAdapter = new PrismaLibSql({
    url: process.env['DATABASE_URL'] || 'file:./dev.db',
  });
  return new PrismaClientCtor({ adapter: localAdapter });
}

export const prisma = globalForPrisma.prisma || createInstance();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export function getActiveSubscriptionWhere() {
  const graceDate = new Date();
  graceDate.setDate(graceDate.getDate() - 7);
  return {
    OR: [
      { subscription: null },
      { subscription: { dueDate: { gte: graceDate } } }
    ]
  };
}

export default prisma;
