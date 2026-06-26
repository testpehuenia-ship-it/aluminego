import { Metadata } from 'next';
import { prisma, getActiveSubscriptionWhere } from '@/lib/db';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Phone, ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';
import ReviewSection from '@/components/ReviewSection';
import EntityMap from '@/components/EntityMap';
import OpeningStatusBadge from '@/components/OpeningStatusBadge';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const business = await prisma.business.findUnique({
    where: { id },
    include: { category: true }
  });

  if (!business) {
    return { title: 'Comercio no encontrado | AluminéGO' };
  }

  return {
    title: `${business.name} en Aluminé | Delivery y Menú`,
    description: `Mira el menú, precios y haz tu pedido a ${business.name} en Aluminé por WhatsApp. Categoría: ${business.category.title}.`,
    alternates: {
      canonical: `https://www.aluminego.ar/comer/${business.id}`,
    },
    openGraph: {
      title: `${business.name} | AluminéGO`,
      description: `Menú y delivery de ${business.name} en Aluminé.`,
      images: business.image ? [business.image] : [],
    }
  };
}

export default async function ComercioDetallePage({ params }: PageProps) {
  const { id } = await params;
  const comercio = await prisma.business.findUnique({
    where: { id },
    include: {
      menu: true,
      category: true,
      subscription: true,
      reviews: {
        where: { approved: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!comercio) {
    notFound();
  }

  const whatsappMsg = `Hola ${comercio.name}, vi su perfil en AluminéGO y me gustaría hacerles una consulta...`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    'name': comercio.name,
    'description': comercio.description || `Mira el menú, precios y haz tu pedido a ${comercio.name} en Aluminé por WhatsApp.`,
    'image': comercio.image ? [comercio.image] : [],
    'telephone': comercio.whatsapp ? `+549${comercio.whatsapp}` : undefined,
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': 'Aluminé',
      'addressRegion': 'Neuquén',
      'addressCountry': 'AR',
      'streetAddress': comercio.address || undefined
    },
    'geo': (comercio.latitude !== null && comercio.longitude !== null) ? {
      '@type': 'GeoCoordinates',
      'latitude': comercio.latitude,
      'longitude': comercio.longitude
    } : undefined,
    'url': `https://www.aluminego.ar/comer/${comercio.id}`,
    'hasMenu': (comercio.menu && comercio.menu.length > 0) ? {
      '@type': 'Menu',
      'name': `Menú de ${comercio.name}`,
      'hasMenuItem': comercio.menu.map(item => ({
        '@type': 'MenuItem',
        'name': item.name,
        'description': item.description || undefined,
        'offers': {
          '@type': 'Offer',
          'price': item.price,
          'priceCurrency': 'ARS'
        }
      }))
    } : undefined
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', paddingBottom: '80px' }}>
      <div style={{ position: 'relative', height: '300px', width: '100%' }}>
        {comercio.image ? (
          <Image src={comercio.image} alt={comercio.name} fill style={{ objectFit: 'cover' }} priority />
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: '#cbd5e1' }} />
        )}
        <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
          <Link href="/comer" style={{ backgroundColor: 'rgba(255,255,255,0.9)', padding: '8px 16px', borderRadius: '20px', textDecoration: 'none', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', boxShadow: 'var(--shadow-md)' }}>
            <ArrowLeft size={18} /> Volver a Gastronomía
          </Link>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '40px 20px 20px' }}>
          <span style={{ backgroundColor: 'var(--color-orange)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', display: 'inline-block' }}>
            {comercio.category.title}
          </span>
          <h1 style={{ color: 'white', fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>{comercio.name}</h1>
        </div>
      </div>

      <div className="container" style={{ marginTop: '24px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {comercio.address && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>
                <MapPin color="var(--color-orange)" /> <span>{comercio.address}</span>
              </div>
            )}
            {comercio.whatsapp && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>
                <Phone color="#25D366" /> <span>{comercio.whatsapp}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>
              <OpeningStatusBadge openingHours={comercio.openingHours} showWeeklySchedule={true} />
            </div>
          </div>
          
          {comercio.whatsapp && (
            <a href={`https://wa.me/${comercio.whatsapp}?text=${encodeURIComponent(whatsappMsg)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#25D366', color: 'white', padding: '16px', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '24px', boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)' }}>
              <Phone size={24} /> Contactar por WhatsApp
            </a>
          )}
        </div>

        {comercio.menu && comercio.menu.length > 0 && (
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '20px' }}>Menú Destacado</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {comercio.menu.map((item) => (
                <div key={item.id} style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-main)' }}>{item.name}</h3>
                    {item.description && <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{item.description}</p>}
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-green)' }}>
                    ${item.price}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <ReviewSection
          entityId={comercio.id}
          entityType="business"
          initialReviews={comercio.reviews}
        />
        {comercio.latitude !== null && comercio.longitude !== null && (
          <EntityMap 
            latitude={comercio.latitude} 
            longitude={comercio.longitude} 
            title={comercio.name} 
          />
        )}

      </div>
    </div>
    </>
  );
}
