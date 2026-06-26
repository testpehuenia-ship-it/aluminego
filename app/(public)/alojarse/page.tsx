import { Metadata } from 'next';
import { prisma, getActiveSubscriptionWhere } from '@/lib/db';
import AlojarseClient from './AlojarseClient';

export const metadata: Metadata = {
  title: 'Dónde Alojarse en Aluminé | Cabañas, Hoteles y Camping',
  description: 'Encuentra las mejores cabañas, hoteles, hostels y campings en Aluminé. Compara servicios, comodidades y reserva directo por WhatsApp.',
  keywords: ['cabañas Aluminé', 'alojarse en Aluminé', 'hoteles Aluminé', 'camping Aluminé', 'alojamiento patagonia'],
  alternates: {
    canonical: 'https://www.AluminéGO.ar/alojarse',
  },
  openGraph: {
    title: 'Dónde Alojarse en Aluminé | Cabañas y Complejos Turísticos',
    description: 'Encuentra cabañas y hoteles recomendados frente al lago en Aluminé. Contacta directo por WhatsApp.',
    url: '/alojarse',
  }
};

// Revalida el caché cada 60 segundos (ISR)
export const revalidate = 60;

export default async function Page() {
  const [accommodations, categories] = await Promise.all([
    prisma.accommodation.findMany({
      where: getActiveSubscriptionWhere(),
      include: {
        features: true,
        subscription: true
      },
      orderBy: { name: 'asc' }
    }),
    prisma.category.findMany({
      orderBy: { title: 'asc' }
    })
  ]);

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'Alojamientos en Aluminé',
    'description': 'Directorio de cabañas, hoteles, aparts, hosterías y campings en Aluminé.',
    'url': 'https://www.AluminéGO.ar/alojarse',
    'itemListElement': accommodations.map((a, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'LodgingBusiness',
        'name': a.name,
        'image': a.image ? a.image.split(',').filter(Boolean) : [],
        'description': a.description || undefined,
        'url': `https://www.AluminéGO.ar/alojarse/${a.id}`,
        'telephone': a.whatsapp ? `+549${a.whatsapp}` : undefined,
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
      <AlojarseClient 
        initialAccommodations={JSON.parse(JSON.stringify(accommodations))} 
        initialCategories={JSON.parse(JSON.stringify(categories))} 
      />
    </>
  );
}


