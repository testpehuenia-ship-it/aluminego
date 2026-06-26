import { Metadata } from 'next';
import { prisma, getActiveSubscriptionWhere } from '@/lib/db';
import GuiaClient from './GuiaClient';

export const metadata: Metadata = {
  title: 'Guía Local de Aluminé | Servicios',
  description: 'Directorio completo de servicios pÁºblicos, emergencias, profesionales, instituciones y comercios en Aluminé. Dirección y contacto directo.',
  keywords: ['guia local Aluminé', 'servicios Aluminé', 'farmacias en Aluminé', 'emergencias Aluminé', 'telefonos utiles Aluminé'],
  alternates: {
    canonical: 'https://www.AluminéGO.ar/guia',
  },
  openGraph: {
    title: 'Guía Local y Servicios en Aluminé | AluminéGO',
    description: 'Encuentra instituciones pÁºblicas, nÁºmeros de emergencia, profesionales, servicios y más en el directorio definitivo de la villa.',
    url: '/guia',
  }
};

// Revalida el caché cada 60 segundos (ISR)
export const revalidate = 60;

export default async function Page() {
  const services = await prisma.localService.findMany({
    include: { subscription: true },
    orderBy: { name: 'asc' }
  });

  const alojamientos = await prisma.accommodation.findMany({
    include: { subscription: true }
  });
  const comer = await prisma.business.findMany({
    include: { subscription: true }
  });
  const aventuras = await prisma.adventure.findMany({
    include: { subscription: true }
  });
  const comercios = await prisma.commerce.findMany({
    include: { subscription: true }
  });

  const graceDate = new Date();
  graceDate.setDate(graceDate.getDate() - 7);

  const mappedServices = services.map(service => {
    let targetUrl = `/guia/${service.id}`;
    let activeSub = service.subscription;

    // Si la suscripción de LocalService está vencida, la consideramos inactiva
    if (activeSub && new Date(activeSub.dueDate) < graceDate) {
      activeSub = null;
    }

    const sName = service.name.toLowerCase().trim();
    
    if (service.category.toLowerCase().includes('alojamiento') || service.category.toLowerCase().includes('dormir')) {
      const match = alojamientos.find(a => a.name.toLowerCase().trim() === sName);
      if (match) {
        targetUrl = `/alojarse/${match.id}`;
        let matchSub = match.subscription;
        if (matchSub && new Date(matchSub.dueDate) < graceDate) {
          matchSub = null;
        }
        if (!activeSub && matchSub) {
          activeSub = matchSub;
        }
      }
    }
    else if (service.category.toLowerCase().includes('gastronomía') || service.category.toLowerCase().includes('comer')) {
      const match = comer.find(a => a.name.toLowerCase().trim() === sName);
      if (match) {
        targetUrl = `/comer/${match.id}`;
        let matchSub = match.subscription;
        if (matchSub && new Date(matchSub.dueDate) < graceDate) {
          matchSub = null;
        }
        if (!activeSub && matchSub) {
          activeSub = matchSub;
        }
      }
    }
    else if (service.category.toLowerCase().includes('aventura') || service.category.toLowerCase().includes('actividad')) {
      const match = aventuras.find(a => a.name.toLowerCase().trim() === sName);
      if (match) {
        targetUrl = `/aventuras/${match.id}`;
        let matchSub = match.subscription;
        if (matchSub && new Date(matchSub.dueDate) < graceDate) {
          matchSub = null;
        }
        if (!activeSub && matchSub) {
          activeSub = matchSub;
        }
      }
    }
    else {
      // Buscar coincidencia en la nueva tabla de Comercios
      const match = comercios.find(c => c.name.toLowerCase().trim() === sName);
      if (match) {
        targetUrl = `/comercios/${match.id}`;
        let matchSub = match.subscription;
        if (matchSub && new Date(matchSub.dueDate) < graceDate) {
          matchSub = null;
        }
        if (!activeSub && matchSub) {
          activeSub = matchSub;
        }
      }
    }

    return {
      ...service,
      subscription: activeSub,
      targetUrl
    };
  });
  
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'Guía Local y Servicios en Aluminé',
    'description': 'Directorio local de servicios de emergencia, salud, fuerzas de seguridad, profesionales, instituciones y comercios de Aluminé.',
    'url': 'https://www.AluminéGO.ar/guia',
    'itemListElement': mappedServices.map((service, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'LocalBusiness',
        'name': service.name,
        'image': service.image ? service.image.split(',').filter(Boolean) : [],
        'description': service.description || undefined,
        'url': `https://www.AluminéGO.ar${service.targetUrl}`,
        'telephone': service.whatsapp && service.subscription ? `+549${service.whatsapp}` : undefined,
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': 'Aluminé',
          'addressRegion': 'NeuQuén',
          'addressCountry': 'AR',
          'streetAddress': service.address || undefined
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
      <GuiaClient initialServices={JSON.parse(JSON.stringify(mappedServices))} />
    </>
  );
}


