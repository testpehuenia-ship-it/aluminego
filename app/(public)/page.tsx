import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import HomeClient from './HomeClient';
import { getAluminéWeather } from '@/lib/services/weather';

export const metadata: Metadata = {
  title: 'Guía Local y Delivery en Aluminé | AlumineGo',
  description: 'Descubre los mejores alojamientos, dónde comer rico y qué aventuras hacer en Aluminé y Moquehue. Pide comida por WhatsApp en minutos.',
  keywords: ['Aluminé', 'delivery Aluminé', 'comer en Aluminé', 'cabañas Aluminé', 'turismo patagonia'],
  openGraph: {
    title: 'AlumineGo | Guía Local y Delivery en Aluminé',
    description: 'Encuentra alojamiento, gastronomía y aventuras en Aluminé. Tu guía local digital patagónica.',
    url: '/',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&h=630&q=80',
        width: 1200,
        height: 630,
        alt: 'Aluminé Lago Aluminé'
      }
    ]
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
