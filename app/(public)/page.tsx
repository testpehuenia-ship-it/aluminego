import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import HomeClient from './HomeClient';
import { getAluminéWeather } from '@/lib/services/weather';

export const metadata: Metadata = {
  title: 'AluminéGO | Guía turística y Delivery en Aluminé',
  description: 'La Guía turística y Local definitiva. Encuentra alojamiento, gastronomía, excursiones, aventuras, estado de las rutas, clima y servicios en Aluminé.',
  keywords: ['Aluminé', 'Guía turística Aluminé', 'delivery Aluminé', 'comer en Aluminé', 'cabañas Aluminé', 'turismo patagonia'],
  openGraph: {
    title: 'AluminéGO | Guía turística y Delivery en Aluminé',
    description: 'La Guía turística y Local definitiva. Encuentra alojamiento, gastronomía, excursiones, aventuras, estado de las rutas, clima y servicios en Aluminé.',
    url: '/',
  }
};

// Revalida el caché cada 60 segundos (ISR)
export const revalidate = 60;

export default async function Page() {
  const [categories, weatherData] = await Promise.all([
    prisma.category.findMany({ orderBy: { title: 'asc' } }),
    getAluminéWeather()
  ]);
  
  return <HomeClient 
    initialCategories={JSON.parse(JSON.stringify(categories))} 
    weatherData={weatherData} 
  />;
}


