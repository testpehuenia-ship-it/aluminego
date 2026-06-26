'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import PublicityBanner from '@/components/PublicityBanner';
import Link from 'next/link';
import FavoriteButton from '@/components/FavoriteButton';
import OpeningStatusBadge from '@/components/OpeningStatusBadge';
import { Loader2, Search } from 'lucide-react';

export default function AventurasClient({ initialAdventures, initialCategories }: { initialAdventures?: any[], initialCategories?: any[] }) {
  const [selectedAventura, setSelectedAventura] = useState<any | null>(null);
  const [adventures, setAdventures] = useState<any[]>(initialAdventures || []);
  const [categories, setCategories] = useState<any[]>(initialCategories || []);
  const [loading, setLoading] = useState(!initialAdventures || !initialCategories);
  const [searchQuery, setSearchQuery] = useState('');

  const categoryStyles: { [key: string]: { color: string, bgImage: string } } = {
    "Trekking": { color: "#2a9d8f", bgImage: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80" },
    "A. Acuaticas": { color: "#00b4d8", bgImage: "/images/aventura_rafting.png" },
    "Aventuras Acuáticas": { color: "#00b4d8", bgImage: "/images/aventura_rafting.png" },
    "Cabalgatas": { color: "#f4a261", bgImage: "/images/aventura_cabalgatas.png" },
    "Nieve": { color: "#e9c46a", bgImage: "https://images.unsplash.com/photo-1605540436563-5bca919ae766?auto=format&fit=crop&w=800&q=80" },
    "Pesca": { color: "#e76f51", bgImage: "/images/aventura_pesca.png" },
    "Agencia de turismo": { color: "#264653", bgImage: "/images/aventura_agencia.png" },
    "Agencias de Turismo": { color: "#264653", bgImage: "/images/aventura_agencia.png" }
  };

  const fetchData = async () => {
    try {
      const [advRes, catRes] = await Promise.all([
        fetch('/api/adventures'),
        fetch('/api/categories')
      ]);
      const advData = await advRes.json();
      const catData = await catRes.json();
      setAdventures(advData);
      setCategories(catData);
    } catch (e) {
      console.error('Error fetching adventures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialAdventures || initialAdventures.length === 0 || !initialCategories || initialCategories.length === 0) {
      fetchData();
    }
  }, [initialAdventures, initialCategories]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const openId = params.get('open');
      if (openId && adventures.length > 0) {
        const found = adventures.find(a => a.id === openId);
        if (found) {
          setSelectedAventura(found);
        }
      }
    }
  }, [adventures]);

  const hasPlan = (service: any) => {
    return service.subscription && service.subscription.planType && service.subscription.planType.length > 0;
  };

  const hasBanner = (item: any) => {
    return item.subscription && (
      item.subscription.hasBannerPortada ||
      item.subscription.hasBannerTop ||
      item.subscription.hasBannerMiddle ||
      item.subscription.hasBannerBottom
    );
  };

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

  const displayableCats = useMemo(() => {
    return categories.filter(cat => cat.link?.startsWith('/aventuras'));
  }, [categories]);

  const filteredAdventures = useMemo(() => {
    if (!searchQuery.trim()) return adventures;
    const q = searchQuery.toLowerCase().trim();
    return adventures.filter(a => 
      a.name.toLowerCase().includes(q) ||
      (a.description && a.description.toLowerCase().includes(q)) ||
      a.category.toLowerCase().includes(q) ||
      (a.details && a.details.toLowerCase().includes(q))
    );
  }, [adventures, searchQuery]);

  const activePremiumAdventures = useMemo(() => {
    return filteredAdventures.filter(a => getPriority(a) <= 3);
  }, [filteredAdventures]);

  const bannerAdventures = useMemo(() => {
    return activePremiumAdventures.filter(hasBanner).sort(sortServices);
  }, [activePremiumAdventures]);

  const nonBannerAdventures = useMemo(() => {
    return activePremiumAdventures.filter(a => !hasBanner(a));
  }, [activePremiumAdventures]);

  const unmatchedAdventures = useMemo(() => {
    return nonBannerAdventures.filter(a => 
      !displayableCats.some(cat => cat.title.toLowerCase().trim() === a.category.toLowerCase().trim())
    );
  }, [nonBannerAdventures, displayableCats]);

  const buildWhatsAppUrl = (aventura: any) => {
    const message = `*Hola ${aventura.name}!* \nTe contacto desde AluminéGO.\nQuisiera consultar tarifas y disponibilidad para esta actividad.\n\n¡Muchas gracias!`;
    return `https://wa.me/${aventura.whatsapp}?text=${encodeURIComponent(message)}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
        <Loader2 className="animate-spin" size={48} color="var(--color-orange)" />
        <p style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Cargando aventuras...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      
      {/* Banner Principal Responsivo */}
      <div className="responsive-banner">
        <div className="banner-header">
          <div className="banner-title">
            <span style={{ color: 'var(--color-green)' }}>Aluminé</span>
            <span style={{ color: 'var(--color-orange)' }}>GO</span>
            <span style={{ color: 'white', margin: '0 8px' }}>-</span>
            <span style={{ color: 'white' }}>AVENTURAS</span>
          </div>
          <div className="banner-subtitle">DESCUBRE LA NATURALEZA</div>
        </div>
        <div className="banner-categories" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gridAutoRows: '150px' }}>
          {displayableCats.slice(0, 6).map((item) => {
            const style = categoryStyles[item.title] || { color: '#0d9488', bgImage: item.image || "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80" };
            return (
              <a 
                href={`#${item.title.replace(/ /g, '-').toLowerCase()}`} 
                key={item.id} 
                className="banner-item" 
                style={{ backgroundImage: `url(${style.bgImage})` }}
              >
                <div className="banner-overlay" style={{ borderBottom: `4px solid ${style.color}` }}></div>
                <span className="banner-text" style={{ fontSize: item.title.length > 15 ? "0.85rem" : "inherit" }}>
                  {item.title.toUpperCase()}
                </span>
              </a>
            );
          })}
        </div>
      </div>
      
      <PublicityBanner page="Aventuras" section={1} height="100px" />

      {/* Buscador */}
      <div style={{
        position: 'relative',
        maxWidth: '500px',
        margin: '20px auto 40px auto',
        display: 'flex',
        alignItems: 'center',
        background: 'white',
        borderRadius: '50px',
        border: '1.5px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        padding: '2px 8px 2px 20px',
        transition: 'all 0.3s ease',
      }}
      className="search-bar-container"
      >
        <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', marginRight: '10px' }}>
          <Search size={20} />
        </span>
        <input 
          type="text" 
          placeholder="Buscar trekking, kayak, cabalgatas..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            border: 'none',
            outline: 'none',
            fontSize: '1rem',
            padding: '12px 0',
            color: 'var(--color-text-main)',
            background: 'transparent'
          }}
        />
        {searchQuery && (
          <button 
            type="button"
            onClick={() => setSearchQuery('')}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
              marginRight: '8px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              transition: 'background-color 0.2s'
            }}
          >
            ✖
          </button>
        )}
      </div>

      <h1 className="section-title">¿Qué aventura elegimos hoy?</h1>

      {/* SECCIÁ“N DE DESTACADOS (CON BANNER) */}
      {bannerAdventures.length > 0 && (
        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ fontSize: '1.5rem', borderLeft: '5px solid var(--color-orange)', paddingLeft: '12px', marginBottom: '24px', color: 'var(--color-text-main)' }}>
            Sponsors y Destacados
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {bannerAdventures.map(aventura => {
              return (
                <button 
                  key={aventura.id} 
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'var(--transition)',
                    cursor: 'pointer',
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    border: '2px solid var(--color-orange)'
                  }}
                  onClick={() => setSelectedAventura(aventura)}
                  className="commerce-card"
                >
                  <div style={{ position: 'relative', height: '200px' }}>
                    <FavoriteButton item={{
                      id: aventura.id,
                      title: aventura.name,
                      image: aventura.image || '',
                      type: 'Aventura',
                      url: `/aventuras/${aventura.id}`
                    }} />
                    {aventura.image ? (
                      <Image src={aventura.image} alt={aventura.name} fill style={{ objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#e2e8f0' }} />
                    )}
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: 'var(--color-text-main)' }}>{aventura.name}</h3>
                    <OpeningStatusBadge openingHours={aventura.openingHours} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px', marginTop: '6px' }}>
                      {aventura.details?.split(',').map((detail: string) => (
                        <span key={detail} style={{
                          fontSize: '0.75rem',
                          backgroundColor: 'var(--color-bg)',
                          color: 'var(--color-text-muted)',
                          padding: '4px 8px',
                          borderRadius: '4px'
                        }}>
                          {detail.trim()}
                        </span>
                      ))}
                    </div>
                    <p style={{ color: 'var(--color-orange)', fontSize: '0.95rem', fontWeight: 600 }}>Ver detalles y reservar</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {displayableCats.map((category, index) => {
        const filtered = nonBannerAdventures.filter(a => a.category.toLowerCase().trim() === category.title.toLowerCase().trim());
        if (filtered.length === 0) return null;
        
        return (
          <React.Fragment key={`paid-${category.id}`}>
            <section id={category.title.replace(/ /g, '-').toLowerCase()} style={{ marginBottom: '60px' }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                borderLeft: '5px solid var(--color-orange)', 
                paddingLeft: '12px',
                marginBottom: '24px',
                color: 'var(--color-text-main)'
              }}>
                {category.title}
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '24px'
              }}>
                {filtered.sort(sortServices).map(aventura => {
                  const isDestacado = aventura.subscription?.planType?.includes('plan_basico_destacado') || aventura.subscription?.planType?.includes('plan_comercio_completo');
                  return (
                  <button key={aventura.id} style={{
                    backgroundColor: 'white',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'var(--transition)',
                    cursor: 'pointer',
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    border: isDestacado ? '2px solid var(--color-orange)' : '1px solid var(--color-border)'
                  }}
                  onClick={() => setSelectedAventura(aventura)}
                  className="commerce-card"
                  >
                    <div style={{ position: 'relative', height: '200px' }}>
                      <FavoriteButton item={{
                        id: aventura.id,
                        title: aventura.name,
                        image: aventura.image || '',
                        type: 'Aventura',
                        url: `/aventuras/${aventura.id}`
                      }} />
                      {aventura.image ? (
                        <Image src={aventura.image} alt={aventura.name} fill style={{ objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: '#e2e8f0' }} />
                      )}
                    </div>
                    <div style={{ padding: '16px' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: 'var(--color-text-main)' }}>{aventura.name}</h3>
                      <OpeningStatusBadge openingHours={aventura.openingHours} />
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px', marginTop: '6px' }}>
                        {aventura.details?.split(',').map((detail: string) => (
                          <span key={detail} style={{
                            fontSize: '0.75rem',
                            backgroundColor: 'var(--color-bg)',
                            color: 'var(--color-text-muted)',
                            padding: '4px 8px',
                            borderRadius: '4px'
                          }}>
                            {detail.trim()}
                          </span>
                        ))}
                      </div>
                      <p style={{ color: 'var(--color-orange)', fontSize: '0.95rem', fontWeight: 600 }}>Ver detalles y reservar</p>
                    </div>
                  </button>
                  );
                })}
              </div>
            </section>
            {index === Math.floor(displayableCats.length / 2) && (
              <PublicityBanner page="Aventuras" section={2} delay="2s" />
            )}
          </React.Fragment>
        );
      })}

      {unmatchedAdventures.length > 0 && (
        <section id="otros" style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '1.5rem', borderLeft: '5px solid var(--color-orange)', paddingLeft: '12px', marginBottom: '24px', color: 'var(--color-text-main)' }}>
            Otras Actividades y Aventuras
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {unmatchedAdventures.sort(sortServices).map(aventura => {
              const isDestacado = aventura.subscription?.planType?.includes('plan_basico_destacado') || aventura.subscription?.planType?.includes('plan_comercio_completo');
              return (
                <button key={aventura.id} style={{
                  backgroundColor: 'white',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'var(--transition)',
                  cursor: 'pointer',
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  border: isDestacado ? '2px solid var(--color-orange)' : '1px solid var(--color-border)'
                }}
                onClick={() => setSelectedAventura(aventura)}
                className="commerce-card"
                >
                  <div style={{ position: 'relative', height: '200px' }}>
                    <FavoriteButton item={{
                      id: aventura.id,
                      title: aventura.name,
                      image: aventura.image || '',
                      type: 'Aventura',
                      url: `/aventuras/${aventura.id}`
                    }} />
                    {aventura.image ? (
                      <Image src={aventura.image} alt={aventura.name} fill style={{ objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#e2e8f0' }} />
                    )}
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: 'var(--color-text-main)' }}>{aventura.name}</h3>
                    <OpeningStatusBadge openingHours={aventura.openingHours} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px', marginTop: '6px' }}>
                      {aventura.details?.split(',').map((detail: string) => (
                        <span key={detail} style={{
                          fontSize: '0.75rem',
                          backgroundColor: 'var(--color-bg)',
                          color: 'var(--color-text-muted)',
                          padding: '4px 8px',
                          borderRadius: '4px'
                        }}>
                          {detail.trim()}
                        </span>
                      ))}
                    </div>
                    <p style={{ color: 'var(--color-orange)', fontSize: '0.95rem', fontWeight: 600 }}>Ver detalles y reservar</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <PublicityBanner page="Aventuras" section={3} delay="4s" />

      {/* Modal de Detalles de la Aventura */}
      {selectedAventura && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}
        onClick={() => setSelectedAventura(null)}
        >
          <div style={{
            backgroundColor: 'white',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            borderRadius: '24px',
            padding: '0',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}
          onClick={e => e.stopPropagation()}
          >
            <div style={{ position: 'relative', height: '250px' }}>
              {selectedAventura.image ? (
                <Image src={selectedAventura.image} alt={selectedAventura.name} fill style={{ objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: '#e2e8f0' }} />
              )}
              <button 
                onClick={() => setSelectedAventura(null)}
                style={{ position: 'absolute', top: '16px', right: '16px', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.8)', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
              >
                ✖
              </button>
            </div>
            
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>{selectedAventura.name}</h2>
              <p style={{ color: 'var(--color-orange)', fontWeight: 600, marginBottom: '8px', fontSize: '1.1rem' }}>{selectedAventura.category}</p>
              <OpeningStatusBadge openingHours={selectedAventura.openingHours} showWeeklySchedule={true} />
              
              {selectedAventura.description && (
                <p style={{ color: 'var(--color-text-main)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '24px', marginTop: '12px', whiteSpace: 'pre-line' }}>
                  {selectedAventura.description}
                </p>
              )}

              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px' }}>Detalles de la Actividad</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                {selectedAventura.details?.split(',').map((detail: string) => (
                  <div key={detail} style={{
                    backgroundColor: 'var(--color-bg)',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    <span style={{ color: 'var(--color-green)', marginRight: '8px', fontSize: '1.2rem' }}>â€¢</span>
                    {detail.trim()}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '24px', borderTop: '1px solid var(--color-border)', backgroundColor: '#f8fafc' }}>
              <a 
                href={buildWhatsAppUrl(selectedAventura)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ width: '100%', padding: '16px', fontSize: '1.1rem', textDecoration: 'none', textAlign: 'center', display: 'block', borderRadius: '16px', marginBottom: '16px' }}
                onClick={() => {
                  fetch('/api/track-event', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ entityId: selectedAventura.id, type: 'WHATSAPP_CLICK' })
                  });
                }}
              >
                📱 Consultar y Reservar
              </a>
              <div style={{ textAlign: 'center' }}>
                <Link href={`/aventuras/${selectedAventura.id}`} style={{ color: 'var(--color-orange)', fontWeight: 'bold', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                  Ver ficha completa / Compartir
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        .search-bar-container:focus-within {
          border-color: var(--color-orange) !important;
          box-shadow: 0 0 0 3px rgba(244, 162, 97, 0.2) !important;
        }
      `}</style>
    </div>
  );
}


