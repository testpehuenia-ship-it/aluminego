import { Metadata } from 'next';
import { prisma, getActiveSubscriptionWhere } from '@/lib/db';
import AventurasClient from './AventurasClient';

export const metadata: Metadata = {
  title: 'Qué Hacer y Aventuras en Aluminé | Excursiones',
  description: 'Descubre increíbles actividades en Aluminé: trekking, paseos lacustres, cabalgatas, esquí en el Batea Mahuida y pesca con mosca. Reserva directo por WhatsApp.',
  keywords: ['Qué hacer en Aluminé', 'actividades Aluminé', 'excursiones Aluminé', 'cabalgatas Aluminé', 'nieve batea mahuida', 'pesca en Aluminé'],
  alternates: {
    canonical: 'https://www.AluminéGO.ar/aventuras',
  },
  openGraph: {
    title: 'Qué Hacer y Actividades de Aventura en Aluminé',
    description: 'Trekking guiado, cabalgatas por araucarias milenarias y paseos náuticos en la Patagonia. Contacta y reserva directo.',
    url: '/aventuras',
  }
};

// Revalida el caché cada 60 segundos (ISR)
export const revalidate = 60;

export default async function Page() {
  const [adventures, categories] = await Promise.all([
    prisma.adventure.findMany({
      where: getActiveSubscriptionWhere(),
      include: {
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
    'name': 'Excursiones y Aventuras en Aluminé',
    'description': 'Directorio de actividades recreativas, excursiones guiadas, paseos lacustres y deportes de aventura en Aluminé.',
    'url': 'https://www.AluminéGO.ar/aventuras',
    'itemListElement': adventures.map((adv, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'TouristAttraction',
        'name': adv.name,
        'image': adv.image ? adv.image.split(',').filter(Boolean) : [],
        'description': adv.description || undefined,
        'url': `https://www.AluminéGO.ar/aventuras/${adv.id}`,
        'telephone': adv.whatsapp ? `+549${adv.whatsapp}` : undefined,
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
      <AventurasClient 
        initialAdventures={JSON.parse(JSON.stringify(adventures))} 
        initialCategories={JSON.parse(JSON.stringify(categories))} 
      />
    </>
  );
}


