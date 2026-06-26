'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import PublicityBanner from '@/components/PublicityBanner';
import Link from 'next/link';
import { Loader2, Search } from 'lucide-react';
import FavoriteButton from '@/components/FavoriteButton';
import OpeningStatusBadge from '@/components/OpeningStatusBadge';

export default function AlojarseClient({ initialAccommodations, initialCategories }: { initialAccommodations?: any[], initialCategories?: any[] }) {
  const [selectedAlojamiento, setSelectedAlojamiento] = useState<any | null>(null);
  const [accommodations, setAccommodations] = useState<any[]>(initialAccommodations || []);
  const [categories, setCategories] = useState<any[]>(initialCategories || []);
  const [loading, setLoading] = useState(!initialAccommodations || !initialCategories);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedAlojamiento]);

  const categoryStyles: { [key: string]: { color: string, bgImage: string } } = {
    "Cabañas": { color: "#e63946", bgImage: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80" },
    "Hoteles": { color: "#f4a261", bgImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80" },
    "Hostel": { color: "#e9c46a", bgImage: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80" },
    "Campings": { color: "#2a9d8f", bgImage: "https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?auto=format&fit=crop&w=800&q=80" }
  };

  const closeModal = () => {
    setSelectedAlojamiento(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('open');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  };

  const buildWhatsAppUrl = (alojamiento: any) => {
    const message = `*Hola ${alojamiento.name}!* \nTe contacto desde AluminéGO.\nQuisiera consultar disponibilidad y tarifas para alojarme con ustedes.\n\n¡Muchas gracias!`;
    return `https://wa.me/${alojamiento.whatsapp}?text=${encodeURIComponent(message)}`;
  };

  const fetchData = async () => {
    try {
      const [accRes, catRes] = await Promise.all([
        fetch('/api/accommodations'),
        fetch('/api/categories')
      ]);
      const accData = await accRes.json();
      const catData = await catRes.json();
      setAccommodations(accData);
      setCategories(catData);
    } catch (e) {
      console.error('Error fetching accommodations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialAccommodations || initialAccommodations.length === 0 || !initialCategories || initialCategories.length === 0) {
      fetchData();
    }
  }, [initialAccommodations, initialCategories]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const openId = params.get('open');
      if (openId && accommodations.length > 0) {
        const found = accommodations.find(a => a.id === openId);
        if (found) {
          setSelectedAlojamiento(found);
        }
      }
    }
  }, [accommodations]);

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
    return categories.filter(cat => cat.link?.startsWith('/alojarse'));
  }, [categories]);

  const filteredAccommodations = useMemo(() => {
    if (!searchQuery.trim()) return accommodations;
    const q = searchQuery.toLowerCase().trim();
    return accommodations.filter(a => 
      a.name.toLowerCase().includes(q) ||
      (a.description && a.description.toLowerCase().includes(q)) ||
      a.type.toLowerCase().includes(q) ||
      (a.features && a.features.some((f: any) => f.name.toLowerCase().includes(q)))
    );
  }, [accommodations, searchQuery]);

  const activePremiumAccommodations = useMemo(() => {
    return filteredAccommodations.filter(a => getPriority(a) <= 3);
  }, [filteredAccommodations]);

  const bannerAccommodations = useMemo(() => {
    return activePremiumAccommodations.filter(hasBanner).sort(sortServices);
  }, [activePremiumAccommodations]);

  const nonBannerAccommodations = useMemo(() => {
    return activePremiumAccommodations.filter(a => !hasBanner(a));
  }, [activePremiumAccommodations]);

  const unmatchedAccs = useMemo(() => {
    return nonBannerAccommodations.filter(a => 
      !displayableCats.some(cat => cat.title.toLowerCase().trim() === a.type.toLowerCase().trim())
    );
  }, [nonBannerAccommodations, displayableCats]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
        <Loader2 className="animate-spin" size={48} color="var(--color-green)" />
        <p style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Buscando las mejores cabañas...</p>
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
            <span style={{ color: 'white' }}>DORMIR</span>
          </div>
          <div className="banner-subtitle">ENCUENTRA TU DESCANSO IDEAL</div>
        </div>
        <div className="banner-categories" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gridAutoRows: '150px' }}>
          {displayableCats.slice(0, 6).map((item) => {
            const style = categoryStyles[item.title] || { color: '#0d9488', bgImage: item.image };
            return (
              <a 
                href={`#${item.title.toLowerCase()}`} 
                key={item.id} 
                className="banner-item" 
                style={{ backgroundImage: `url(${style.bgImage})` }}
              >
                <div className="banner-overlay" style={{ borderBottom: `4px solid ${style.color}` }}></div>
                <span className="banner-text">{item.title.toUpperCase()}</span>
              </a>
            );
          })}
        </div>
      </div>
      
      <div style={{ marginBottom: '40px' }}>
        <PublicityBanner page="Dormir" section={1} height="150px" delay="0s" />
      </div>

      {/* Buscador */}
      <div style={{
        position: 'relative',
        maxWidth: '500px',
        margin: '0 auto 40px auto',
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
          placeholder="Buscar cabañas, hoteles, servicios..." 
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

      <h1 className="section-title">Â¿Dónde vas a dormir?</h1>

      {/* SECCIÁ“N DE DESTACADOS (CON BANNER) */}
      {bannerAccommodations.length > 0 && (
        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ fontSize: '1.5rem', borderLeft: '5px solid var(--color-orange)', paddingLeft: '12px', marginBottom: '24px', color: 'var(--color-text-main)' }}>
            Sponsors y Destacados
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {bannerAccommodations.map(alojamiento => {
              return (
                <button 
                  key={alojamiento.id} 
                  style={{ backgroundColor: 'white', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)', cursor: 'pointer', display: 'block', width: '100%', textAlign: 'left', border: '2px solid var(--color-orange)' }}
                  onClick={() => setSelectedAlojamiento(alojamiento)}
                  className="commerce-card"
                >
                  <div style={{ position: 'relative', height: '200px' }}>
                    <FavoriteButton item={{
                      id: alojamiento.id,
                      title: alojamiento.name,
                      image: alojamiento.image ? alojamiento.image.split(',')[0] : '',
                      type: 'Alojamiento',
                      url: `/alojarse/${alojamiento.id}`
                    }} />
                    {alojamiento.image ? (
                      <Image src={alojamiento.image.split(',')[0]} alt={alojamiento.name} fill style={{ objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#e2e8f0' }} />
                    )}
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: 'var(--color-text-main)' }}>{alojamiento.name}</h3>
                    <OpeningStatusBadge openingHours={alojamiento.openingHours} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px', marginTop: '6px' }}>
                      {alojamiento.features?.slice(0, 3).map((f: any) => (
                        <span key={f.id} style={{ fontSize: '0.75rem', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)', padding: '4px 8px', borderRadius: '4px' }}>
                          {f.name}
                        </span>
                      ))}
                      {alojamiento.features?.length > 3 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', padding: '4px 8px' }}>
                          +{alojamiento.features.length - 3}
                        </span>
                      )}
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
        const catAccs = nonBannerAccommodations.filter(a => a.type.toLowerCase().trim() === category.title.toLowerCase().trim());
        if (catAccs.length === 0) return null;

        return (
          <React.Fragment key={`paid-${category.id}`}>
            <section id={category.title.toLowerCase()} style={{ marginBottom: '60px' }}>
              <h2 style={{ fontSize: '1.5rem', borderLeft: '5px solid var(--color-orange)', paddingLeft: '12px', marginBottom: '24px', color: 'var(--color-text-main)' }}>
                {category.title}
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {catAccs.sort(sortServices).map(alojamiento => {
                  const isDestacado = alojamiento.subscription?.planType?.includes('plan_basico_destacado') || alojamiento.subscription?.planType?.includes('plan_comercio_completo');
                  return (
                  <button key={alojamiento.id} style={{ backgroundColor: 'white', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)', cursor: 'pointer', display: 'block', width: '100%', textAlign: 'left', border: isDestacado ? '2px solid var(--color-orange)' : '1px solid var(--color-border)' }}
                  onClick={() => setSelectedAlojamiento(alojamiento)}
                  className="commerce-card"
                  >
                    <div style={{ position: 'relative', height: '200px' }}>
                      <FavoriteButton item={{
                        id: alojamiento.id,
                        title: alojamiento.name,
                        image: alojamiento.image ? alojamiento.image.split(',')[0] : '',
                        type: 'Alojamiento',
                        url: `/alojarse/${alojamiento.id}`
                      }} />
                      {alojamiento.image ? (
                        <Image src={alojamiento.image.split(',')[0]} alt={alojamiento.name} fill style={{ objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: '#e2e8f0' }} />
                      )}
                    </div>
                    <div style={{ padding: '16px' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: 'var(--color-text-main)' }}>{alojamiento.name}</h3>
                      <OpeningStatusBadge openingHours={alojamiento.openingHours} />
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px', marginTop: '6px' }}>
                        {alojamiento.features?.slice(0, 3).map((f: any) => (
                          <span key={f.id} style={{ fontSize: '0.75rem', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)', padding: '4px 8px', borderRadius: '4px' }}>
                            {f.name}
                          </span>
                        ))}
                        {alojamiento.features?.length > 3 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', padding: '4px 8px' }}>
                            +{alojamiento.features.length - 3}
                          </span>
                        )}
                      </div>
                      <p style={{ color: 'var(--color-orange)', fontSize: '0.95rem', fontWeight: 600 }}>Ver detalles y reservar</p>
                    </div>
                  </button>
                  );
                })}
              </div>
            </section>
            {index === Math.floor(displayableCats.length / 2) && <PublicityBanner page="Dormir" section={2} height="100px" delay="2s" />}
          </React.Fragment>
        );
      })}

      {unmatchedAccs.length > 0 && (
        <section id="otros" style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '1.5rem', borderLeft: '5px solid var(--color-orange)', paddingLeft: '12px', marginBottom: '24px', color: 'var(--color-text-main)' }}>
            Otros Alojamientos
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {unmatchedAccs.sort(sortServices).map(alojamiento => {
              const isDestacado = alojamiento.subscription?.planType?.includes('plan_basico_destacado') || alojamiento.subscription?.planType?.includes('plan_comercio_completo');
              return (
                <button key={alojamiento.id} style={{ backgroundColor: 'white', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)', cursor: 'pointer', display: 'block', width: '100%', textAlign: 'left', border: isDestacado ? '2px solid var(--color-orange)' : '1px solid var(--color-border)' }}
                onClick={() => setSelectedAlojamiento(alojamiento)}
                className="commerce-card"
                >
                  <div style={{ position: 'relative', height: '200px' }}>
                    <FavoriteButton item={{
                      id: alojamiento.id,
                      title: alojamiento.name,
                      image: alojamiento.image ? alojamiento.image.split(',')[0] : '',
                      type: 'Alojamiento',
                      url: `/alojarse/${alojamiento.id}`
                    }} />
                    {alojamiento.image ? (
                      <Image src={alojamiento.image.split(',')[0]} alt={alojamiento.name} fill style={{ objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#e2e8f0' }} />
                    )}
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: 'var(--color-text-main)' }}>{alojamiento.name}</h3>
                    <OpeningStatusBadge openingHours={alojamiento.openingHours} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px', marginTop: '6px' }}>
                      {alojamiento.features?.slice(0, 3).map((f: any) => (
                        <span key={f.id} style={{ fontSize: '0.75rem', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)', padding: '4px 8px', borderRadius: '4px' }}>
                          {f.name}
                        </span>
                      ))}
                      {alojamiento.features?.length > 3 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', padding: '4px 8px' }}>
                          +{alojamiento.features.length - 3}
                        </span>
                      )}
                    </div>
                    <p style={{ color: 'var(--color-orange)', fontSize: '0.95rem', fontWeight: 600 }}>Ver detalles y reservar</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <div style={{ marginTop: '20px' }}>
        <PublicityBanner page="Dormir" section={3} height="150px" delay="4s" />
      </div>

      {selectedAlojamiento && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', zIndex: 1000, padding: '20px' }}
        onClick={closeModal}
        >
          <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '600px', maxHeight: '90vh', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px', overflowY: 'auto', position: 'relative' }}
          onClick={e => e.stopPropagation()}
          >
            <button onClick={closeModal} style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '1.5rem', fontWeight: 'bold', zIndex: 10 }}>✖</button>
            
            <div style={{ position: 'relative', height: '250px', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', marginTop: '10px' }}>
              {(() => {
                const images = selectedAlojamiento.image ? selectedAlojamiento.image.split(',').filter(Boolean) : [];
                if (images.length === 0) {
                  return <div style={{ width: '100%', height: '100%', background: '#e2e8f0' }} />;
                }
                return (
                  <>
                    <Image src={images[currentImageIndex]} alt={selectedAlojamiento.name} fill style={{ objectFit: 'cover' }} />
                    {images.length > 1 && (
                      <>
                        {/* Left Arrow */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
                          }}
                          style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 12, fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', transition: 'background-color 0.2s' }}
                        >
                          â€¹
                        </button>
                        {/* Right Arrow */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
                          }}
                          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 12, fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', transition: 'background-color 0.2s' }}
                        >
                          â€º
                        </button>
                        {/* Dots */}
                        <div style={{ position: 'absolute', bottom: '10px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '6px', zIndex: 12 }}>
                          {images.map((_: string, idx: number) => (
                            <div 
                              key={idx} 
                              style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: idx === currentImageIndex ? 'var(--color-orange)' : 'rgba(255,255,255,0.6)', transition: 'background-color 0.2s' }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>{selectedAlojamiento.name}</h2>
            <p style={{ color: 'var(--color-orange)', fontWeight: 600, marginBottom: '8px', fontSize: '1.1rem' }}>{selectedAlojamiento.type}</p>
            <OpeningStatusBadge openingHours={selectedAlojamiento.openingHours} showWeeklySchedule={true} />
            
            {selectedAlojamiento.description && (
              <p style={{ 
                color: 'var(--color-text)', 
                fontSize: '1rem', 
                lineHeight: '1.6', 
                marginBottom: '24px', 
                whiteSpace: 'pre-line' 
              }}>
                {selectedAlojamiento.description}
              </p>
            )}

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px' }}>Comodidades</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
              {selectedAlojamiento.features?.map((f: any) => (
                <div key={f.id} style={{ backgroundColor: 'var(--color-bg)', padding: '8px 16px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 500, border: '1px solid var(--color-border)' }}>
                  ✓ {f.name}
                </div>
              ))}
            </div>

            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}>
              <a 
                href={buildWhatsAppUrl(selectedAlojamiento)} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-primary" 
                style={{ width: '100%', padding: '16px', fontSize: '1.1rem', textDecoration: 'none' }}
                onClick={() => {
                  fetch('/api/track-event', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ entityId: selectedAlojamiento.id, type: 'WHATSAPP_CLICK' })
                  });
                }}
              >
                📱 Consultar Disponibilidad
              </a>
            </div>

            <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)', textAlign: 'center', backgroundColor: 'white', marginTop: '16px' }}>
              <Link href={`/alojarse/${selectedAlojamiento.id}`} style={{ color: 'var(--color-orange)', fontWeight: 'bold', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                Ver ficha completa / Compartir
              </Link>
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


