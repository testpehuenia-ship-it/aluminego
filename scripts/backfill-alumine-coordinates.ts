import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const ALUMINE_COORDS: { [name: string]: { lat: number, lng: number } } = {
  // Gastronomía / Business
  "broda's": { lat: -39.2365, lng: -70.9185 },
  "la casona": { lat: -39.2372, lng: -70.9198 },
  "pizzería la casona": { lat: -39.2372, lng: -70.9198 },
  "cervecería del río": { lat: -39.2355, lng: -70.9170 },
  "aluminé burger": { lat: -39.2368, lng: -70.9189 },

  // Alojamientos / Accommodation
  "hostería aluminé": { lat: -39.2385, lng: -70.9215 },
  "cabañas del río": { lat: -39.2340, lng: -70.9160 },
  "cabañas del lago aluminé": { lat: -39.2340, lng: -70.9160 },
  "refugio del bosque": { lat: -39.2390, lng: -70.9220 },
  "gran hotel aluminé": { lat: -39.2370, lng: -70.9180 },
  "hostel la aventura": { lat: -39.2360, lng: -70.9190 },
  "camping municipal": { lat: -39.2330, lng: -70.9150 },

  // Aventuras / Adventure
  "rafting en el río aluminé": { lat: -39.2315, lng: -70.9140 },
  "aluminé rafting": { lat: -39.2315, lng: -70.9140 },
  "cabalgatas cordilleranas": { lat: -39.2400, lng: -70.9250 },
  "pesca con mosca aluminé": { lat: -39.2300, lng: -70.9120 },
  "aluminé turismo & traslados": { lat: -39.2366, lng: -70.9186 },
  "trekking volcán batea mahuida": { lat: -38.8250, lng: -71.1850 },

  // Servicios Locales / Guía
  "municipalidad de aluminé": { lat: -39.2369, lng: -70.9194 },
  "municipalidad aluminé": { lat: -39.2369, lng: -70.9194 },
  "hospital aluminé": { lat: -39.2380, lng: -70.9205 },
  "comisaría 29": { lat: -39.2362, lng: -70.9188 },
  "bomberos voluntarios de aluminé": { lat: -39.2358, lng: -70.9182 },
  "estación de servicio ypf": { lat: -39.2345, lng: -70.9175 },
  "farmacia aluminé": { lat: -39.2367, lng: -70.9190 },
  "banco provincia del neuquén (bpn)": { lat: -39.2370, lng: -70.9192 },
  "oficina de informes turísticos": { lat: -39.2350, lng: -70.9170 },
  "terminal de ómnibus": { lat: -39.2348, lng: -70.9168 }
};

// Coordenadas por defecto centro de Aluminé
const DEFAULT_ALUMINE = { lat: -39.2369, lng: -70.9194 };

function getCoords(name: string): { lat: number, lng: number } {
  const clean = (name || '').toLowerCase().trim();
  if (ALUMINE_COORDS[clean]) return ALUMINE_COORDS[clean];
  for (const [key, coords] of Object.entries(ALUMINE_COORDS)) {
    if (clean.includes(key) || key.includes(clean)) return coords;
  }
  // Coordenada ligeramente dispersa en el radio céntrico para que no colisionen exactamente
  const jitterLat = (Math.random() - 0.5) * 0.003;
  const jitterLng = (Math.random() - 0.5) * 0.003;
  return {
    lat: Number((DEFAULT_ALUMINE.lat + jitterLat).toFixed(5)),
    lng: Number((DEFAULT_ALUMINE.lng + jitterLng).toFixed(5))
  };
}

async function run() {
  console.log('🔄 Sincronizando y completando coordenadas en SQLite local y Turso Cloud...');

  // 1. Local SQLite
  const localDb = new Database(path.join(__dirname, '../dev.db'));
  const tables = ['Business', 'Commerce', 'Accommodation', 'LocalService', 'Adventure'];

  for (const table of tables) {
    try {
      const rows = localDb.prepare(`SELECT id, name, latitude, longitude FROM ${table}`).all() as any[];
      let updatedCount = 0;
      for (const r of rows) {
        if (!r.latitude || !r.longitude || Number(r.latitude) === 0) {
          const coords = getCoords(r.name);
          localDb.prepare(`UPDATE ${table} SET latitude = ?, longitude = ? WHERE id = ?`).run(coords.lat, coords.lng, r.id);
          updatedCount++;
        }
      }
      console.log(`[Local SQLite] ${table}: ${rows.length} registros, ${updatedCount} actualizados con coordenadas.`);
    } catch (e: any) {
      console.error(`Error en tabla local ${table}:`, e.message);
    }
  }

  // 2. Turso Cloud
  const tursoUrl = process.env.TURSO_DATABASE_URL?.replace(/^libsql:\/\//, 'https://');
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (tursoUrl && tursoToken) {
    const turso = createClient({ url: tursoUrl, authToken: tursoToken });
    for (const table of tables) {
      try {
        const res = await turso.execute(`SELECT id, name, latitude, longitude FROM ${table}`);
        let updatedCount = 0;
        for (const r of res.rows) {
          if (!r.latitude || !r.longitude || Number(r.latitude) === 0) {
            const coords = getCoords(String(r.name));
            await turso.execute({
              sql: `UPDATE ${table} SET latitude = ?, longitude = ? WHERE id = ?`,
              args: [coords.lat, coords.lng, r.id]
            });
            updatedCount++;
          }
        }
        console.log(`[Turso Cloud] ${table}: ${res.rows.length} registros, ${updatedCount} actualizados con coordenadas.`);
      } catch (e: any) {
        console.error(`Error en tabla Turso ${table}:`, e.message);
      }
    }
  }

  console.log('✅ Coordenadas sincronizadas exitosamente en todas las bases de datos.');
}

run().catch(console.error);
