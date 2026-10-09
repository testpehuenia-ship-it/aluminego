import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import MapaClient from './MapaClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mapa Interactivo y Estado de Rutas de Aluminé | AluminéGO',
  description: 'Explora Aluminé con nuestro mapa interactivo. Consulta atractivos, servicios locales, clima y el estado oficial de rutas de la DPV Neuquén.',
  keywords: ['mapa aluminé', 'rutas a aluminé', 'como llegar a aluminé', 'estado de rutas aluminé', 'clima aluminé', 'vialidad neuquén'],
  alternates: {
    canonical: 'https://www.aluminego.ar/mapa',
  },
  openGraph: {
    title: 'Mapa Interactivo y Rutas de Acceso a Aluminé | AluminéGO',
    description: 'Navega por Aluminé, localiza atractivos turísticos, prestadores y planifica tu viaje de forma segura.',
    url: 'https://www.aluminego.ar/mapa',
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
    description: b.category?.title || 'Gastronomía',
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
