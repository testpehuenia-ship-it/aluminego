import { prisma } from '../lib/db';

const GASTRONOMY_CATEGORIES = [
  { title: "Restaurante", link: "/comer#restaurante", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=400&q=80" },
  { title: "Pizzería", link: "/comer#pizzería", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80" },
  { title: "Hamburguesa", link: "/comer#hamburguesa", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80" },
  { title: "Cervecería", link: "/comer#cervecería", image: "https://images.unsplash.com/photo-1532634922-8fe0b757fb13?auto=format&fit=crop&w=400&q=80" },
  { title: "Rotisería", link: "/comer#rotisería", image: "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?auto=format&fit=crop&w=400&q=80" },
  { title: "Cafetería y Heladería", link: "/comer#cafetería", image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80" },
  { title: "Bar y Pub", link: "/comer#bar", image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=400&q=80" },
  { title: "Parrilla y Minutas", link: "/comer#parrilla", image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80" }
];

const NON_GASTRONOMY_COMMERCE_TITLES = [
  "Ferretería y Construcción",
  "Ferretería",
  "Farmacias y Salud",
  "Farmacia",
  "Forrajería y Agro",
  "Forrajería",
  "Supermercados y Almacenes",
  "Supermercado",
  "Indumentaria y Calzado",
  "Parques, Jardines, Mascotas",
  "Regionales y Artesanías",
  "Kioscos y Regalería",
  "Librerías y Fotografía",
  "Hogar y Decoración",
  "Servicios y Medios",
  "Otros Comercios"
];

async function main() {
  console.log('>>> 1. Asegurando categorías gastronómicas en la base de datos...');
  for (const cat of GASTRONOMY_CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: {
        OR: [
          { title: cat.title },
          { link: cat.link }
        ]
      }
    });

    if (!existing) {
      await prisma.category.create({ data: cat });
      console.log(`✓ Creada categoría gastronómica: ${cat.title}`);
    } else if (existing.link !== cat.link) {
      await prisma.category.update({
        where: { id: existing.id },
        data: { link: cat.link }
      });
      console.log(`✓ Actualizado link de categoría: ${cat.title} -> ${cat.link}`);
    }
  }

  console.log('\n>>> 2. Verificando que categorías de Comercios tengan enlace a /comercios...');
  for (const title of NON_GASTRONOMY_COMMERCE_TITLES) {
    const existing = await prisma.category.findFirst({
      where: { title }
    });

    if (existing && (!existing.link || existing.link.startsWith('/comer#') || existing.link === '/comer')) {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const correctLink = `/comercios#${slug}`;
      await prisma.category.update({
        where: { id: existing.id },
        data: { link: correctLink }
      });
      console.log(`✓ Reubicada categoría comercial: ${title} -> ${correctLink}`);
    }
  }

  console.log('\n✓ Proceso de limpieza de categorías gastronómicas finalizado con éxito.');
}

main().catch(console.error);
