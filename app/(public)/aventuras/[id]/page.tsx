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
  const aventura = await prisma.adventure.findUnique({
    where: { id }
  });

  if (!aventura) {
    return { title: 'Aventura no encontrada | AluminéGO' };
  }

  return {
    title: `${aventura.name} en Aluminé | Aventuras y Excursiones`,
    description: `Descubre la aventura: ${aventura.name}. Detalles y contacto directo. Categoría: ${aventura.category}.`,
    alternates: {
      canonical: `https://www.aluminego.ar/aventuras/${aventura.id}`,
    },
    openGraph: {
      title: `${aventura.name} | AluminéGO`,
      description: `Aventura en Aluminé: ${aventura.name}.`,
      images: aventura.image ? [aventura.image.split(',')[0]] : [],
    }
  };
}

export default async function AventuraDetallePage({ params }: PageProps) {
  const { id } = await params;
  const aventura = await prisma.adventure.findUnique({
    where: { id },
    include: {
      subscription: true,
      reviews: {
        where: { approved: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!aventura) {
    notFound();
  }

  const whatsappMsg = `Hola ${aventura.name}, vi su aventura en AluminéGO y me gustaría recibir más información...`;
  const images = aventura.image ? aventura.image.split(',').filter(Boolean) : [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    'name': aventura.name,
    'description': aventura.description || `Descubre la aventura: ${aventura.name} en Aluminé. Detalles y contacto directo.`,
    'image': images,
    'telephone': aventura.whatsapp ? `+549${aventura.whatsapp}` : undefined,
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': 'Aluminé',
      'addressRegion': 'Neuquén',
      'addressCountry': 'AR'
    },
    'geo': (aventura.latitude !== null && aventura.longitude !== null) ? {
      '@type': 'GeoCoordinates',
      'latitude': aventura.latitude,
      'longitude': aventura.longitude
    } : undefined,
    'url': `https://www.aluminego.ar/aventuras/${aventura.id}`
  };
  let details = [];
  try {
    details = JSON.parse(aventura.details);
  } catch(e) {
    if (aventura.details) {
      details = aventura.details.split(',').map((d: string) => d.trim());
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', paddingBottom: '80px' }}>
      <div style={{ position: 'relative', height: '40vh', width: '100%', minHeight: '300px' }}>
        {images.length > 0 ? (
          <Image src={images[0]} alt={aventura.name} fill style={{ objectFit: 'cover' }} priority />
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: '#cbd5e1' }} />
        )}
        <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
          <Link href="/aventuras" style={{ backgroundColor: 'rgba(255,255,255,0.9)', padding: '8px 16px', borderRadius: '20px', textDecoration: 'none', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', boxShadow: 'var(--shadow-md)' }}>
            <ArrowLeft size={18} /> Volver a Aventuras
          </Link>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '40px 20px 20px' }}>
          <span style={{ backgroundColor: 'var(--color-orange)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', display: 'inline-block' }}>
            {aventura.category}
          </span>
          <h1 style={{ color: 'white', fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>{aventura.name}</h1>
        </div>
      </div>

      <div className="container" style={{ marginTop: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            {aventura.description && (
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '12px' }}>Acerca de esta Aventura</h2>
                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{aventura.description}</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {aventura.whatsapp && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>
                  <Phone color="#25D366" /> <span>{aventura.whatsapp}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>
                <OpeningStatusBadge openingHours={aventura.openingHours} showWeeklySchedule={true} />
              </div>
            </div>
            
            {aventura.whatsapp && (
              <a href={`https://wa.me/${aventura.whatsapp}?text=${encodeURIComponent(whatsappMsg)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#25D366', color: 'white', padding: '16px', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '24px', boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)' }}>
                <Phone size={24} /> Contactar para Reservar
              </a>
            )}
          </div>

          {details && details.length > 0 && (
            <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '16px' }}>Detalles de la Excursión</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {details.map((d: string, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-main)' }}>
                    <Info size={18} color="var(--color-orange)" />
                    <span>{d}</span>
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
                    <Image src={img} alt={`${aventura.name} foto ${idx + 2}`} fill style={{ objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {aventura.latitude !== null && aventura.longitude !== null && (
            <EntityMap 
              latitude={aventura.latitude} 
              longitude={aventura.longitude} 
              title={aventura.name} 
            />
          )}

        </div>

        <ReviewSection
          entityId={aventura.id}
          entityType="adventure"
          initialReviews={aventura.reviews}
        />
      </div>
    </div>
    </>
  );
}
