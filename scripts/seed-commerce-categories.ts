import { prisma } from '../lib/db';

const COMMERCE_CATEGORIES = [
  { title: "Supermercados y Almacenes", link: "/comercios#supermercados", image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=400&q=80" },
  { title: "Indumentaria y Calzado", link: "/comercios#indumentaria", image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=400&q=80" },
  { title: "Farmacias y Salud", link: "/comercios#farmacias", image: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=400&q=80" },
  { title: "Ferretería y Construcción", link: "/comercios#ferretería", image: "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=400&q=80" },
  { title: "Parques, Jardines, Mascotas", link: "/comercios#parques-jardines-mascotas", image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=400&q=80" },
  { title: "Regionales y Artesanías", link: "/comercios#regionales", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80" },
  { title: "Kioscos y Regalería", link: "/comercios#kioscos", image: "https://images.unsplash.com/photo-1526178613552-2b45c6c302f0?auto=format&fit=crop&w=400&q=80" },
  { title: "Panaderías y Pastelerías", link: "/comercios#panaderías", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80" },
  { title: "Librerías y Fotografía", link: "/comercios#librerías", image: "https://images.unsplash.com/photo-1507842229456-748530865586?auto=format&fit=crop&w=400&q=80" },
  { title: "Hogar y Decoración", link: "/comercios#hogar", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80" },
  { title: "Servicios y Medios", link: "/comercios#servicios", image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=400&q=80" },
  { title: "Forrajería y Agro", link: "/comercios#forrajería", image: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=400&q=80" },
  { title: "Otros Comercios", link: "/comercios#otros", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80" }
];

async function seedCommerceCategories() {
  console.log('>>> Agregando categorías de Comercios a la Base de Datos...');
  for (const cat of COMMERCE_CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: {
        OR: [
          { title: cat.title },
          { link: cat.link }
        ]
      }
    });

    if (!existing) {
      await prisma.category.create({
        data: cat
      });
      console.log(`✓ Creada categoría: ${cat.title}`);
    } else {
      console.log(`- Ya existe: ${cat.title}`);
    }
  }
  console.log('✓ Proceso de categorías de Comercios completado.');
}

seedCommerceCategories().catch(console.error);
