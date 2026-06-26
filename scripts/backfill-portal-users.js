const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function backfill() {
  const d = String(new Date().getDate()).padStart(2, '0');
  const m = String(new Date().getMonth() + 1).padStart(2, '0');
  const y = new Date().getFullYear();
  const password = `AluminéGO${d}${m}${y}`;
  let count = 0;

  // Function to process entities
  async function processEntity(model, includeBusiness = false) {
    const entities = await model.findMany({
      where: {
        portalUserId: null,
        subscription: {
          OR: [
            { planType: { contains: 'plan_comercio_completo' } },
            { planType: { contains: 'plan_basico_destacado' } }
          ]
        }
      },
      include: { subscription: true }
    });

    for (const entity of entities) {
      const safeName = entity.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      let email = `${safeName}@AluminéGO.ar`;
      
      // Check if email already exists
      let portalUser = await prisma.portalUser.findUnique({ where: { email } });
      
      // Handle duplicates (like 2 places with same name)
      let counter = 1;
      while (portalUser) {
        email = `${safeName}${counter}@AluminéGO.ar`;
        portalUser = await prisma.portalUser.findUnique({ where: { email } });
        counter++;
      }

      const newUser = await prisma.portalUser.create({
        data: {
          name: entity.name,
          email,
          password
        }
      });

      await model.update({
        where: { id: entity.id },
        data: { portalUserId: newUser.id }
      });
      console.log(`Created user ${email} for ${entity.name}`);
      count++;
    }
  }

  await processEntity(prisma.business);
  await processEntity(prisma.accommodation);
  await processEntity(prisma.adventure);
  
  console.log(`Backfill complete. Created ${count} users.`);
}

backfill()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

