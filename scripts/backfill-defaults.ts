import 'dotenv/config';
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const DEFAULT_SCHEDULE = [
  { day: 1, dayName: 'Lunes', closed: false, periods: [{ open: '09:00', close: '13:00' }, { open: '17:00', close: '21:00' }] },
  { day: 2, dayName: 'Martes', closed: false, periods: [{ open: '09:00', close: '13:00' }, { open: '17:00', close: '21:00' }] },
  { day: 3, dayName: 'MiÃ©rcoles', closed: false, periods: [{ open: '09:00', close: '13:00' }, { open: '17:00', close: '21:00' }] },
  { day: 4, dayName: 'Jueves', closed: false, periods: [{ open: '09:00', close: '13:00' }, { open: '17:00', close: '21:00' }] },
  { day: 5, dayName: 'Viernes', closed: false, periods: [{ open: '09:00', close: '13:00' }, { open: '17:00', close: '21:00' }] },
  { day: 6, dayName: 'SÃ¡bado', closed: false, periods: [{ open: '09:00', close: '13:00' }, { open: '17:00', close: '21:00' }] },
  { day: 0, dayName: 'Domingo', closed: true, periods: [] }
];

const DEFAULT_SCHEDULE_STRING = JSON.stringify(DEFAULT_SCHEDULE);

async function main() {
  console.log('>>> Iniciando backfill de valores predeterminados (coordenadas, horarios y direcciones)...');

  // 1. Actualizar LocalService
  try {
    console.log('Actualizando LocalService...');
    // Latitud
    const r1 = await client.execute({
      sql: 'UPDATE "LocalService" SET "latitude" = -38.87942114574949 WHERE "latitude" IS NULL OR "latitude" = 0',
      args: []
    });
    // Longitud
    const r2 = await client.execute({
      sql: 'UPDATE "LocalService" SET "longitude" = -71.18375154775678 WHERE "longitude" IS NULL OR "longitude" = 0',
      args: []
    });
    // Horarios
    const r3 = await client.execute({
      sql: 'UPDATE "LocalService" SET "openingHours" = ? WHERE "openingHours" IS NULL OR "openingHours" = \'\'',
      args: [DEFAULT_SCHEDULE_STRING]
    });
    // DirecciÃ³n
    const r4 = await client.execute({
      sql: 'UPDATE "LocalService" SET "address" = \'Aluminé\' WHERE "address" IS NULL OR TRIM("address") = \'\'',
      args: []
    });

    console.log(`LocalService actualizado: Latitud (${r1.rowsAffected}), Longitud (${r2.rowsAffected}), Horarios (${r3.rowsAffected}), DirecciÃ³n (${r4.rowsAffected})`);
  } catch (e: any) {
    console.error('Error actualizando LocalService:', e.message);
  }

  // 2. Actualizar las otras tablas
  const tables = ['Business', 'Accommodation', 'Adventure', 'Commerce'];

  for (const table of tables) {
    try {
      console.log(`Actualizando tabla ${table}...`);
      const r1 = await client.execute({
        sql: `UPDATE "${table}" SET "latitude" = -38.87942114574949 WHERE "latitude" IS NULL OR "latitude" = 0`,
        args: []
      });
      const r2 = await client.execute({
        sql: `UPDATE "${table}" SET "longitude" = -71.18375154775678 WHERE "longitude" IS NULL OR "longitude" = 0`,
        args: []
      });
      const r3 = await client.execute({
        sql: `UPDATE "${table}" SET "openingHours" = ? WHERE "openingHours" IS NULL OR "openingHours" = ''`,
        args: [DEFAULT_SCHEDULE_STRING]
      });
      console.log(`${table} actualizado: Latitud (${r1.rowsAffected}), Longitud (${r2.rowsAffected}), Horarios (${r3.rowsAffected})`);
    } catch (e: any) {
      console.error(`Error actualizando ${table}:`, e.message);
    }
  }

  client.close();
  console.log('>>> Backfill completado.');
}

main().catch(console.error);

