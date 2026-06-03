const { prisma } = require('../lib/db');

async function main() {
  const business = await prisma.business.findFirst();
  
  if (business) {
    const today = new Date();
    
    // Crear suscripción al día
    const due1 = new Date();
    due1.setDate(today.getDate() + 15);
    
    await prisma.subscription.create({
      data: {
        clientName: business.name,
        planType: 'Comercio Básico',
        price: 15000,
        businessId: business.id,
        dueDate: due1,
      }
    });

    console.log('Suscripción de prueba creada.');
  } else {
    console.log('No se encontraron comercios para crear suscripción de prueba.');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
