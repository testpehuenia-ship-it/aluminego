'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import PublicityBanner from '@/components/PublicityBanner';
import { Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import FavoriteButton from '@/components/FavoriteButton';
import OpeningStatusBadge from '@/components/OpeningStatusBadge';

export default function ComerClient({ initialCategories, initialBusinesses }: { initialCategories?: any[], initialBusinesses?: any[] }) {
  const [selectedComercio, setSelectedComercio] = useState<any | null>(null);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [categories, setCategories] = useState<any[]>(initialCategories || []);
  const [businesses, setBusinesses] = useState<any[]>(initialBusinesses || []);
  const [loading, setLoading] = useState(!initialCategories || !initialBusinesses);
  const [searchQuery, setSearchQuery] = useState('');

  // Colores para las categorías si no tienen uno definido (simulamos los banners ilustrativos)
  const categoryStyles: { [key: string]: { color: string, bg: string } } = {
    "Pizzería": { color: "#e63946", bg: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80" },
    "Hamburguesa": { color: "#f4a261", bg: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80" },
    "Cervecería": { color: "#e9c46a", bg: "https://images.unsplash.com/photo-1532634922-8fe0b757fb13?auto=format&fit=crop&w=800&q=80" },
    "Rotisería": { color: "#e76f51", bg: "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?auto=format&fit=crop&w=800&q=80" },
    "Restaurante": { color: "#2a9d8f", bg: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80" },
    "Supermercado": { color: "#264653", bg: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80" }
  };

  const fetchData = async () => {
    try {
      const [catRes, bizRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/businesses')
      ]);
      const catData = await catRes.json();
      const bizData = await bizRes.json();
      
      setCategories(catData);
      setBusinesses(bizData);
    } catch (e) {
      console.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialCategories || !initialBusinesses || initialCategories.length === 0 || initialBusinesses.length === 0) {
      fetchData();
    }
  }, [initialCategories, initialBusinesses]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const openId = params.get('open');
      if (openId && businesses.length > 0) {
        const found = businesses.find(b => b.id === openId);
        if (found) {
          setSelectedComercio(found);
          setCart({});
        }
      }
    }
  }, [businesses]);

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

  // Filtrar para mostrar Áºnicamente comercios de tipo 'Comercio Completo' o que tengan banner
  const activePremiumBusinesses = businesses.filter(b => getPriority(b) <= 3);

  const filteredActiveBusinesses = useMemo(() => {
    if (!searchQuery.trim()) return activePremiumBusinesses;
    const q = searchQuery.toLowerCase().trim();
    return activePremiumBusinesses.filter(b => 
      b.name.toLowerCase().includes(q) || 
      (b.description && b.description.toLowerCase().includes(q)) ||
      (b.category?.title && b.category.title.toLowerCase().includes(q))
    );
  }, [activePremiumBusinesses, searchQuery]);

  const bannerBusinesses = useMemo(() => {
    return filteredActiveBusinesses.filter(hasBanner).sort(sortServices);
  }, [filteredActiveBusinesses]);

  const nonBannerBusinesses = useMemo(() => {
    return filteredActiveBusinesses.filter(b => !hasBanner(b));
  }, [filteredActiveBusinesses]);

  const displayableCats = categories.filter(cat => 
    cat.link?.startsWith('/comer') && 
    !cat.title.toLowerCase().includes('camping') && 
    !cat.title.toLowerCase().includes('cabaña')
  );

  const addToCart = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId] -= 1;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const cartTotal = useMemo(() => {
    if (!selectedComercio || !selectedComercio.menu) return 0;
    return selectedComercio.menu.reduce((total: number, item: any) => {
      const quantity = cart[item.id] || 0;
      return total + (item.price * quantity);
    }, 0);
  }, [cart, selectedComercio]);

  const whatsappUrl = useMemo(() => {
    if (!selectedComercio) return "";
    
    let message = `*Hola ${selectedComercio.name}!* Te contacto desde AluminéGO.\nQuisiera hacer el siguiente pedido:\n\n`;
    
    selectedComercio.menu.forEach((item: any) => {
      const quantity = cart[item.id];
      if (quantity > 0) {
        message += `- ${quantity}x ${item.name} ($${item.price * quantity})\n`;
      }
    });
    
    message += `\n*Total: $${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(cartTotal)}*`;
    message += `\n\n_Pedido realizado vía AluminéGO_`;
    
    return `https://wa.me/${selectedComercio.whatsapp}?text=${encodeURIComponent(message)}`;
  }, [selectedComercio, cart, cartTotal]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
        <Loader2 className="animate-spin" size={48} color="var(--color-orange)" />
        <p style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Cargando delicias...</p>
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
            <span style={{ color: 'white' }}>PEDIDOS ONLINE</span>
          </div>
          <div className="banner-subtitle">LAS MEJORES OPCIONES</div>
        </div>
        <div className="banner-categories">
          {categories
            .filter(cat => 
              cat.link?.startsWith('/comer') && 
              !cat.title.toLowerCase().includes('camping') && 
              !cat.title.toLowerCase().includes('cabaña')
            )
            .slice(0, 6)
            .map((item) => {
              const style = categoryStyles[item.title] || { color: '#0d9488', bg: item.image };
            return (
              <a 
                href={`#${item.title.toLowerCase()}`} 
                key={item.id} 
                className="banner-item" 
                style={{ backgroundImage: `url(${style.bg})` }}
              >
                <div className="banner-overlay" style={{ borderBottom: `4px solid ${style.color}` }}></div>
                <span className="banner-text">{item.title.toUpperCase()}</span>
              </a>
            );
          })}
        </div>
      </div>
      
      <div style={{ marginBottom: '40px' }}>
        <PublicityBanner page="QueComer" section={1} height="150px" delay="0s" />
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
          placeholder="Buscar platos, locales, rotiserías..." 
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

      {/* SECCIÁ“N DE DESTACADOS (CON BANNER) */}
      {bannerBusinesses.length > 0 && (
        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ fontSize: '1.5rem', borderLeft: '5px solid var(--color-orange)', paddingLeft: '12px', marginBottom: '24px', color: 'var(--color-text-main)' }}>
            Sponsors y Destacados
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {bannerBusinesses.map(comercio => {
              return (
                <button key={comercio.id} style={{ backgroundColor: 'white', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)', cursor: 'pointer', display: 'block', width: '100%', textAlign: 'left', border: '2px solid var(--color-orange)' }}
                onClick={() => {
                  setSelectedComercio(comercio);
                  setCart({});
                }}
                className="commerce-card"
                >
                  <div style={{ position: 'relative', height: '160px' }}>
                    <FavoriteButton item={{
                      id: comercio.id,
                      title: comercio.name,
                      image: comercio.image || '',
                      type: 'gastronomía',
                      url: `/comer/${comercio.id}`
                    }} />
                    {comercio.image ? (
                      <Image src={comercio.image} alt={comercio.name} fill style={{ objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#e2e8f0' }} />
                    )}
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px', color: 'var(--color-text-main)' }}>{comercio.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-orange)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                      {comercio.category?.title}
                    </span>
                    <OpeningStatusBadge openingHours={comercio.openingHours} />
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>Ver menÁº y pedir</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}
      
      <h1 className="section-title">¿Qué pedimos hoy?</h1>

      {displayableCats.map((cat, index, arr) => {
        const catBusinesses = nonBannerBusinesses.filter(b => b.categoryId === cat.id && hasPlan(b));
        if (searchQuery.trim() && catBusinesses.length === 0) return null;

        const style = categoryStyles[cat.title] || { color: '#0d9488', bg: cat.image };

        return (
          <React.Fragment key={`paid-${cat.id}`}>
            <section id={cat.title.toLowerCase()} style={{ marginBottom: '60px' }}>
              <div style={{
                position: 'relative',
                height: '140px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                marginBottom: '24px',
                backgroundImage: `url(${style.bg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '24px',
                borderLeft: `8px solid ${style.color}`
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1 }}></div>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', zIndex: 2, textShadow: '0 2px 8px rgba(0,0,0,0.8)', letterSpacing: '1px' }}>
                  {cat.title}
                </h2>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: catBusinesses.length === 0 ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {catBusinesses.length === 0 ? (
                  <div style={{
                    padding: '40px 24px',
                    textAlign: 'center',
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    borderRadius: 'var(--radius-md)',
                    border: '2px dashed var(--color-border)',
                    color: 'var(--color-text-muted)',
                    fontSize: '1.05rem',
                    fontWeight: 500,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{ fontSize: '2rem' }}>🍽️</span>
                    <span>Próximamente más locales en la categoría {cat.title}</span>
                  </div>
                ) : (
                  catBusinesses.sort(sortServices).map(comercio => {
                    const isDestacado = comercio.subscription?.planType?.includes('plan_basico_destacado') || comercio.subscription?.planType?.includes('plan_comercio_completo');
                    return (
                    <button key={comercio.id} style={{ backgroundColor: 'white', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)', cursor: 'pointer', display: 'block', width: '100%', textAlign: 'left', border: isDestacado ? '2px solid var(--color-orange)' : '1px solid var(--color-border)' }}
                    onClick={() => {
                      setSelectedComercio(comercio);
                      setCart({});
                    }}
                    className="commerce-card"
                    >
                      <div style={{ position: 'relative', height: '160px' }}>
                        <FavoriteButton item={{
                          id: comercio.id,
                          title: comercio.name,
                          image: comercio.image || '',
                          type: 'gastronomía',
                          url: `/comer/${comercio.id}`
                        }} />
                        {comercio.image ? (
                          <Image src={comercio.image} alt={comercio.name} fill style={{ objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: '#e2e8f0' }} />
                        )}
                      </div>
                      <div style={{ padding: '16px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px', color: 'var(--color-text-main)' }}>{comercio.name}</h3>
                        <OpeningStatusBadge openingHours={comercio.openingHours} />
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>Ver menÁº y pedir</p>
                      </div>
                    </button>
                    );
                  })
                )}
              </div>
            </section>
            {index === Math.floor(arr.length / 2) && <PublicityBanner page="QueComer" section={2} height="150px" delay="2s" />}
          </React.Fragment>
        );
      })}



      <div style={{ marginTop: '20px' }}>
        <PublicityBanner page="QueComer" section={3} height="100px" delay="4s" />
      </div>

      {/* Modal de MenÁº */}
      {selectedComercio && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}
        onClick={() => setSelectedComercio(null)}
        >
          <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '650px', maxHeight: '90vh', borderRadius: '24px', padding: '0', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}
          onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>{selectedComercio.name}</h2>
                <p style={{ color: 'var(--color-orange)', fontWeight: 600, fontSize: '0.9rem' }}>{selectedComercio.category?.title}</p>
              </div>
              <button onClick={() => setSelectedComercio(null)} style={{ fontSize: '1.5rem', fontWeight: 'bold', width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', border: 'none', cursor: 'pointer' }}>✖</button>
            </div>
            
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <OpeningStatusBadge openingHours={selectedComercio.openingHours} showWeeklySchedule={true} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
                {selectedComercio.menu?.map((item: any) => (
                  <div key={item.id} style={{ display: 'flex', gap: '16px', padding: '16px', border: '1px solid var(--color-border)', borderRadius: '20px', alignItems: 'center' }}>
                    {item.image && (
                      <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>{item.name}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '8px', lineHeight: '1.3' }}>{item.description}</p>
                      <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-green)' }}>
                        ${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(item.price)}
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {cart[item.id] > 0 && (
                        <>
                          <button onClick={() => removeFromCart(item.id)} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--color-orange)', background: 'transparent', color: 'var(--color-orange)', fontWeight: 'bold', cursor: 'pointer' }}>-</button>
                          <span style={{ fontWeight: 800, fontSize: '1.1rem', minWidth: '20px', textAlign: 'center' }}>{cart[item.id]}</span>
                        </>
                      )}
                      <button onClick={() => addToCart(item.id)} style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-orange)', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>+</button>
                    </div>
                  </div>
                ))}
                {(!selectedComercio.menu || selectedComercio.menu.length === 0) && (
                  <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Próximamente menÁº online para este comercio.</p>
                )}
                
                {/* Botón estático para pedir carta completa por WhatsApp */}
                {selectedComercio.whatsapp && (
                  <div 
                    style={{ display: 'flex', gap: '16px', padding: '16px', border: '2px dashed var(--color-orange)', borderRadius: '20px', alignItems: 'center', backgroundColor: '#fff7ed', cursor: 'pointer', transition: 'transform 0.2s' }}
                    onClick={() => {
                      const whatsappMsg = `Hola, me contacto desde AluminéGO. Me gustaría ver la carta completa por favor.`;
                      window.open(`https://wa.me/${selectedComercio.whatsapp}?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
                      fetch('/api/track-event', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ entityId: selectedComercio.id, type: 'WHATSAPP_CLICK' })
                      });
                    }}
                  >
                    <div style={{ width: '60px', height: '60px', borderRadius: '12px', flexShrink: 0, backgroundColor: 'var(--color-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem' }}>
                      📖
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px', color: 'var(--color-text-main)' }}>¿Quieres ver más opciones?</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0', lineHeight: '1.3' }}>Toca aquí para pedirnos la carta completa por WhatsApp.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {Object.keys(cart).length > 0 && (
              <div style={{ padding: '24px', backgroundColor: '#f8fafc', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Total de tu pedido</span>
                  <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-green)' }}>
                    ${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(cartTotal)}
                  </span>
                </div>
                <a 
                  href={whatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-primary" 
                  style={{ width: '100%', padding: '16px', fontSize: '1.1rem', textDecoration: 'none', textAlign: 'center', display: 'block', borderRadius: '16px' }}
                  onClick={() => {
                    fetch('/api/track-event', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ entityId: selectedComercio.id, type: 'WHATSAPP_CLICK' })
                    });
                  }}
                >
                  📱 Enviar pedido por WhatsApp
                </a>
              </div>
            )}
            
            <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)', textAlign: 'center', backgroundColor: 'white' }}>
              <Link href={`/comer/${selectedComercio.id}`} style={{ color: 'var(--color-orange)', fontWeight: 'bold', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
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


