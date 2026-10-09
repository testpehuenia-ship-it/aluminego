import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import HomeClient from './HomeClient';
import { getAlumineWeather } from '@/lib/services/weather';

export const metadata: Metadata = {
  title: {
    absolute: 'AluminéGO | Guía Digital y Comercial de Aluminé, Neuquén',
  },
  description: 'Guía oficial de Aluminé: gastronomía, delivery, cabañas, hoteles, rafting en Río Aluminé, Ruca Choroy, Quillén y estado oficial de rutas.',
  keywords: ['aluminé', 'alumine neuquen', 'guía turística alumine', 'delivery alumine', 'comer en alumine', 'cabañas alumine', 'rafting alumine', 'turismo patagonia'],
  alternates: {
    canonical: 'https://www.aluminego.ar',
  },
  openGraph: {
    title: 'AluminéGO | Guía Digital y Comercial de Aluminé, Neuquén',
    description: 'Guía oficial de Aluminé: gastronomía, delivery, cabañas, hoteles, rafting en Río Aluminé, Ruca Choroy, Quillén y estado oficial de rutas.',
    url: 'https://www.aluminego.ar',
  }
};

// Revalida el caché cada 60 segundos (ISR)
export const revalidate = 60;

export default async function Page() {
  const [categories, weatherData] = await Promise.all([
    prisma.category.findMany({ orderBy: { title: 'asc' } }),
    getAlumineWeather()
  ]);
  
  return <HomeClient 
    initialCategories={JSON.parse(JSON.stringify(categories))} 
    weatherData={weatherData} 
  />;
}
