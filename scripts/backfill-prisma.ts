import 'dotenv/config';
import { prisma } from '../lib/db';

const DEFAULT_SCHEDULE = [
  { day: 1, dayName: 'Lunes', closed: false, periods: [{ open: '09:00', close: '13:00' }, { open: '17:00', close: '21:00' }] },
  { day: 2, dayName: 'Martes', closed: false, periods: [{ open: '09:00', close: '13:00' }, { open: '17:00', close: '21:00' }] },
  { day: 3, dayName: 'Miércoles', closed: false, periods: [{ open: '09:00', close: '13:00' }, { open: '17:00', close: '21:00' }] },
  { day: 4, dayName: 'Jueves', closed: false, periods: [{ open: '09:00', close: '13:00' }, { open: '17:00', close: '21:00' }] },
  { day: 5, dayName: 'Viernes', closed: false, periods: [{ open: '09:00', close: '13:00' }, { open: '17:00', close: '21:00' }] },
  { day: 6, dayName: 'Sábado', closed: false, periods: [{ open: '09:00', close: '13:00' }, { open: '17:00', close: '21:00' }] },
  { day: 0, dayName: 'Domingo', closed: true, periods: [] }
];
const DEFAULT_SCHEDULE_STRING = JSON.stringify(DEFAULT_SCHEDULE);

async function main() {
  console.log('>>> Iniciando backfill con Prisma para rellenar campos nulos/vacíos...');

  // 1. Backfill LocalService
  console.log('Actualizando LocalService...');
  
  // Rellenar dirección nula o vacía
  const servicesToUpdateAddress = await prisma.localService.findMany({
    where: {
      OR: [
        { address: null },
        { address: '' }
      ]
    }
  });
  console.log(`Encontrados ${servicesToUpdateAddress.length} LocalService con dirección vacía.`);
  if (servicesToUpdateAddress.length > 0) {
    const ids = servicesToUpdateAddress.map(s => s.id);
    await prisma.localService.updateMany({
      where: { id: { in: ids } },
      data: { address: 'Aluminé' }
    });
    console.log('✓ Direcciones de LocalService actualizadas.');
  }

  // Rellenar horarios nulos o vacíos en LocalService
  const servicesToUpdateHours = await prisma.localService.findMany({
    where: {
      OR: [
        { openingHours: null },
        { openingHours: '' }
      ]
    }
  });
  console.log(`Encontrados ${servicesToUpdateHours.length} LocalService con horarios vacíos.`);
  if (servicesToUpdateHours.length > 0) {
    const ids = servicesToUpdateHours.map(s => s.id);
    await prisma.localService.updateMany({
      where: { id: { in: ids } },
      data: { openingHours: DEFAULT_SCHEDULE_STRING }
    });
    console.log('✓ Horarios de LocalService actualizados.');
  }

  // Rellenar coordenadas nulas en LocalService
  const servicesToUpdateCoords = await prisma.localService.findMany({
    where: {
      OR: [
        { latitude: null },
        { longitude: null },
        { latitude: 0 },
        { longitude: 0 }
      ]
    }
  });
  console.log(`Encontrados ${servicesToUpdateCoords.length} LocalService con coordenadas vacías/cero.`);
  for (const s of servicesToUpdateCoords) {
    await prisma.localService.update({
      where: { id: s.id },
      data: {
        latitude: s.latitude ? s.latitude : -38.87942114574949,
        longitude: s.longitude ? s.longitude : -71.18375154775678
      }
    });
  }
  console.log('✓ Coordenadas de LocalService actualizadas.');

  // 2. Backfill para otras entidades (Business, Accommodation, Adventure, Commerce)
  // Gastronomía (Business)
  const businesses = await prisma.business.findMany({
    where: {
      OR: [
        { latitude: null },
        { longitude: null },
        { openingHours: null },
        { openingHours: '' }
      ]
    }
  });
  console.log(`Encontrados ${businesses.length} Business con datos incompletos.`);
  for (const b of businesses) {
    await prisma.business.update({
      where: { id: b.id },
      data: {
        latitude: b.latitude || -38.87942114574949,
        longitude: b.longitude || -71.18375154775678,
        openingHours: b.openingHours || DEFAULT_SCHEDULE_STRING
      }
    });
  }

  // Alojamientos (Accommodation)
  const accommodations = await prisma.accommodation.findMany({
    where: {
      OR: [
        { latitude: null },
        { longitude: null },
        { openingHours: null },
        { openingHours: '' }
      ]
    }
  });
  console.log(`Encontrados ${accommodations.length} Accommodation con datos incompletos.`);
  for (const a of accommodations) {
    await prisma.accommodation.update({
      where: { id: a.id },
      data: {
        latitude: a.latitude || -38.87942114574949,
        longitude: a.longitude || -71.18375154775678,
        openingHours: a.openingHours || DEFAULT_SCHEDULE_STRING
      }
    });
  }

  // Aventuras (Adventure)
  const adventures = await prisma.adventure.findMany({
    where: {
      OR: [
        { latitude: null },
        { longitude: null },
        { openingHours: null },
        { openingHours: '' }
      ]
    }
  });
  console.log(`Encontrados ${adventures.length} Adventure con datos incompletos.`);
  for (const adv of adventures) {
    await prisma.adventure.update({
      where: { id: adv.id },
      data: {
        latitude: adv.latitude || -38.87942114574949,
        longitude: adv.longitude || -71.18375154775678,
        openingHours: adv.openingHours || DEFAULT_SCHEDULE_STRING
      }
    });
  }

  // Comercios (Commerce)
  const commerces = await prisma.commerce.findMany({
    where: {
      OR: [
        { latitude: null },
        { longitude: null },
        { openingHours: null },
        { openingHours: '' },
        { locality: null },
        { locality: '' }
      ]
    }
  });
  console.log(`Encontrados ${commerces.length} Commerce con datos incompletos.`);
  for (const c of commerces) {
    await prisma.commerce.update({
      where: { id: c.id },
      data: {
        latitude: c.latitude || -38.87942114574949,
        longitude: c.longitude || -71.18375154775678,
        openingHours: c.openingHours || DEFAULT_SCHEDULE_STRING,
        locality: c.locality || 'Aluminé'
      }
    });
  }

  console.log('>>> Backfill completado con éxito.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

