import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Phone, ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';
import ReviewSection from '@/components/ReviewSection';
import EntityMap from '@/components/EntityMap';
import OpeningStatusBadge from '@/components/OpeningStatusBadge';
import VerifiedBadge from '@/components/VerifiedBadge';


interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const servicio = await prisma.localService.findUnique({
    where: { id }
  });

  if (!servicio) {
    return { title: 'Comercio no encontrado | AluminéGO' };
  }

  return {
    title: `${servicio.name} en Aluminé | ${servicio.category}`,
    description: `Contacta a ${servicio.name} en Aluminé. Categoría: ${servicio.category} ${servicio.subcategory ? '- ' + servicio.subcategory : ''}.`,
    alternates: {
      canonical: `https://www.aluminego.ar/guia/${servicio.id}`,
    },
    openGraph: {
      title: `${servicio.name} | AluminéGO`,
      description: `Comercio/Servicio en Aluminé: ${servicio.name}.`,
      images: servicio.image ? [servicio.image.split(',')[0]] : [],
    }
  };
}

export default async function GuiaDetallePage({ params }: PageProps) {
  const { id } = await params;
  const servicio = await prisma.localService.findUnique({
    where: { id },
    include: {
      subscription: true,
      reviews: {
        where: { approved: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!servicio) {
    notFound();
  }

  const whatsappMsg = `Hola ${servicio.name}, me contacto desde AluminéGO para hacerles una consulta...`;
  const graceDate = new Date();
  graceDate.setDate(graceDate.getDate() - 7);
  const hasActiveSub = !!servicio.subscription && new Date(servicio.subscription.dueDate) >= graceDate;

  const images = servicio.image ? servicio.image.split(',').filter(Boolean) : [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': servicio.name,
    'description': servicio.description || `Información y contacto de ${servicio.name} en Aluminé.`,
    'image': images,
    'telephone': servicio.whatsapp && hasActiveSub ? `+549${servicio.whatsapp}` : undefined,
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': 'Aluminé',
      'addressRegion': 'Neuquén',
      'addressCountry': 'AR',
      'streetAddress': servicio.address || undefined
    },
    'geo': (servicio.latitude !== null && servicio.longitude !== null) ? {
      '@type': 'GeoCoordinates',
      'latitude': servicio.latitude,
      'longitude': servicio.longitude
    } : undefined,
    'url': `https://www.aluminego.ar/guia/${servicio.id}`
  };
  let details = [];
  try {
    details = JSON.parse(servicio.details || '[]');
  } catch(e) {
    if (servicio.details) {
      details = servicio.details.split(',').map((d: string) => d.trim());
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', paddingBottom: '80px' }}>
      <div style={{ position: 'relative', height: '30vh', width: '100%', minHeight: '250px' }}>
        {images.length > 0 ? (
          <Image src={images[0]} alt={servicio.name} fill style={{ objectFit: 'cover' }} priority />
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: '#cbd5e1' }} />
        )}
        <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
          <Link href="/guia" style={{ backgroundColor: 'rgba(255,255,255,0.9)', padding: '8px 16px', borderRadius: '20px', textDecoration: 'none', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', boxShadow: 'var(--shadow-md)' }}>
            <ArrowLeft size={18} /> Volver a Guía Local
          </Link>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '40px 20px 20px' }}>
          <span style={{ backgroundColor: 'var(--color-green)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', display: 'inline-block' }}>
            {servicio.category} {servicio.subcategory ? `> ${servicio.subcategory}` : ''}
          </span>
          <h1 style={{ color: 'white', fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>{servicio.name}</h1>
        </div>
      </div>

      <div className="container" style={{ marginTop: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            {servicio.description && (
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '12px' }}>Información</h2>
                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{servicio.description}</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {servicio.address && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>
                  <MapPin color="var(--color-orange)" /> <span>{servicio.address}</span>
                </div>
              )}
              {servicio.whatsapp && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>
                  <Phone color="#25D366" /> <span>{servicio.whatsapp}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>
                <OpeningStatusBadge openingHours={servicio.openingHours} showWeeklySchedule={true} isVisible={servicio.showSchedule} />
              </div>

              {servicio.hasDelivery ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '10px', backgroundColor: '#ecfdf5', border: '1.5px solid #a7f3d0', color: '#065f46', fontWeight: 600, fontSize: '0.95rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>🛵</span>
                  <span>Cuenta con servicio de <strong>Delivery</strong></span>
                </div>
              ) : (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '10px', backgroundColor: '#fef2f2', border: '1.5px solid #fecaca', color: '#991b1b', fontWeight: 600, fontSize: '0.95rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>🚫</span>
                  <span>No cuenta con Delivery (Solo consumo en el local / Retiro)</span>
                </div>
              )}
            </div>
            
            {servicio.whatsapp && (
              <a href={`https://wa.me/${servicio.whatsapp}?text=${encodeURIComponent(whatsappMsg)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#25D366', color: 'white', padding: '16px', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '24px', boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)' }}>
                <Phone size={24} /> Contactar por WhatsApp
              </a>
            )}
          </div>

          {details && details.length > 0 && (
            <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-main)', margin: 0 }}>
                  🛍️ Artículos y Productos Destacados
                </h2>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>📱 Pide la carta completa por WhatsApp</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {details.map((d: any, i: number) => {
                  const isObj = typeof d === 'object' && d !== null;
                  const prodName = isObj ? d.name : d;
                  const prodDesc = isObj ? d.description : '';
                  const prodPrice = isObj && d.price && !isNaN(parseFloat(String(d.price))) ? parseFloat(String(d.price)) : null;
                  const prodImg = isObj ? d.image : null;

                  if (!prodName) return null;

                  return (
                    <div 
                      key={i} 
                      style={{ 
                        display: 'flex', 
                        gap: '14px', 
                        alignItems: 'center', 
                        color: 'var(--color-text-main)', 
                        background: '#f8fafc', 
                        padding: '14px', 
                        borderRadius: '16px', 
                        border: '1px solid #e2e8f0',
                        transition: 'transform 0.2s',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                      }}
                    >
                      {prodImg ? (
                        <div style={{ width: '70px', height: '70px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                          <img src={prodImg} alt={prodName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', fontSize: '1.4rem', flexShrink: 0 }}>
                          🛍️
                        </div>
                      )}
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ margin: '0 0 2px 0', fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                          {prodName}
                        </h4>
                        {prodDesc && (
                          <p style={{ margin: '0 0 4px 0', fontSize: '0.82rem', color: '#64748b', lineHeight: '1.3' }}>
                            {prodDesc}
                          </p>
                        )}
                        {prodPrice !== null && (
                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-green)' }}>
                            ${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(prodPrice)}
                          </div>
                        )}
                      </div>

                      {servicio.whatsapp && (
                        <a 
                          href={`https://wa.me/${servicio.whatsapp}?text=${encodeURIComponent(`Hola ${servicio.name}, me interesa el producto "${prodName}" que vi en AluminéGO.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Consultar por este producto"
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#25D366',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textDecoration: 'none',
                            fontSize: '1rem',
                            flexShrink: 0,
                            boxShadow: '0 2px 6px rgba(37, 211, 102, 0.3)'
                          }}
                        >
                          <Phone size={16} />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {images.length > 1 && (
            <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '16px' }}>Galería</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                {images.slice(1).map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', height: '150px', borderRadius: '12px', overflow: 'hidden' }}>
                    <Image src={img} alt={`${servicio.name} foto ${idx + 2}`} fill style={{ objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {servicio.latitude !== null && servicio.longitude !== null && (
            <EntityMap 
              latitude={servicio.latitude} 
              longitude={servicio.longitude} 
              title={servicio.name} 
            />
          )}

        </div>

        <ReviewSection
          entityId={servicio.id}
          entityType="localservice"
          initialReviews={servicio.reviews}
        />
      </div>
    </div>
    </>
  );
}
