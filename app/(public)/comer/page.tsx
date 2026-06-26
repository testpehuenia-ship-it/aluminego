import { Metadata } from 'next';
import { prisma, getActiveSubscriptionWhere } from '@/lib/db';
import ComerClient from './ComerClient';

export const metadata: Metadata = {
  title: 'Dónde Comer y Delivery en Aluminé | Restaurantes',
  description: 'Descubre las mejores pizzerías, hamburgueserías, cervecerías y restaurantes en Aluminé. Arma tu pedido online y envíalo por WhatsApp.',
  keywords: ['dónde comer en Aluminé', 'delivery Aluminé', 'restaurantes Aluminé', 'pizzerias Aluminé', 'comida a domicilio Aluminé'],
  alternates: {
    canonical: 'https://www.AluminéGO.ar/comer',
  },
  openGraph: {
    title: 'Dónde Comer y Delivery en Aluminé | AluminéGO',
    description: 'Arma tu pedido online de comida rápida, pizzas o platos regionales y recíbelo en tu cabaña en minutos.',
    url: '/comer',
  }
};

// Revalida el caché cada 60 segundos (ISR)
export const revalidate = 60;

export default async function Page() {
  const [categories, businesses] = await Promise.all([
    prisma.category.findMany({
      orderBy: { title: 'asc' }
    }),
    prisma.business.findMany({
      where: getActiveSubscriptionWhere(),
      include: {
        menu: true,
        category: true,
        subscription: true
      },
      orderBy: { name: 'asc' }
    })
  ]);

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'Restaurantes y Delivery en Aluminé',
    'description': 'Directorio de locales gastronómicos, restaurantes, cervecerías y rotiserías con delivery en Aluminé.',
    'url': 'https://www.AluminéGO.ar/comer',
    'itemListElement': businesses.map((b, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'FoodEstablishment',
        'name': b.name,
        'image': b.image ? [b.image] : [],
        'description': b.description || undefined,
        'url': `https://www.AluminéGO.ar/comer/${b.id}`,
        'telephone': b.whatsapp ? `+549${b.whatsapp}` : undefined,
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': 'Aluminé',
          'addressRegion': 'NeuQuén',
          'addressCountry': 'AR'
        }
      }
    }))
  };
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <ComerClient 
        initialCategories={JSON.parse(JSON.stringify(categories))} 
        initialBusinesses={JSON.parse(JSON.stringify(businesses))} 
      />
    </>
  );
}


