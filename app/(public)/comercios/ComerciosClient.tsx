'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import PublicityBanner from '@/components/PublicityBanner';
import Link from 'next/link';
import { Loader2, Search } from 'lucide-react';
import FavoriteButton from '@/components/FavoriteButton';
import OpeningStatusBadge from '@/components/OpeningStatusBadge';

export default function ComerciosClient({ initialCommerces, initialCategories }: { initialCommerces?: any[], initialCategories?: any[] }) {
  const [selectedCommerce, setSelectedCommerce] = useState<any | null>(null);
  const [commerces, setCommerces] = useState<any[]>(initialCommerces || []);
  const [categories, setCategories] = useState<any[]>(initialCategories || []);
  const [loading, setLoading] = useState(!initialCommerces || !initialCategories);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedCommerce]);

  const categoryStyles: { [key: string]: { color: string, bgImage: string } } = {
    "Supermercados": { color: "#2a9d8f", bgImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80" },
    "Supermercados y Almacenes": { color: "#2a9d8f", bgImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80" },
    "Regalerías": { color: "#f4a261", bgImage: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=800&q=80" },
    "Regalerías y Regionales": { color: "#f4a261", bgImage: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=800&q=80" },
    "Fiambrerías": { color: "#e76f51", bgImage: "/images/fiambreria_banner.jpg" },
    "Fiambrerías y Carnicerías": { color: "#e76f51", bgImage: "/images/fiambreria_banner.jpg" },
    "Farmacias": { color: "#00b4d8", bgImage: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80" },
    "Indumentaria": { color: "#9c27b0", bgImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80" },
    "Indumentaria y Calzado": { color: "#9c27b0", bgImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80" },
    "Mascotas y Viveros": { color: "#4caf50", bgImage: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80" },
    "Parques, Jardines y Mascotas": { color: "#4caf50", bgImage: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80" }
  };

  const fetchData = async () => {
    try {
      const [commRes, catRes] = await Promise.all([
        fetch('/api/commerces'),
        fetch('/api/categories')
      ]);
      const commData = await commRes.json();
      const catData = await catRes.json();
      setCommerces(commData);
      setCategories(catData);
    } catch (e) {
      console.error('Error fetching commerces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialCommerces || initialCommerces.length === 0 || !initialCategories || initialCategories.length === 0) {
      fetchData();
    }
  }, [initialCommerces, initialCategories]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const openId = params.get('open');
      if (openId && commerces.length > 0) {
        const found = commerces.find(c => c.id === openId);
        if (found) {
          setSelectedCommerce(found);
        }
      }
    }
  }, [commerces]);

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

  const buildWhatsAppUrl = (commerce: any) => {
    const message = `*Hola ${commerce.name}!* \nTe contacto desde AluminéGO.\nQuisiera hacerles una consulta.\n\n¡Muchas gracias!`;
    return `https://wa.me/${commerce.whatsapp}?text=${encodeURIComponent(message)}`;
  };

  const getCategoryAnchor = (link: string) => {
    if (!link) return '';
    const idx = link.indexOf('#');
    return idx !== -1 ? link.substring(idx + 1) : link.toLowerCase().replace(/ /g, '-');
  };

  const displayableCats = useMemo(() => {
    return categories.filter(cat => cat.link?.startsWith('/comercios'));
  }, [categories]);

  const filteredCommerces = useMemo(() => {
    if (!searchQuery.trim()) return commerces;
    const q = searchQuery.toLowerCase().trim();
    return commerces.filter(c => 
      c.name.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q)) ||
      c.type.toLowerCase().includes(q) ||
      (c.details && c.details.some((d: any) => d.name.toLowerCase().includes(q)))
    );
  }, [commerces, searchQuery]);

  // Filtrar para mostrar Áºnicamente comercios de tipo 'Comercio Completo' o que tengan banner
  const activePremiumCommerces = useMemo(() => {
    return filteredCommerces.filter(c => getPriority(c) <= 3);
  }, [filteredCommerces]);

  const bannerCommerces = useMemo(() => {
    return activePremiumCommerces.filter(hasBanner).sort(sortServices);
  }, [activePremiumCommerces]);

  const nonBannerCommerces = useMemo(() => {
    return activePremiumCommerces.filter(c => !hasBanner(c));
  }, [activePremiumCommerces]);

  const unmatchedCommerces = useMemo(() => {
    return nonBannerCommerces.filter(c => 
      !displayableCats.some(cat => cat.title.toLowerCase().trim() === c.type.toLowerCase().trim())
    );
  }, [nonBannerCommerces, displayableCats]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
        <Loader2 className="animate-spin" size={48} color="var(--color-green)" />
        <p style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Cargando comercios...</p>
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
            <span style={{ color: 'white' }}>COMERCIOS</span>
          </div>
          <div className="banner-subtitle">TIENDAS Y MERCADOS</div>
        </div>
        <div className="banner-categories" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gridAutoRows: '150px' }}>
          {displayableCats.slice(0, 6).map((item) => {
            const style = categoryStyles[item.title] || { color: '#0d9488', bgImage: item.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80" };
            const anchorId = getCategoryAnchor(item.link);
            return (
              <a 
                href={`#${anchorId}`} 
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

      <div style={{ marginBottom: '40px' }}>
        <PublicityBanner page="Comercios" section={1} height="150px" delay="0s" />
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
          placeholder="Buscar supermercados, regalerías, farmacias..." 
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

      <h1 className="section-title">Comercios Locales</h1>

      {/* SECCIÁ“N DE DESTACADOS (CON BANNER) */}
      {bannerCommerces.length > 0 && (
        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ fontSize: '1.5rem', borderLeft: '5px solid var(--color-orange)', paddingLeft: '12px', marginBottom: '24px', color: 'var(--color-text-main)' }}>
            Sponsors y Destacados
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {bannerCommerces.map(commerce => {
              return (
                <button 
                  key={commerce.id} 
                  style={{ backgroundColor: 'white', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)', cursor: 'pointer', display: 'block', width: '100%', textAlign: 'left', border: '2px solid var(--color-orange)' }}
                  onClick={() => setSelectedCommerce(commerce)}
                  className="commerce-card"
                >
                  <div style={{ position: 'relative', height: '200px' }}>
                    <FavoriteButton item={{
                      id: commerce.id,
                      title: commerce.name,
                      image: commerce.image ? commerce.image.split(',')[0] : '',
                      type: 'Commerce',
                      url: `/comercios/${commerce.slug || commerce.id}`
                    }} />
                    {commerce.image ? (
                      <Image src={commerce.image.split(',')[0]} alt={commerce.name} fill style={{ objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Sin imagen</div>
                    )}
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: 'var(--color-text-main)' }}>{commerce.name}</h3>
                    <OpeningStatusBadge openingHours={commerce.openingHours} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px', marginTop: '6px' }}>
                      {commerce.details?.slice(0, 3).map((d: any) => (
                        <span key={d.id} style={{ fontSize: '0.75rem', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)', padding: '4px 8px', borderRadius: '4px' }}>
                          {d.name}
                        </span>
                      ))}
                      {commerce.details?.length > 3 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', padding: '4px 8px' }}>
                          +{commerce.details.length - 3}
                        </span>
                      )}
                    </div>
                    <p style={{ color: 'var(--color-orange)', fontSize: '0.95rem', fontWeight: 600 }}>Ver detalles y contacto</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* RENDERIZADO DE COMERCIOS CON PLAN (PAGOS) */}
      {displayableCats.map((category, index) => {
        const catComms = nonBannerCommerces.filter(c => c.type.toLowerCase().trim() === category.title.toLowerCase().trim());
        if (catComms.length === 0) return null;

        const anchorId = getCategoryAnchor(category.link);

        return (
          <React.Fragment key={`paid-${category.id}`}>
            {index === Math.floor(displayableCats.length / 2) && (
              <div style={{ marginBottom: '40px' }}>
                <PublicityBanner page="Comercios" section={2} height="100px" delay="2s" />
              </div>
            )}
            <section id={anchorId} style={{ marginBottom: '60px' }}>
              <h2 style={{ fontSize: '1.5rem', borderLeft: '5px solid var(--color-green)', paddingLeft: '12px', marginBottom: '24px', color: 'var(--color-text-main)' }}>
                {category.title}
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {catComms.sort(sortServices).map(commerce => {
                  const isDestacado = commerce.subscription?.planType?.includes('plan_basico_destacado') || commerce.subscription?.planType?.includes('plan_comercio_completo');
                  return (
                    <button 
                      key={commerce.id} 
                      style={{ backgroundColor: 'white', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)', cursor: 'pointer', display: 'block', width: '100%', textAlign: 'left', border: isDestacado ? '2px solid var(--color-orange)' : '1px solid var(--color-border)' }}
                      onClick={() => setSelectedCommerce(commerce)}
                      className="commerce-card"
                    >
                      <div style={{ position: 'relative', height: '200px' }}>
                        <FavoriteButton item={{
                          id: commerce.id,
                          title: commerce.name,
                          image: commerce.image ? commerce.image.split(',')[0] : '',
                          type: 'Commerce',
                          url: `/comercios/${commerce.slug || commerce.id}`
                        }} />
                        {commerce.image ? (
                          <Image src={commerce.image.split(',')[0]} alt={commerce.name} fill style={{ objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Sin imagen</div>
                        )}
                      </div>
                      <div style={{ padding: '16px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: 'var(--color-text-main)' }}>{commerce.name}</h3>
                        <OpeningStatusBadge openingHours={commerce.openingHours} />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px', marginTop: '6px' }}>
                          {commerce.details?.slice(0, 3).map((d: any) => (
                            <span key={d.id} style={{ fontSize: '0.75rem', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)', padding: '4px 8px', borderRadius: '4px' }}>
                              {d.name}
                            </span>
                          ))}
                          {commerce.details?.length > 3 && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', padding: '4px 8px' }}>
                              +{commerce.details.length - 3}
                            </span>
                          )}
                        </div>
                        <p style={{ color: 'var(--color-orange)', fontSize: '0.95rem', fontWeight: 600 }}>Ver detalles y contacto</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </React.Fragment>
        );
      })}

      {unmatchedCommerces.length > 0 && (
        <section id="otros" style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '1.5rem', borderLeft: '5px solid var(--color-green)', paddingLeft: '12px', marginBottom: '24px', color: 'var(--color-text-main)' }}>
            Otros Comercios
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {unmatchedCommerces.sort(sortServices).map(commerce => {
              const isDestacado = commerce.subscription?.planType?.includes('plan_basico_destacado') || commerce.subscription?.planType?.includes('plan_comercio_completo');
              return (
                <button 
                  key={commerce.id} 
                  style={{ backgroundColor: 'white', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)', cursor: 'pointer', display: 'block', width: '100%', textAlign: 'left', border: isDestacado ? '2px solid var(--color-orange)' : '1px solid var(--color-border)' }}
                  onClick={() => setSelectedCommerce(commerce)}
                  className="commerce-card"
                >
                  <div style={{ position: 'relative', height: '200px' }}>
                    <FavoriteButton item={{
                      id: commerce.id,
                      title: commerce.name,
                      image: commerce.image ? commerce.image.split(',')[0] : '',
                      type: 'Commerce',
                      url: `/comercios/${commerce.slug || commerce.id}`
                    }} />
                    {commerce.image ? (
                      <Image src={commerce.image.split(',')[0]} alt={commerce.name} fill style={{ objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Sin imagen</div>
                    )}
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: 'var(--color-text-main)' }}>{commerce.name}</h3>
                    <OpeningStatusBadge openingHours={commerce.openingHours} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px', marginTop: '6px' }}>
                      {commerce.details?.slice(0, 3).map((d: any) => (
                        <span key={d.id} style={{ fontSize: '0.75rem', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)', padding: '4px 8px', borderRadius: '4px' }}>
                          {d.name}
                        </span>
                      ))}
                      {commerce.details?.length > 3 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', padding: '4px 8px' }}>
                          +{commerce.details.length - 3}
                        </span>
                      )}
                    </div>
                    <p style={{ color: 'var(--color-orange)', fontSize: '0.95rem', fontWeight: 600 }}>Ver detalles y contacto</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* SEPARADOR PARA COMERCIOS GRATUITOS */}
      <div style={{ marginBottom: '40px' }}>
        <PublicityBanner page="Comercios" section={3} height="100px" delay="4s" />
      </div>

      {selectedCommerce && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', zIndex: 1000, padding: '20px' }}
          onClick={() => setSelectedCommerce(null)}
        >
          <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '600px', maxHeight: '90vh', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px', overflowY: 'auto', position: 'relative' }}
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setSelectedCommerce(null)} style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '1.5rem', fontWeight: 'bold', zIndex: 10, background: 'none', border: 'none', cursor: 'pointer' }}>✖</button>
            
            <div style={{ position: 'relative', height: '250px', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', marginTop: '10px' }}>
              {(() => {
                const images = selectedCommerce.image ? selectedCommerce.image.split(',').filter(Boolean) : [];
                if (images.length === 0) {
                  return <div style={{ width: '100%', height: '100%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Sin imagen</div>;
                }
                return (
                  <>
                    <Image src={images[currentImageIndex]} alt={selectedCommerce.name} fill style={{ objectFit: 'cover' }} />
                    {images.length > 1 && (
                      <>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
                          }}
                          style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 12, fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
                        >
                          â€¹
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
                          }}
                          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 12, fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
                        >
                          â€º
                        </button>
                        <div style={{ position: 'absolute', bottom: '10px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '6px', zIndex: 12 }}>
                          {images.map((_: string, idx: number) => (
                            <div 
                              key={idx} 
                              style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: idx === currentImageIndex ? 'var(--color-orange)' : 'rgba(255,255,255,0.6)' }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>{selectedCommerce.name}</h2>
            <p style={{ color: 'var(--color-green)', fontWeight: 600, marginBottom: '8px', fontSize: '1.1rem' }}>{selectedCommerce.type}</p>
            <OpeningStatusBadge openingHours={selectedCommerce.openingHours} showWeeklySchedule={true} />
            
            {selectedCommerce.description && (
              <p style={{ color: 'var(--color-text)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '24px', whiteSpace: 'pre-line' }}>
                {selectedCommerce.description}
              </p>
            )}

            {selectedCommerce.details && selectedCommerce.details.length > 0 && (
              <>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px' }}>Detalle</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
                  {selectedCommerce.details?.map((d: any) => (
                    <div key={d.id} style={{ backgroundColor: 'var(--color-bg)', padding: '8px 16px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 500, border: '1px solid var(--color-border)' }}>
                      ✓ {d.name}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}>
              <a 
                href={buildWhatsAppUrl(selectedCommerce)} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-primary" 
                style={{ width: '100%', padding: '16px', fontSize: '1.1rem', textDecoration: 'none', backgroundColor: 'var(--color-green)', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', gap: '8px' }}
                onClick={() => {
                  fetch('/api/track-event', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ entityId: selectedCommerce.id, type: 'WHATSAPP_CLICK' })
                  });
                }}
              >
                📱 Contactar por WhatsApp
              </a>
            </div>

            <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)', textAlign: 'center', backgroundColor: 'white', marginTop: '16px' }}>
              <Link href={`/comercios/${selectedCommerce.slug || selectedCommerce.id}`} style={{ color: 'var(--color-orange)', fontWeight: 'bold', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
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
          border-color: var(--color-green) !important;
          box-shadow: 0 0 0 3px rgba(42, 157, 143, 0.2) !important;
        }
      `}</style>
    </div>
  );
}


