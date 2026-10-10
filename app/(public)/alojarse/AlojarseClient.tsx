'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import PublicityBanner from '@/components/PublicityBanner';
import Link from 'next/link';
import { Loader2, Search } from 'lucide-react';
import FavoriteButton from '@/components/FavoriteButton';
import OpeningStatusBadge from '@/components/OpeningStatusBadge';
import VerifiedBadge from '@/components/VerifiedBadge';


// Helper para parsear los detalles/productos/servicios destacados (hasta 5 ítems)
const parseAccommodationDetails = (detailsStr?: string | null) => {
  if (!detailsStr) return [];
  try {
    const trimmed = detailsStr.trim();
    if (trimmed.startsWith('[')) {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((it: any) => {
          if (typeof it === 'string') return { name: it };
          return {
            name: it.name || '',
            description: it.description || '',
            price: it.price !== undefined && it.price !== null ? String(it.price) : '',
            image: it.image || ''
          };
        }).filter((it: any) => it && it.name);
      }
    } else {
      return detailsStr.split(',').map((s: string) => ({ name: s.trim() })).filter((p: any) => p.name);
    }
  } catch {
    return (detailsStr || '').split(',').map((s: string) => ({ name: s.trim() })).filter((p: any) => p.name);
  }
  return [];
};

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
    "Cabañas": { color: "#e63946", bgImage: "/images/refugio_bosque.png" },
    "Hoteles": { color: "#f4a261", bgImage: "/images/hotel_alumine.png" },
    "Hostel": { color: "#e9c46a", bgImage: "/images/refugio_bosque.png" },
    "Campings": { color: "#2a9d8f", bgImage: "/images/Campingalumine.webp" }
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
        <div className="banner-categories" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(2, 150px)' }}>
          {[
            { cat: "Cabañas", color: "#e63946", bgImage: "/images/refugio_bosque.png" },
            { cat: "Hoteles", color: "#f4a261", bgImage: "/images/hotel_pehuenia.png" },
            { cat: "Hostel", color: "#e9c46a", bgImage: "/images/refugio_bosque.png" },
            { cat: "Campings", color: "#2a9d8f", bgImage: "/images/atardecer-aluminé.jpg" }
          ].map((item) => (
            <a 
              href={`#${item.cat.toLowerCase()}`} 
              key={item.cat} 
              className="banner-item" 
              style={{ backgroundImage: `url(${item.bgImage})` }}
            >
              <div className="banner-overlay" style={{ borderBottom: `4px solid ${item.color}` }}></div>
              <span className="banner-text">{item.cat.toUpperCase()}</span>
            </a>
          ))}
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
            ✕
          </button>
        )}
      </div>

      <h1 className="section-title">Dónde Alojarse en Aluminé</h1>

      {/* SECCIÓN DE DESTACADOS (CON BANNER) */}
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
                  style={{ backgroundColor: 'white', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)', cursor: 'pointer', display: 'block', width: '100%', textAlign: 'left', border: '2px solid var(--color-orange)' , position: 'relative' }}
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
                    <OpeningStatusBadge openingHours={alojamiento.openingHours} isVisible={alojamiento.showSchedule} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px', marginTop: '6px' }}>
                      {(() => {
                        const detailsItems = parseAccommodationDetails(alojamiento.details);
                        const displayItems = detailsItems.length > 0 
                          ? detailsItems 
                          : (alojamiento.features || []).map((f: any) => ({ name: f.name }));
                        
                        return (
                          <>
                            {displayItems.slice(0, 3).map((f: any, idx: number) => (
                              <span key={idx} style={{ fontSize: '0.75rem', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                {detailsItems.length > 0 ? '🏕️' : '✓'} {f.name}
                                {f.price && !isNaN(parseFloat(String(f.price))) && (
                                  <b style={{ color: '#16a34a' }}>(${new Intl.NumberFormat('es-AR').format(parseFloat(String(f.price)))})</b>
                                )}
                              </span>
                            ))}
                            {displayItems.length > 3 && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', padding: '4px 8px' }}>
                                +{displayItems.length - 3}
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    <p style={{ color: 'var(--color-orange)', fontSize: '0.95rem', fontWeight: 600 }}>Ver detalles y reservar</p>
                  </div>
                  <VerifiedBadge isVerified={alojamiento.isVerified} style={{ bottom: '8px', right: '8px' }} />
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
                  <button key={alojamiento.id} style={{ backgroundColor: 'white', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)', cursor: 'pointer', display: 'block', width: '100%', textAlign: 'left', border: isDestacado ? '2px solid var(--color-orange)' : '1px solid var(--color-border)' , position: 'relative' }}
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
                      <OpeningStatusBadge openingHours={alojamiento.openingHours} isVisible={alojamiento.showSchedule} />
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px', marginTop: '6px' }}>
                        {(() => {
                          const detailsItems = parseAccommodationDetails(alojamiento.details);
                          const displayItems = detailsItems.length > 0 
                            ? detailsItems 
                            : (alojamiento.features || []).map((f: any) => ({ name: f.name }));
                          
                          return (
                            <>
                              {displayItems.slice(0, 3).map((f: any, idx: number) => (
                                <span key={idx} style={{ fontSize: '0.75rem', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  {detailsItems.length > 0 ? '🏕️' : '✓'} {f.name}
                                  {f.price && !isNaN(parseFloat(String(f.price))) && (
                                    <b style={{ color: '#16a34a' }}>(${new Intl.NumberFormat('es-AR').format(parseFloat(String(f.price)))})</b>
                                  )}
                                </span>
                              ))}
                              {displayItems.length > 3 && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', padding: '4px 8px' }}>
                                  +{displayItems.length - 3}
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </div>
                      <p style={{ color: 'var(--color-orange)', fontSize: '0.95rem', fontWeight: 600 }}>Ver detalles y reservar</p>
                    </div>
                    <VerifiedBadge isVerified={alojamiento.isVerified} style={{ bottom: '8px', right: '8px' }} />
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
                <button key={alojamiento.id} style={{ backgroundColor: 'white', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)', cursor: 'pointer', display: 'block', width: '100%', textAlign: 'left', border: isDestacado ? '2px solid var(--color-orange)' : '1px solid var(--color-border)' , position: 'relative' }}
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
                    <OpeningStatusBadge openingHours={alojamiento.openingHours} isVisible={alojamiento.showSchedule} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px', marginTop: '6px' }}>
                      {(() => {
                        const detailsItems = parseAccommodationDetails(alojamiento.details);
                        const displayItems = detailsItems.length > 0 
                          ? detailsItems 
                          : (alojamiento.features || []).map((f: any) => ({ name: f.name }));
                        
                        return (
                          <>
                            {displayItems.slice(0, 3).map((f: any, idx: number) => (
                              <span key={idx} style={{ fontSize: '0.75rem', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                {detailsItems.length > 0 ? '🏕️' : '✓'} {f.name}
                                {f.price && !isNaN(parseFloat(String(f.price))) && (
                                  <b style={{ color: '#16a34a' }}>(${new Intl.NumberFormat('es-AR').format(parseFloat(String(f.price)))})</b>
                                )}
                              </span>
                            ))}
                            {displayItems.length > 3 && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', padding: '4px 8px' }}>
                                +{displayItems.length - 3}
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    <p style={{ color: 'var(--color-orange)', fontSize: '0.95rem', fontWeight: 600 }}>Ver detalles y reservar</p>
                  </div>
                  <VerifiedBadge isVerified={alojamiento.isVerified} style={{ bottom: '8px', right: '8px' }} />
                </button>
              );
            })}
          </div>
        </section>
      )}

      <div style={{ marginTop: '20px' }}>
        <PublicityBanner page="Dormir" section={3} height="150px" delay="4s" />
      </div>

      {selectedAlojamiento && (() => {
        const parsedProducts = parseAccommodationDetails(selectedAlojamiento.details);
        return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', zIndex: 1000, padding: '20px' }}
        onClick={closeModal}
        >
          <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '650px', maxHeight: '90vh', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px', overflowY: 'auto', position: 'relative' }}
          onClick={e => e.stopPropagation()}
          >
            <button onClick={closeModal} style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '1.5rem', fontWeight: 'bold', zIndex: 10 }}>✕</button>
            
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
                          ‹
                        </button>
                        {/* Right Arrow */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
                          }}
                          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 12, fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', transition: 'background-color 0.2s' }}
                        >
                          ›
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>{selectedAlojamiento.name}</h2>
              <VerifiedBadge isVerified={selectedAlojamiento.isVerified} style={{ position: 'relative', bottom: 0, right: 0 }} />
            </div>
            <p style={{ color: 'var(--color-orange)', fontWeight: 600, marginBottom: '8px', fontSize: '1.1rem' }}>{selectedAlojamiento.type}</p>
            <OpeningStatusBadge openingHours={selectedAlojamiento.openingHours} showWeeklySchedule={true} isVisible={selectedAlojamiento.showSchedule} />
            
            {selectedAlojamiento.description && (
              <p style={{ 
                color: 'var(--color-text)', 
                fontSize: '1rem', 
                lineHeight: '1.6', 
                marginBottom: '20px', 
                whiteSpace: 'pre-line' 
              }}>
                {selectedAlojamiento.description}
              </p>
            )}

            {/* SECCIÓN 1: PRODUCTOS / OFERTAS / SERVICIOS DESTACADOS CON FOTOS */}
            {parsedProducts.length > 0 && (
              <div style={{ marginTop: '16px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🏕️ Opciones y Servicios Destacados
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '14px' }}>
                  {parsedProducts.map((prod: any, idx: number) => {
                    const productMsg = `Hola ${selectedAlojamiento.name}, te contacto desde AluminéGO. Quisiera consultar sobre la opción: ${prod.name}${prod.price ? ` ($${new Intl.NumberFormat('es-AR').format(parseFloat(prod.price))})` : ''}...`;
                    return (
                      <div key={idx} style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1.5px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                        {prod.image && (
                          <div style={{ position: 'relative', width: '100%', height: '130px', backgroundColor: '#f1f5f9' }}>
                            <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b' }}>{prod.name}</span>
                            {prod.price && !isNaN(parseFloat(String(prod.price))) && (
                              <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '0.9rem', backgroundColor: '#f0fdf4', padding: '2px 8px', borderRadius: '6px', border: '1px solid #bbf7d0', whiteSpace: 'nowrap' }}>
                                ${new Intl.NumberFormat('es-AR').format(parseFloat(String(prod.price)))}
                              </span>
                            )}
                          </div>
                          {prod.description && (
                            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                              {prod.description}
                            </p>
                          )}
                          {selectedAlojamiento.whatsapp && (
                            <a
                              href={`https://wa.me/${selectedAlojamiento.whatsapp}?text=${encodeURIComponent(productMsg)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ marginTop: 'auto', paddingTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#16a34a', textDecoration: 'none' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              Consultar por WhatsApp →
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECCIÓN 2: COMODIDADES Y SERVICIOS (CON TILDES) */}
            {selectedAlojamiento.features && selectedAlojamiento.features.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px', color: 'var(--color-text-main)' }}>
                  Servicios y Comodidades
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedAlojamiento.features.map((f: any) => (
                    <div key={f.id || f.name} style={{ backgroundColor: 'var(--color-bg)', padding: '6px 14px', borderRadius: '50px', fontSize: '0.88rem', fontWeight: 600, color: '#334155', border: '1px solid var(--color-border)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: 'var(--color-green)', fontWeight: 800 }}>✓</span> {f.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

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
        );
      })()}

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
