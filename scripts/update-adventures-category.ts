import 'dotenv/config';
import { prisma } from '../lib/db';

async function main() {
  console.log('>>> Actualizando categoría de Aventuras en la base de datos remota...');

  // Buscar todos los LocalService que están vinculados a un Adventure a través de la suscripción
  const services = await prisma.localService.findMany({
    include: {
      subscription: true
    }
  });

  let count = 0;
  for (const service of services) {
    // Si la suscripción tiene adventureId, significa que es una aventura
    // O si su categoría actual es 'Servicios Varios y Actividades'
    const isAdventure = service.subscription?.adventureId !== null || service.category === 'Servicios Varios y Actividades';
    
    if (isAdventure && service.category !== 'Aventuras') {
      console.log(`Actualizando "${service.name}" de "${service.category}" a "Aventuras"...`);
      await prisma.localService.update({
        where: { id: service.id },
        data: {
          category: 'Aventuras'
        }
      });
      count++;
    }
  }

  console.log(`>>> Se actualizaron ${count} servicios locales a la categoría "Aventuras".`);
}

main().catch(console.error);
