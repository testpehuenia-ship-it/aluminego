import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import ComerciosClient from './ComerciosClient';

export const metadata: Metadata = {
  title: 'Comercios de Aluminé | Tiendas y Mercados',
  description: 'Directorio de comercios, tiendas de regalos, supermercados, despensas, farmacias y más locales en Aluminé.',
  keywords: ['comercios Aluminé', 'tiendas en Aluminé', 'supermercado Aluminé', 'farmacias Aluminé', 'compras Aluminé'],
  alternates: {
    canonical: 'https://www.AluminéGO.ar/comercios',
  },
  openGraph: {
    title: 'Comercios y Tiendas en Aluminé | AluminéGO',
    description: 'Explora los comercios locales, tiendas, despensas, mercados y farmacias de Aluminé.',
    url: '/comercios',
  }
};

// Revalida el caché cada 60 segundos (ISR)
export const revalidate = 60;

export default async function Page() {
  const [commerces, categories] = await Promise.all([
    prisma.commerce.findMany({
      include: {
        subscription: true,
        details: true
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
    'name': 'Comercios y Tiendas en Aluminé',
    'description': 'Directorio comercial de supermercados, despensas, farmacias, fiambrerías y locales en Aluminé.',
    'url': 'https://www.AluminéGO.ar/comercios',
    'itemListElement': commerces.map((comm, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'Store',
        'name': comm.name,
        'image': comm.image ? comm.image.split(',').filter(Boolean) : [],
        'description': comm.description || undefined,
        'url': `https://www.AluminéGO.ar/comercios/${comm.slug || comm.id}`,
        'telephone': comm.whatsapp ? `+549${comm.whatsapp}` : undefined,
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': comm.locality || 'Aluminé',
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
      <ComerciosClient 
        initialCommerces={JSON.parse(JSON.stringify(commerces))} 
        initialCategories={JSON.parse(JSON.stringify(categories))} 
      />
    </>
  );
}


