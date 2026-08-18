import type { PrismaClient } from '@prisma/client';

console.log('>>> [DB_INIT] Cargando módulo lib/db.ts');

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createInstance(): PrismaClient {
  const { PrismaClient: PrismaClientCtor } = require('@prisma/client');

  const isVercel = process.env['VERCEL'] === '1';
  const forceTurso = process.env['USE_TURSO'] === 'true';
  const tursoUrl = process.env['TURSO_DATABASE_URL'];
  const token = process.env['TURSO_AUTH_TOKEN'];

  // En producción (Vercel) o si explícitamente se fuerza con USE_TURSO=true, usamos Turso en la nube
  if (isVercel || (forceTurso && tursoUrl)) {
    const { PrismaLibSql } = require('@prisma/adapter-libsql');
    let databaseUrl = tursoUrl ? tursoUrl.replace(/^libsql:\/\//, 'https://') : 'https://error.turso.io';

    if (databaseUrl.endsWith('.turso.i')) {
      console.log('>>> [DB_INIT] Detectada URL recortada en Vercel (.turso.i). Corrigiendo a .turso.io');
      databaseUrl += 'o';
    }

    console.log('>>> [DB_INIT] Instanciando PrismaLibSql (Turso Cloud)');
    const adapter = new PrismaLibSql({
      url: databaseUrl,
      authToken: token,
    });
    return new PrismaClientCtor({ adapter });
  }

  // En entorno local usamos SQLite local (dev.db) para máxima velocidad y funcionamiento offline
  console.log('>>> [DB_INIT] Instanciando Base de Datos Local SQLite (dev.db)');
  try {
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
    const adapter = new PrismaBetterSqlite3({ url: 'dev.db' });
    return new PrismaClientCtor({ adapter });
  } catch (err) {
    const { PrismaLibSql } = require('@prisma/adapter-libsql');
    const adapter = new PrismaLibSql({
      url: process.env['DATABASE_URL'] || 'file:./dev.db',
    });
    return new PrismaClientCtor({ adapter });
  }
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
