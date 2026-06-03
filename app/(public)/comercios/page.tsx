import { Metadata } from 'next';
import { prisma, getActiveSubscriptionWhere } from '@/lib/db';
import ComerciosClient from './ComerciosClient';

export const metadata: Metadata = {
  title: 'Guía Local y Comercios de Aluminé | Servicios',
  description: 'Directorio completo de comercios, farmacias, supermercados, instituciones y servicios públicos en Aluminé y Moquehue. Dirección y contacto directo.',
  keywords: ['guia local Aluminé', 'comercios en Aluminé', 'servicios Aluminé', 'farmacias en Aluminé', 'supermercado Aluminé'],
  openGraph: {
    title: 'Guía Local, Comercios y Servicios en Aluminé | AlumineGo',
    description: 'Encuentra comercios, instituciones públicas, números de emergencia, farmacias y más en el directorio definitivo de la villa.',
    url: '/comercios',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&h=630&q=80',
        width: 1200,
        height: 630,
        alt: 'Comercios locales en Aluminé'
      }
    ]
  }
};

// Revalida el caché cada 60 segundos (ISR)
export const revalidate = 60;

export default async function Page() {
  const services = await prisma.localService.findMany({
    where: getActiveSubscriptionWhere(),
    orderBy: { name: 'asc' }
  });
  
  return <ComerciosClient initialServices={JSON.parse(JSON.stringify(services))} />;
}
