'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import PublicityBanner from '@/components/PublicityBanner';
import { Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import FavoriteButton from '@/components/FavoriteButton';
import OpeningStatusBadge from '@/components/OpeningStatusBadge';
import VerifiedBadge from '@/components/VerifiedBadge';


export default function ComerClient({ initialCategories, initialBusinesses }: { initialCategories?: any[], initialBusinesses?: any[] }) {
  const [selectedComercio, setSelectedComercio] = useState<any | null>(null);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [categories, setCategories] = useState<any[]>(initialCategories || []);
  const [businesses, setBusinesses] = useState<any[]>(initialBusinesses || []);
  const [loading, setLoading] = useState(!initialCategories || !initialBusinesses);
  const [searchQuery, setSearchQuery] = useState('');

  // Colores para las categorías si no tienen uno definido (banners ilustrativos locales y de alta calidad)
  const categoryStyles: { [key: string]: { color: string, bg: string } } = {
    "Pizzería": { color: "#e63946", bg: "/images/comer_pizzeria.png" },
    "Hamburguesa": { color: "#f4a261", bg: "/images/comer_hamburguesa.png" },
    "Cervecería": { color: "#e9c46a", bg: "/images/comer_cerveceria.png" },
    "Rotisería": { color: "#e76f51", bg: "/images/comer_roticeria.png" },
    "Restaurante": { color: "#2a9d8f", bg: "/images/comer_restaurante.png" },
    "Cafetería": { color: "#8b5cf6", bg: "/images/comer_restaurante.png" },
    "Cafetería y Heladería": { color: "#8b5cf6", bg: "/images/comer_restaurante.png" },
    "Heladería": { color: "#ec4899", bg: "/images/comer_restaurante.png" },
    "Bar": { color: "#f59e0b", bg: "/images/comer_cerveceria.png" },
    "Bar y Pub": { color: "#f59e0b", bg: "/images/comer_cerveceria.png" },
    "Parrilla": { color: "#b91c1c", bg: "/images/comer_restaurante.png" },
    "Parrilla y Minutas": { color: "#b91c1c", bg: "/images/comer_restaurante.png" },
    "Gastronomía": { color: "#2a9d8f", bg: "/images/comer_restaurante.png" }
  };

  // Filtro estricto para asegurar que solo se muestren rubros de gastronomía en Qué Comer
  const isStrictGastronomy = (cat: any) => {
    if (!cat) return false;
    const link = cat.link || '';
    if (link.startsWith('/comercios') || link.startsWith('/alojarse') || link.startsWith('/aventuras') || link.startsWith('/guia')) {
      return false;
    }
    const title = (cat.title || '').toLowerCase().trim();
    const excludedKeywords = [
      'ferretería', 'ferreteria', 'farmacia', 'forrajería', 'forrajeria', 
      'supermercado', 'almacén', 'almacen', 'indumentaria', 'calzado', 
      'parques', 'mascotas', 'regionales', 'artesanías', 'artesanias', 
      'kiosco', 'librería', 'libreria', 'hogar', 'muebles', 'construcción', 
      'construccion', 'camping', 'cabaña', 'cabana', 'hotel', 'alojamiento',
      'trekking', 'rafting', 'pesca', 'agencia', 'vehículo', 'vehiculo',
      'mecánico', 'mecanico', 'servicios', 'medios'
    ];
    return !excludedKeywords.some(ex => title.includes(ex));
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

  // Filtrar para mostrar únicamente comercios de tipo 'Comercio Completo' o que tengan banner, que pertenezcan a gastronomía
  const activePremiumBusinesses = businesses.filter(b => getPriority(b) <= 3 && isStrictGastronomy(b.category));

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

  const displayableCats = useMemo(() => {
    return categories.filter(isStrictGastronomy);
  }, [categories]);

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
            .filter(isStrictGastronomy)
            .slice(0, 8)
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
            ✕
          </button>
        )}
      </div>

      {/* SECCIÓN DE DESTACADOS (CON BANNER) */}
      {bannerBusinesses.length > 0 && (
        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ fontSize: '1.5rem', borderLeft: '5px solid var(--color-orange)', paddingLeft: '12px', marginBottom: '24px', color: 'var(--color-text-main)' }}>
            Sponsors y Destacados
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {bannerBusinesses.map(comercio => {
              return (
                <button key={comercio.id} style={{ backgroundColor: 'white', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)', cursor: 'pointer', display: 'block', width: '100%', textAlign: 'left', border: '2px solid var(--color-orange)' , position: 'relative' }}
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
                      type: 'Gastronomía',
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
                    <OpeningStatusBadge openingHours={comercio.openingHours} isVisible={comercio.showSchedule} />
                    <p style={{ color: 'var(--color-orange)', fontSize: '0.95rem', fontWeight: 600, marginTop: '6px' }}>Ver menú y pedir</p>
                  </div>
                  <VerifiedBadge isVerified={comercio.isVerified} style={{ bottom: '8px', right: '8px' }} />
                </button>
              );
            })}
          </div>
        </section>
      )}
      
      <h1 className="section-title">Dónde Comer y Delivery en Aluminé</h1>

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
                    
                    let productList: string[] = [];
                    if (comercio.details) {
                      try {
                        const parsed = JSON.parse(comercio.details);
                        if (Array.isArray(parsed)) productList = parsed;
                        else if (typeof parsed === 'string') productList = parsed.split(',').map((s: string) => s.trim()).filter(Boolean);
                      } catch {
                        productList = comercio.details.split(',').map((s: string) => s.trim()).filter(Boolean);
                      }
                    }

                    return (
                    <button key={comercio.id} style={{ backgroundColor: 'white', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)', cursor: 'pointer', display: 'flex', flexDirection: 'column', width: '100%', textAlign: 'left', border: isDestacado ? '2px solid var(--color-orange)' : '1px solid var(--color-border)', position: 'relative' }}
                    onClick={() => {
                      setSelectedComercio(comercio);
                      setCart({});
                    }}
                    className="commerce-card"
                    >
                      <div style={{ position: 'relative', height: '160px', width: '100%' }}>
                        <FavoriteButton item={{
                          id: comercio.id,
                          title: comercio.name,
                          image: comercio.image || '',
                          type: 'Gastronomía',
                          url: `/comer/${comercio.id}`
                        }} />
                        {comercio.image ? (
                          <Image src={comercio.image} alt={comercio.name} fill style={{ objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: '#e2e8f0' }} />
                        )}
                      </div>
                      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-orange)', backgroundColor: '#fff7ed', padding: '2px 8px', borderRadius: '10px', border: '1px solid #fed7aa' }}>
                            {comercio.category?.title || 'Gastronomía'}
                          </span>
                          {comercio.hasDelivery ? (
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#065f46', backgroundColor: '#ecfdf5', padding: '2px 6px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                              🛵 Delivery
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#991b1b', backgroundColor: '#fef2f2', padding: '2px 6px', borderRadius: '6px', border: '1px solid #fecaca' }}>
                              🚫 Sin Delivery
                            </span>
                          )}
                        </div>

                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text-main)' }}>{comercio.name}</h3>
                        
                        {comercio.description && (
                          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '10px', lineHeight: '1.35', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {comercio.description}
                          </p>
                        )}

                        {productList.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                            {productList.slice(0, 3).map((prod, i) => (
                              <span key={i} style={{ backgroundColor: '#f1f5f9', color: '#334155', fontSize: '0.72rem', fontWeight: 600, padding: '2px 6px', borderRadius: '6px' }}>
                                🛍️ {prod}
                              </span>
                            ))}
                            {productList.length > 3 && (
                              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, alignSelf: 'center' }}>
                                +{productList.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                          <OpeningStatusBadge openingHours={comercio.openingHours} isVisible={comercio.showSchedule} />
                          <p style={{ color: 'var(--color-orange)', fontSize: '0.95rem', fontWeight: 700, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Ver menú y pedir →
                          </p>
                        </div>
                      </div>
                      <VerifiedBadge isVerified={comercio.isVerified} style={{ bottom: '8px', right: '8px' }} />
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

      {/* Modal de Menú */}
      {selectedComercio && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}
        onClick={() => setSelectedComercio(null)}
        >
          <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '650px', maxHeight: '90vh', borderRadius: '24px', padding: '0', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}
          onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{selectedComercio.name}</h2>
                  <VerifiedBadge isVerified={selectedComercio.isVerified} style={{ position: 'relative', bottom: 0, right: 0 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                  <span style={{ color: 'var(--color-orange)', backgroundColor: '#fff7ed', fontWeight: 700, fontSize: '0.85rem', padding: '2px 10px', borderRadius: '12px', border: '1px solid #fed7aa' }}>
                    {selectedComercio.category?.title || 'Gastronomía'}
                  </span>
                  {selectedComercio.hasDelivery ? (
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#065f46', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '8px', border: '1px solid #a7f3d0', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      🛵 Cuenta con Delivery
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#991b1b', backgroundColor: '#fef2f2', padding: '2px 8px', borderRadius: '8px', border: '1px solid #fecaca', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      🚫 No cuenta con Delivery
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedComercio(null)} style={{ fontSize: '1.4rem', fontWeight: 'bold', width: '38px', height: '38px', borderRadius: '50%', background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              {selectedComercio.description && (
                <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                  <p style={{ fontSize: '0.92rem', color: '#334155', margin: 0, lineHeight: '1.45' }}>
                    {selectedComercio.description}
                  </p>
                </div>
              )}

              {(() => {
                if (!selectedComercio.details) return null;
                let productList: string[] = [];
                try {
                  const parsed = JSON.parse(selectedComercio.details);
                  if (Array.isArray(parsed)) productList = parsed;
                  else if (typeof parsed === 'string') productList = parsed.split(',').map((s: string) => s.trim()).filter(Boolean);
                } catch {
                  productList = selectedComercio.details.split(',').map((s: string) => s.trim()).filter(Boolean);
                }
                if (productList.length === 0) return null;
                return (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                      ⭐ Artículos / Especialidades destacadas:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {productList.map((prod: string, i: number) => (
                        <span key={i} style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', color: '#c2410c', padding: '4px 10px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600 }}>
                          🛍️ {prod}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <OpeningStatusBadge openingHours={selectedComercio.openingHours} showWeeklySchedule={true} isVisible={selectedComercio.showSchedule} />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                {selectedComercio.menu?.map((item: any) => (
                  <div key={item.id} style={{ display: 'flex', gap: '16px', padding: '16px', border: '1px solid var(--color-border)', borderRadius: '20px', alignItems: 'center' }}>
                    {item.image && (
                      <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>{item.name}</h4>
                      {item.description && <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '8px', lineHeight: '1.3' }}>{item.description}</p>}
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
                  <p style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Próximamente menú online para este comercio.</p>
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
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', flexShrink: 0, backgroundColor: 'var(--color-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.4rem' }}>
                      📖
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '2px', color: 'var(--color-text-main)' }}>¿Quieres ver más opciones?</h4>
                      <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '0', lineHeight: '1.3' }}>Toca aquí para pedirnos la carta completa por WhatsApp.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {Object.keys(cart).length > 0 && (
              <div style={{ padding: '20px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Total de tu pedido</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-green)' }}>
                    ${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(cartTotal)}
                  </span>
                </div>
                <a 
                  href={whatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-primary" 
                  style={{ width: '100%', padding: '14px', fontSize: '1.05rem', textDecoration: 'none', textAlign: 'center', display: 'block', borderRadius: '14px' }}
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
            
            <div style={{ padding: '14px', borderTop: '1px solid var(--color-border)', textAlign: 'center', backgroundColor: 'white' }}>
              <Link href={`/comer/${selectedComercio.id}`} style={{ color: 'var(--color-orange)', fontWeight: 'bold', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem' }}>
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
