import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import MapaClient from './MapaClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mapa Interactivo 3D y Estado de Rutas de Aluminé',
  description: 'Explora Aluminé con nuestro mapa 3D interactivo. Conoce las principales rutas de acceso desde NeuQuén y Aluminé.',
  keywords: ['mapa Aluminé', 'rutas a Aluminé', 'moquehue mapa 3d', 'como llegar a Aluminé', 'estado de rutas Aluminé'],
  openGraph: {
    title: 'Mapa Interactivo 3D y Rutas de Acceso a Aluminé | AluminéGO',
    description: 'Navega en 3D por la villa, localiza atractivos turísticos y planifica tu ruta de llegada de forma segura.',
    url: '/mapa',
  }
};

export default async function Page() {
  const baseMarkers = await prisma.mapMarker.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const businesses = await prisma.business.findMany({
    where: { 
      latitude: { not: null }, 
      longitude: { not: null },
      subscription: {
        is: {
          planType: {
            contains: 'plan_comercio_completo'
          }
        }
      }
    },
    include: { category: true }
  });

  const accommodations = await prisma.accommodation.findMany({
    where: { 
      latitude: { not: null }, 
      longitude: { not: null },
      subscription: {
        is: {
          planType: {
            contains: 'plan_comercio_completo'
          }
        }
      }
    }
  });

  // Map into marker format
  const mappedBusinesses = businesses.map(b => ({
    id: b.id,
    title: b.name,
    description: b.category?.title || 'gastronomía',
    latitude: b.latitude!,
    longitude: b.longitude!,
    color: '#ea580c', // Naranja
    createdAt: b.createdAt,
    updatedAt: b.updatedAt
  }));

  const mappedAccommodations = accommodations.map(a => ({
    id: a.id,
    title: a.name,
    description: a.type || 'Alojamiento',
    latitude: a.latitude!,
    longitude: a.longitude!,
    color: '#3b82f6', // Azul
    createdAt: a.createdAt,
    updatedAt: a.updatedAt
  }));

  const markers = [...baseMarkers, ...mappedBusinesses, ...mappedAccommodations];

  return <MapaClient 
    initialMarkers={JSON.parse(JSON.stringify(markers))} 
  />;
}


