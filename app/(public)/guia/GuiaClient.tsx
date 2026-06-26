'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PublicityBanner from '@/components/PublicityBanner';
import { Loader2, MapPin, Phone } from 'lucide-react';
import FavoriteButton from '@/components/FavoriteButton';
import OpeningStatusBadge from '@/components/OpeningStatusBadge';

export default function GuiaClient({ initialServices }: { initialServices?: any[] }) {
  const router = useRouter();
  const [services, setServices] = useState<any[]>(initialServices || []);
  const [loading, setLoading] = useState(!initialServices);

  const getCategoryUrl = (item: any) => {
    if (item.subscription) {
      if (item.subscription.businessId) return `/comer?open=${item.subscription.businessId}`;
      if (item.subscription.accommodationId) return `/alojarse?open=${item.subscription.accommodationId}`;
      if (item.subscription.adventureId) return `/aventuras?open=${item.subscription.adventureId}`;
      if (item.subscription.commerceId) return `/comercios?open=${item.subscription.commerceId}`;
    }
    if (item.targetUrl) {
      if (item.targetUrl.startsWith('/comer/')) return `/comer?open=${item.targetUrl.split('/').pop()}`;
      if (item.targetUrl.startsWith('/alojarse/')) return `/alojarse?open=${item.targetUrl.split('/').pop()}`;
      if (item.targetUrl.startsWith('/aventuras/')) return `/aventuras?open=${item.targetUrl.split('/').pop()}`;
      if (item.targetUrl.startsWith('/comercios/')) return `/comercios?open=${item.targetUrl.split('/').pop()}`;
    }
    return item.targetUrl || `/guia/${item.id}`;
  };

  const fetchData = async () => {
    try {
      const res = await fetch('/api/local-services');
      const data = await res.json();
      setServices(data);
    } catch (e) {
      console.error('Error fetching services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialServices || initialServices.length === 0) {
      fetchData();
    }
  }, [initialServices]);
  const getPriority = (service: any) => {
    const sub = service.subscription;
    if (!sub || !sub.planType || sub.planType.length === 0) return 5;
    
    if (sub.hasBannerPortada) return 1;
    if (sub.hasBannerTop || sub.hasBannerMiddle || sub.hasBannerBottom) return 2;
    if (sub.planType.includes('comercio_completo')) return 3;
    if (sub.planType.includes('plan_basico_destacado')) return 4;
    return 4;
  };

  const sortServices = (a: any, b: any) => {
    const priorityA = getPriority(a);
    const priorityB = getPriority(b);
    if (priorityA !== priorityB) return priorityA - priorityB;
    return a.name.localeCompare(b.name);
  };

  const paidServices = services.filter(s => getPriority(s) < 5).sort(sortServices);
  const freeServices = services.filter(s => getPriority(s) === 5);

  const groupedFree = freeServices.reduce((acc: any, service: any) => {
    const cat = service.category || 'Otros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(service);
    return acc;
  }, {});

  const freeCategories = Object.keys(groupedFree).sort();
  const allCategories = Array.from(new Set(services.map(s => s.category || 'Otros'))).sort();

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
        <Loader2 className="animate-spin" size={48} color="var(--color-purple)" />
        <p style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Cargando Guía Local...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      
      {/* Banner Principal de la Guía Local */}
      <div style={{ position: 'relative', height: '240px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '40px', backgroundImage: 'url(/images/guia_local_banner.png)', backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '24px' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%)', zIndex: 1 }}></div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ color: 'var(--color-green)', fontWeight: 800, fontSize: '1.4rem' }}>Aluminé</span>
            <span style={{ color: 'var(--color-orange)', fontWeight: 800, fontSize: '1.4rem' }}>GO</span>
            <span style={{ color: 'white', margin: '0 4px' }}>|</span>
            <span style={{ color: 'white', fontWeight: 600, fontSize: '1.2rem', letterSpacing: '1px' }}>GUÁA LOCAL</span>
          </div>
          <p style={{ color: 'white', fontSize: '1rem', opacity: 0.9 }}>
            Servicios PÁºblicos, Instituciones, Emergencias y Comercios de Aluminé
          </p>
        </div>
      </div>

      {/* Botones de Anclaje Rápido */}
      <div className="marquee-container" style={{ marginBottom: '40px' }}>
        <div className="marquee-track">
          {[...allCategories, ...allCategories, ...allCategories].map((cat, idx) => (
            <a
              key={`${cat}-${idx}`}
              href={`#${cat.replace(/ /g, '-').toLowerCase()}`}
              className="category-anchor"
            >
              {cat}
            </a>
          ))}
        </div>
      </div>

      {/* BANNER SUPERIOR DE LA GUÁA */}
      <div style={{ marginBottom: '30px' }}>
        <PublicityBanner page="GuiaLocal" section={1} height="150px" delay="0s" />
      </div>

      {/* RENDERIZADO DE SERVICIOS CON PLAN (PAGOS - ORDENADOS POR PRIORIDAD) */}
      {paidServices.length > 0 && (
        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-main)', borderLeft: '5px solid var(--color-green)', paddingLeft: '12px', marginBottom: '20px' }}>
            Servicios y Comercios Destacados
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {paidServices.map((item: any) => {
              const priority = getPriority(item);
              const isPremium = priority <= 3;
              const isBasicoDestacado = priority === 4;
              const whatsappMsg = `Hola, me contacto desde AluminéGO. Quisiera hacerles una consulta...`;
              const targetUrl = isPremium ? getCategoryUrl(item) : (item.targetUrl || `/guia/${item.id}`);
              
              if (isPremium) {
                return (
                  <div 
                    key={item.id} 
                    onClick={() => { router.push(targetUrl); }}
                    style={{ backgroundColor: 'white', borderRadius: 'var(--radius-md)', padding: '20px', boxShadow: 'var(--shadow-md)', border: '2px solid var(--color-orange)', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer', transition: 'transform 0.2s', ...({ ':hover': { transform: 'translateY(-4px)' } } as any) }}
                  >
                    {/* Fila superior con miniatura */}
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ position: 'relative', width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f1f5f9' }}>
                        {item.image ? (
                          <img src={item.image.split(',')[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.7rem' }}>Sin foto</div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text-main)', margin: 0 }}>{item.name}</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-main)', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, width: 'fit-content' }}>
                          {item.category}{item.subcategory ? ` - ${item.subcategory}` : ''}
                        </span>
                      </div>
                    </div>

                    <OpeningStatusBadge openingHours={item.openingHours} />
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                      {item.address && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                          <MapPin size={14} color="#64748b" />
                          <span>{item.address}</span>
                        </div>
                      )}
                      
                      <Link 
                        href={targetUrl}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#25D366', color: 'white', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', marginTop: '4px', boxShadow: '0 2px 4px rgba(37,211,102,0.2)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          fetch('/api/track-event', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ entityId: item.id, type: 'WHATSAPP_CLICK' })
                          });
                        }}
                      >
                        <Phone size={16} />
                        Contactar Comercio
                      </Link>

                      <Link 
                        href={targetUrl}
                        style={{ fontSize: '0.85rem', color: 'var(--color-orange)', fontWeight: 700, textDecoration: 'underline', textAlign: 'center', marginTop: '4px' }}
                      >
                        Ver perfil y mapa
                      </Link>
                    </div>
                  </div>
                );
              }

              // Renderizado Básico / Destacado
              return (
                <div key={item.id} style={{ backgroundColor: 'white', borderRadius: 'var(--radius-md)', padding: '20px', boxShadow: 'var(--shadow-sm)', border: isBasicoDestacado ? '2px solid #000000' : '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
                  <FavoriteButton item={{
                    id: item.id,
                    title: item.name,
                    image: '',
                    type: item.category || 'Guía Local',
                    url: targetUrl
                  }} />
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', paddingRight: '30px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-main)', margin: 0 }}>
                        {item.name}
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-orange)', fontWeight: 600 }}>
                        {item.category}{item.subcategory ? ` - ${item.subcategory}` : ''}
                      </span>
                    </div>
                  </div>
                  <OpeningStatusBadge openingHours={item.openingHours} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                    {item.address && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        <MapPin size={14} color="#64748b" />
                        <span>{item.address}</span>
                      </div>
                    )}
                    {item.whatsapp && isBasicoDestacado && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-green)', fontSize: '0.9rem', fontWeight: 600 }}>
                        <Phone size={14} />
                        <a 
                          href={`https://wa.me/${item.whatsapp}?text=${encodeURIComponent(whatsappMsg)}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ color: 'inherit', textDecoration: 'none' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            fetch('/api/track-event', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ entityId: item.id, type: 'WHATSAPP_CLICK' })
                            });
                          }}
                        >
                          {item.whatsapp}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* BANNER INTERMEDIO DE LA GUÁA */}
      <div style={{ marginBottom: '40px' }}>
        <PublicityBanner page="GuiaLocal" section={2} height="120px" delay="1s" />
      </div>

      {/* SEPARADOR PARA SERVICIOS GRATUITOS */}
      {freeCategories.length > 0 && (
        <div style={{ marginTop: '40px', paddingTop: '40px', borderTop: '1px solid var(--color-border)' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.2rem', color: 'var(--color-text-muted)', marginBottom: '30px', fontWeight: 600 }}>
            Más Opciones en la Guía Local
          </h2>
        </div>
      )}

      {/* RENDERIZADO DE SERVICIOS SIN PLAN (GRATUITOS) */}
      {freeCategories.map((categoria) => {
        const items = groupedFree[categoria];
        
        return (
          <React.Fragment key={`free-${categoria}`}>
            <section id={categoria.replace(/ /g, '-').toLowerCase()} style={{ marginBottom: '50px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-muted)', borderLeft: '5px solid #94a3b8', paddingLeft: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.8 }}>
                <span>{categoria}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg)', padding: '2px 8px', borderRadius: '10px' }}>
                  {items.length}
                </span>
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', opacity: 0.9 }}>
                {[...items].sort(sortServices).map((item: any) => {
                  return (
                    <div key={item.id} style={{ backgroundColor: 'white', borderRadius: 'var(--radius-md)', padding: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-main)', margin: 0 }}>
                            {item.name}
                          </h3>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-orange)', fontWeight: 600 }}>
                            {item.category}{item.subcategory ? ` - ${item.subcategory}` : ''}
                          </span>
                        </div>
                      </div>
                      <OpeningStatusBadge openingHours={item.openingHours} />

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                        {item.address && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                            <MapPin size={14} color="#64748b" />
                            <span>{item.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </React.Fragment>
        );
      })}

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }

        .marquee-container {
          width: 100%;
          overflow: hidden;
          position: relative;
          padding-bottom: 16px;
        }
        .marquee-track {
          display: flex;
          gap: 12px;
          width: max-content;
          animation: marquee 30s linear infinite;
        }
        .marquee-container:hover .marquee-track {
          animation-play-state: paused;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-33.33333% - 4px)); }
        }

        .category-anchor {
          background-color: white;
          border: 2px solid var(--color-green);
          padding: 10px 20px;
          border-radius: 24px;
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--color-green);
          white-space: nowrap;
          text-decoration: none;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease-in-out;
          cursor: pointer;
        }
        .category-anchor:hover, .category-anchor:active, .category-anchor:focus {
          background-color: var(--color-green);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 6px 8px -1px rgba(34, 197, 94, 0.3);
        }
      `}</style>
    </div>
  );
}


