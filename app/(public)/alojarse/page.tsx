import { Metadata } from 'next';
import { prisma, getActiveSubscriptionWhere } from '@/lib/db';
import AlojarseClient from './AlojarseClient';

export const metadata: Metadata = {
  title: 'Dónde Alojarse en Aluminé | Cabañas, Hoteles y Camping',
  description: 'Encuentra las mejores cabañas, hoteles, hostels y campings en Aluminé y Moquehue. Compara servicios, comodidades y reserva directo por WhatsApp.',
  keywords: ['cabañas Aluminé', 'alojarse en Aluminé', 'hoteles Aluminé', 'camping Aluminé', 'alojamiento patagonia'],
  openGraph: {
    title: 'Dónde Alojarse en Aluminé | Cabañas y Complejos Turísticos',
    description: 'Encuentra cabañas y hoteles recomendados frente al lago en Aluminé y Moquehue. Contacta directo por WhatsApp.',
    url: '/alojarse',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&h=630&q=80',
        width: 1200,
        height: 630,
        alt: 'Cabañas en Aluminé'
      }
    ]
  }
};

// Revalida el caché cada 60 segundos (ISR)
export const revalidate = 60;

export default async function Page() {
  const accommodations = await prisma.accommodation.findMany({
    where: getActiveSubscriptionWhere(),
    include: {
      features: true
    },
    orderBy: { name: 'asc' }
  });
  
  return <AlojarseClient initialAccommodations={JSON.parse(JSON.stringify(accommodations))} />;
}
