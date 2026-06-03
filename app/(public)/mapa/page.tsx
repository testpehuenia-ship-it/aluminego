import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { getDPVStatus } from '@/lib/services/dpv';
import { getAluminéWeather } from '@/lib/services/weather';
import MapaClient from './MapaClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mapa Interactivo 3D y Estado de Rutas de Aluminé',
  description: 'Explora Aluminé y Moquehue con nuestro mapa 3D interactivo. Conoce las principales rutas de acceso desde Neuquén y Aluminé.',
  keywords: ['mapa Aluminé', 'rutas a Aluminé', 'moquehue mapa 3d', 'como llegar a Aluminé', 'estado de rutas Aluminé'],
  openGraph: {
    title: 'Mapa Interactivo 3D y Rutas de Acceso a Aluminé | AlumineGo',
    description: 'Navega en 3D por la villa, localiza atractivos turísticos y planifica tu ruta de llegada de forma segura.',
    url: '/mapa',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&h=630&q=80',
        width: 1200,
        height: 630,
        alt: 'Mapa de Aluminé'
      }
    ]
  }
};

export default async function Page() {
  const markers = await prisma.mapMarker.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const [dpvData, weatherData] = await Promise.all([
    getDPVStatus(),
    getAluminéWeather()
  ]);

  return <MapaClient 
    initialMarkers={JSON.parse(JSON.stringify(markers))} 
    dpvData={dpvData} 
    weatherData={weatherData} 
  />;
}
