import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Phone, ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';
import ReviewSection from '@/components/ReviewSection';
import EntityMap from '@/components/EntityMap';
import OpeningStatusBadge from '@/components/OpeningStatusBadge';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const alojamiento = await prisma.accommodation.findUnique({
    where: { id }
  });

  if (!alojamiento) {
    return { title: 'Alojamiento no encontrado | AluminéGO' };
  }

  return {
    title: `${alojamiento.name} en Aluminé | Alojamiento`,
    description: `Conoce los detalles, características y reserva en ${alojamiento.name}. Alojamiento en Aluminé tipo: ${alojamiento.type}.`,
    alternates: {
      canonical: `https://www.aluminego.ar/alojarse/${alojamiento.id}`,
    },
    openGraph: {
      title: `${alojamiento.name} | AluminéGO`,
      description: `Alojamiento en Aluminé: ${alojamiento.name}.`,
      images: alojamiento.image ? [alojamiento.image.split(',')[0]] : [],
    }
  };
}

export default async function AlojamientoDetallePage({ params }: PageProps) {
  const { id } = await params;
  const alojamiento = await prisma.accommodation.findUnique({
    where: { id },
    include: {
      features: true,
      subscription: true,
      reviews: {
        where: { approved: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!alojamiento) {
    notFound();
  }

  const whatsappMsg = `Hola ${alojamiento.name}, vi su perfil en AluminéGO y me gustaría consultar disponibilidad...`;
  const images = alojamiento.image ? alojamiento.image.split(',').filter(Boolean) : [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    'name': alojamiento.name,
    'description': alojamiento.description || `Conoce los detalles, características y reserva en ${alojamiento.name} en Aluminé.`,
    'image': images,
    'telephone': alojamiento.whatsapp ? `+549${alojamiento.whatsapp}` : undefined,
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': 'Aluminé',
      'addressRegion': 'Neuquén',
      'addressCountry': 'AR'
    },
    'geo': (alojamiento.latitude !== null && alojamiento.longitude !== null) ? {
      '@type': 'GeoCoordinates',
      'latitude': alojamiento.latitude,
      'longitude': alojamiento.longitude
    } : undefined,
    'url': `https://www.aluminego.ar/alojarse/${alojamiento.id}`,
    'amenityFeature': alojamiento.features && alojamiento.features.length > 0 ? alojamiento.features.map(f => ({
      '@type': 'LocationFeatureSpecification',
      'name': f.name,
      'value': true
    })) : undefined
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
          <Image src={images[0]} alt={alojamiento.name} fill style={{ objectFit: 'cover' }} priority />
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: '#cbd5e1' }} />
        )}
        <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
          <Link href="/alojarse" style={{ backgroundColor: 'rgba(255,255,255,0.9)', padding: '8px 16px', borderRadius: '20px', textDecoration: 'none', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', boxShadow: 'var(--shadow-md)' }}>
            <ArrowLeft size={18} /> Volver a Alojamientos
          </Link>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '40px 20px 20px' }}>
          <span style={{ backgroundColor: 'var(--color-orange)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', display: 'inline-block' }}>
            {alojamiento.type}
          </span>
          <h1 style={{ color: 'white', fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>{alojamiento.name}</h1>
        </div>
      </div>

      <div className="container" style={{ marginTop: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            {alojamiento.description && (
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '12px' }}>Descripción</h2>
                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{alojamiento.description}</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {alojamiento.whatsapp && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>
                  <Phone color="#25D366" /> <span>{alojamiento.whatsapp}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>
                <OpeningStatusBadge openingHours={alojamiento.openingHours} showWeeklySchedule={true} />
              </div>
            </div>
            
            {alojamiento.whatsapp && (
              <a href={`https://wa.me/${alojamiento.whatsapp}?text=${encodeURIComponent(whatsappMsg)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#25D366', color: 'white', padding: '16px', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '24px', boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)' }}>
                <Phone size={24} /> Consultar Disponibilidad
              </a>
            )}
          </div>

          {alojamiento.features && alojamiento.features.length > 0 && (
            <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '16px' }}>Servicios y Comodidades</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {alojamiento.features.map((f) => (
                  <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-main)' }}>
                    <Check size={18} color="var(--color-green)" />
                    <span>{f.name}</span>
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
                    <Image src={img} alt={`${alojamiento.name} foto ${idx + 2}`} fill style={{ objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {alojamiento.latitude !== null && alojamiento.longitude !== null && (
            <EntityMap 
              latitude={alojamiento.latitude} 
              longitude={alojamiento.longitude} 
              title={alojamiento.name} 
            />
          )}

        </div>

        <ReviewSection
          entityId={alojamiento.id}
          entityType="accommodation"
          initialReviews={alojamiento.reviews}
        />
      </div>
    </div>
    </>
  );
}
