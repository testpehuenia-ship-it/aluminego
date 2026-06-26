import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Phone, ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';
import ReviewSection from '@/components/ReviewSection';
import EntityMap from '@/components/EntityMap';
import OpeningStatusBadge from '@/components/OpeningStatusBadge';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  let commerce = await prisma.commerce.findUnique({
    where: { slug: id }
  });

  if (!commerce) {
    commerce = await prisma.commerce.findUnique({
      where: { id }
    });
  }

  if (!commerce) {
    return { title: 'Comercio no encontrado | AluminéGO' };
  }

  const locality = commerce.locality || 'Aluminé';

  return {
    title: `${commerce.name} en ${locality} | Tiendas y Mercados`,
    description: `Conoce los detalles, contacto y ubicación de ${commerce.name} en ${locality} y Moquehue. Rubro: ${commerce.type}.`,
    alternates: {
      canonical: `https://www.aluminego.ar/comercios/${commerce.slug || commerce.id}`,
    },
    openGraph: {
      title: `${commerce.name} | AluminéGO`,
      description: `Comercio en ${locality}: ${commerce.name}.`,
      images: commerce.image ? [commerce.image.split(',')[0]] : [],
    }
  };
}

export default async function CommerceDetailPage({ params }: PageProps) {
  const { id } = await params;
  let commerce = await prisma.commerce.findUnique({
    where: { slug: id },
    include: {
      details: true,
      subscription: true,
      reviews: {
        where: { approved: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!commerce) {
    commerce = await prisma.commerce.findUnique({
      where: { id },
      include: {
        details: true,
        subscription: true,
        reviews: {
          where: { approved: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  if (!commerce) {
    notFound();
  }

  const whatsappMsg = `Hola ${commerce.name}, vi su perfil en AluminéGO y me gustaría hacerles una consulta...`;
  const images = commerce.image ? commerce.image.split(',').filter(Boolean) : [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    'name': commerce.name,
    'description': commerce.description || `Conoce los detalles, contacto y ubicación de ${commerce.name} en ${commerce.locality || 'Aluminé'}.`,
    'image': images,
    'telephone': commerce.whatsapp ? `+549${commerce.whatsapp}` : undefined,
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': commerce.locality || 'Aluminé',
      'addressRegion': 'Neuquén',
      'addressCountry': 'AR'
    },
    'geo': (commerce.latitude !== null && commerce.longitude !== null) ? {
      '@type': 'GeoCoordinates',
      'latitude': commerce.latitude,
      'longitude': commerce.longitude
    } : undefined,
    'url': `https://www.aluminego.ar/comercios/${commerce.slug || commerce.id}`
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', paddingBottom: '80px' }}>
      <div style={{ position: 'relative', height: '40vh', width: '100%', minHeight: '300px' }}>
        {images.length > 0 ? (
          <Image src={images[0]} alt={commerce.name} fill style={{ objectFit: 'cover' }} priority />
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: '#cbd5e1' }} />
        )}
        <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
          <Link href="/comercios" style={{ backgroundColor: 'rgba(255,255,255,0.9)', padding: '8px 16px', borderRadius: '20px', textDecoration: 'none', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', boxShadow: 'var(--shadow-md)' }}>
            <ArrowLeft size={18} /> Volver a Comercios
          </Link>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '40px 20px 20px' }}>
          <span style={{ backgroundColor: 'var(--color-green)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', display: 'inline-block' }}>
            {commerce.type}
          </span>
          <h1 style={{ color: 'white', fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>{commerce.name}</h1>
        </div>
      </div>

      <div className="container" style={{ marginTop: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            {commerce.description && (
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '12px' }}>Descripción</h2>
                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{commerce.description}</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {commerce.whatsapp && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>
                  <Phone color="#25D366" /> <span>{commerce.whatsapp}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>
                <OpeningStatusBadge openingHours={commerce.openingHours} showWeeklySchedule={true} />
              </div>
            </div>
            
            {commerce.whatsapp && (
              <a href={`https://wa.me/${commerce.whatsapp}?text=${encodeURIComponent(whatsappMsg)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#25D366', color: 'white', padding: '16px', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '24px', boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)' }}>
                <Phone size={24} /> Contactar por WhatsApp
              </a>
            )}
          </div>

          {commerce.details && commerce.details.length > 0 && (
            <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '16px' }}>Detalle</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {commerce.details.map((d) => (
                  <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-main)' }}>
                    <Info size={18} color="var(--color-green)" />
                    <span>{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {images.length > 1 && (
            <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '16px' }}>Galería</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                {images.slice(1).map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', height: '150px', borderRadius: '12px', overflow: 'hidden' }}>
                    <Image src={img} alt={`${commerce.name} foto ${idx + 2}`} fill style={{ objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Render map if coordinates exist */}
          {commerce.latitude !== null && commerce.longitude !== null && (
            <EntityMap 
              latitude={commerce.latitude} 
              longitude={commerce.longitude} 
              title={commerce.name} 
            />
          )}

        </div>

        <ReviewSection
          entityId={commerce.id}
          entityType="commerce"
          initialReviews={commerce.reviews}
        />
      </div>
    </div>
    </>
  );
}
