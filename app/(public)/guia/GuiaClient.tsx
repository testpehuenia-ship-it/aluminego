'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PublicityBanner from '@/components/PublicityBanner';
import { 
  Loader2, MapPin, Phone, ChevronDown, Search, 
  ShoppingBag, HeartPulse, ShieldCheck, Landmark, Utensils, 
  Home, Compass, Wrench, Truck, Gift, Shirt, PawPrint, 
  Store, Briefcase, PhoneCall, Car, Building2, Flame,
  HelpCircle, Coffee, Sparkles, Radio, Newspaper
} from 'lucide-react';
import FavoriteButton from '@/components/FavoriteButton';
import OpeningStatusBadge from '@/components/OpeningStatusBadge';
import VerifiedBadge from '@/components/VerifiedBadge';

// Helper para ordenar rubros siguiendo la misma secuencia de colores y secciones de la pantalla de inicio
const getCategoryRank = (cat: string) => {
  const c = (cat || '').toLowerCase().trim();
  // 1. Naranja: Gastronomía
  if (c.includes('gastronom') || c.includes('restauran') || c.includes('comida') || c.includes('café') || c.includes('cafe') || c.includes('rotiser') || c.includes('bar')) return 1;
  // 2. Verde: Alojamientos
  if (c.includes('aloj') || c.includes('cabaña') || c.includes('hotel') || c.includes('dormir') || c.includes('hoster')) return 2;
  // 3. Verde Oscuro: Aventuras y Actividades
  if (c.includes('aventura') || c.includes('excurs') || c.includes('turism') || c.includes('activid') || c.includes('paseo')) return 3;
  // 4. Púrpura: Comercios y Proveedurías
  if (c.includes('comercio') || c.includes('proveedur') || c.includes('tienda') || c.includes('negocio')) return 4;
  // 5. Instituciones y Servicios Públicos
  if (c.includes('instituc') || c.includes('públic') || c.includes('public') || c.includes('munici') || c.includes('trámite')) return 5;
  // 6. Salud
  if (c.includes('salud') || c.includes('farmacia') || c.includes('médic') || c.includes('hospital')) return 6;
  // 7. Emergencias y Seguridad
  if (c.includes('emergencia') || c.includes('bombero') || c.includes('polic') || c.includes('seguridad') || c.includes('guardia')) return 7;
  // 8. Medios de Comunicación / Noticias (Rojo)
  if (c.includes('medio') || c.includes('comunicac') || c.includes('noticia') || c.includes('radio') || c.includes('prensa')) return 8;
  // 9. Transporte y Traslados (Azul)
  if (c.includes('transporte') || c.includes('remis') || c.includes('taxi') || c.includes('traslado') || c.includes('colectiv')) return 9;
  // 10. Servicios Profesionales
  if (c.includes('profesional') || c.includes('abogad') || c.includes('contador') || c.includes('arquitect')) return 10;
  // 11. Oficios y Construcción
  if (c.includes('construc') || c.includes('técnic') || c.includes('tecnic') || c.includes('manten') || c.includes('electric') || c.includes('plomer')) return 11;
  // 12. Servicios Varios - Oficios
  if (c.includes('oficio') || c.includes('servicio') || c.includes('varios')) return 12;
  return 99;
};

// Helper de estilos e iconos para los botones de rubros
const getCategoryMeta = (cat: string) => {
  const c = (cat || '').toLowerCase().trim();

  // 1. Naranja: Gastronomía
  if (c.includes('gastronom') || c.includes('restauran') || c.includes('comida') || c.includes('café') || c.includes('cafe') || c.includes('rotiser') || c.includes('bar')) {
    return {
      icon: Utensils,
      color: 'var(--color-orange)',
      bgGradient: 'linear-gradient(135deg, #b84500 0%, var(--color-orange) 100%)',
      subtitle: 'Restaurantes, bares y delicias locales'
    };
  }
  // 2. Verde: Alojamientos
  if (c.includes('aloj') || c.includes('cabaña') || c.includes('hotel') || c.includes('dormir') || c.includes('hoster')) {
    return {
      icon: Home,
      color: 'var(--color-green)',
      bgGradient: 'linear-gradient(135deg, #2b8a00 0%, var(--color-green) 100%)',
      subtitle: 'Cabañas, hosterías y alojamientos'
    };
  }
  // 3. Verde Oscuro: Aventuras y Actividades
  if (c.includes('aventura') || c.includes('excurs') || c.includes('turism') || c.includes('activid') || c.includes('paseo')) {
    return {
      icon: Compass,
      color: 'var(--color-dark-green)',
      bgGradient: 'linear-gradient(135deg, #0e271f 0%, var(--color-dark-green) 100%)',
      subtitle: 'Paseos, excursiones y actividades'
    };
  }
  // 4. Púrpura: Comercios y Proveedurías
  if (c.includes('comercio') || c.includes('proveedur') || c.includes('tienda') || c.includes('negocio')) {
    return {
      icon: Store,
      color: 'var(--color-purple)',
      bgGradient: 'linear-gradient(135deg, #4a2d64 0%, var(--color-purple) 100%)',
      subtitle: 'Farmacia, Fiambreria, indumentaria, Mascotas, Reposteria, Supermercado...'
    };
  }
  // 5. Instituciones y Servicios Públicos
  if (c.includes('instituc') || c.includes('públic') || c.includes('public') || c.includes('munici') || c.includes('trámite')) {
    return {
      icon: Landmark,
      color: '#475569',
      bgGradient: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
      subtitle: 'Organismos públicos, municipio y entidades'
    };
  }
  // 6. Salud
  if (c.includes('salud') || c.includes('farmacia') || c.includes('médic') || c.includes('hospital')) {
    return {
      icon: HeartPulse,
      color: '#00b4d8',
      bgGradient: 'linear-gradient(135deg, #0077b6 0%, #00b4d8 100%)',
      subtitle: 'Centros médicos, guardias y farmacias'
    };
  }
  // 7. Emergencias y Urgencias
  if (c.includes('emergencia') || c.includes('bombero') || c.includes('polic') || c.includes('guardia')) {
    return {
      icon: Flame,
      color: '#e74c3c',
      bgGradient: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
      subtitle: 'Números de auxilio y urgencias'
    };
  }
  // Seguridad y Fuerzas
  if (c.includes('seguridad') || c.includes('fuerza') || c.includes('comisar')) {
    return {
      icon: ShieldCheck,
      color: '#334155',
      bgGradient: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      subtitle: 'Prefectura, Gendarmería y Policía'
    };
  }
  // Medios de Comunicación
  if (c.includes('medio') || c.includes('comunicac') || c.includes('noticia') || c.includes('radio') || c.includes('prensa')) {
    return {
      icon: Newspaper,
      color: '#e74c3c',
      bgGradient: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
      subtitle: 'Radios, portales informativos y medios locales'
    };
  }
  // Supermercados y Víveres
  if (c.includes('supermercado') || c.includes('almacén') || c.includes('almacen') || c.includes('despensa')) {
    return {
      icon: ShoppingBag,
      color: '#2a9d8f',
      bgGradient: 'linear-gradient(135deg, #21867a 0%, #2a9d8f 100%)',
      subtitle: 'Supermercados, minimercados y víveres'
    };
  }
  // Transporte y Remises
  if (c.includes('transporte') || c.includes('remis') || c.includes('taxi') || c.includes('traslado') || c.includes('colectiv')) {
    return {
      icon: Car,
      color: '#0284c7',
      bgGradient: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)',
      subtitle: 'Remises, traslados y transportes'
    };
  }
  // Servicios Profesionales
  if (c.includes('profesional') || c.includes('abogad') || c.includes('contador') || c.includes('arquitect')) {
    return {
      icon: Briefcase,
      color: '#6366f1',
      bgGradient: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
      subtitle: 'Servicios profesionales y asesoramiento'
    };
  }
  // Oficios y Mantenimiento
  if (c.includes('construc') || c.includes('técnic') || c.includes('tecnic') || c.includes('manten') || c.includes('electric') || c.includes('plomer')) {
    return {
      icon: Wrench,
      color: '#d97706',
      bgGradient: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
      subtitle: 'Oficios, reparaciones y mantenimiento'
    };
  }
  // Regalería y Regionales
  if (c.includes('regaler') || c.includes('artesan') || c.includes('souvenir') || c.includes('regional')) {
    return {
      icon: Gift,
      color: '#f4a261',
      bgGradient: 'linear-gradient(135deg, #e76f51 0%, #f4a261 100%)',
      subtitle: 'Regalos, artesanías y regionales'
    };
  }
  // Indumentaria
  if (c.includes('indumentaria') || c.includes('ropa') || c.includes('calzad')) {
    return {
      icon: Shirt,
      color: '#9c27b0',
      bgGradient: 'linear-gradient(135deg, #7b1fa2 0%, #9c27b0 100%)',
      subtitle: 'Moda, indumentaria y calzado'
    };
  }
  // Mascotas y Plantas
  if (c.includes('mascota') || c.includes('vivero') || c.includes('jardin') || c.includes('veterinar')) {
    return {
      icon: PawPrint,
      color: '#16a34a',
      bgGradient: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
      subtitle: 'Veterinarias, forrajerías y plantas'
    };
  }
  // Servicios Varios - Oficios
  if (c.includes('oficio') || c.includes('servicio') || c.includes('varios')) {
    return {
      icon: Wrench,
      color: '#0984e3',
      bgGradient: 'linear-gradient(135deg, #0369a1 0%, #0984e3 100%)',
      subtitle: 'Oficios, reparaciones y servicios generales'
    };
  }

  return {
    icon: Store,
    color: 'var(--color-purple)',
    bgGradient: 'linear-gradient(135deg, #4a2d64 0%, var(--color-purple) 100%)',
    subtitle: 'Farmacia, Fiambreria, indumentaria, Mascotas, Reposteria, Supermercado...'
  };
};

export default function GuiaClient({ initialServices }: { initialServices?: any[] }) {
  const router = useRouter();
  const [services, setServices] = useState<any[]>(initialServices || []);
  const [loading, setLoading] = useState(!initialServices);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

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
    if (!sub) return 5;
    
    const plan = (sub.planType || '').toLowerCase();
    
    // 1. Banner Portada / Portada Principal
    if (sub.hasBannerPortada || plan.includes('portada_principal') || plan.includes('banner_portada') || plan.includes('portada')) {
      return 1;
    }
    // 2. Otros Banners (Top, Middle, Bottom)
    if (sub.hasBannerTop || sub.hasBannerMiddle || sub.hasBannerBottom || 
        plan.includes('banner_top') || plan.includes('banner_middle') || plan.includes('banner_bottom') || plan.includes('banner')) {
      return 2;
    }
    // 3. Comercio Completo
    if (plan.includes('comercio_completo') || plan.includes('plan_comercio_completo')) {
      return 3;
    }
    // 4. Básico Destacado / Destacado / Cualquier plan activo
    if (plan.includes('basico_destacado') || plan.includes('plan_basico_destacado') || plan.includes('destacado') || plan.trim().length > 0) {
      return 4;
    }
    return 5;
  };

  const sortServices = (a: any, b: any) => {
    const priorityA = getPriority(a);
    const priorityB = getPriority(b);
    // 1. Mostrar comercios con planes más altos primero (1, 2, 3, 4 antes de 5)
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    // 2. Si tienen el mismo nivel de plan (o ambos son gratuitos prioridad 5), ordenar por abecedario
    return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
  };

  // Agrupamiento de todos los comercios y servicios por rubro
  const { groupedCategories, categoryNames } = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    // Filtrar servicios si hay búsqueda
    const filtered = query
      ? services.filter(s => 
          s.name.toLowerCase().includes(query) ||
          (s.category && s.category.toLowerCase().includes(query)) ||
          (s.subcategory && s.subcategory.toLowerCase().includes(query)) ||
          (s.address && s.address.toLowerCase().includes(query))
        )
      : services;

    const grouped: { [key: string]: any[] } = {};

    filtered.forEach((service: any) => {
      const cat = service.category?.trim() || 'Otros';
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push(service);
    });

    // Ordenar comercios dentro de cada rubro según prioridad del plan y nombre
    Object.keys(grouped).forEach((cat) => {
      grouped[cat].sort(sortServices);
    });

    // Ordenar categorías según el orden y colores de la pantalla de inicio
    const sortedCatNames = Object.keys(grouped).sort((a, b) => {
      const rankA = getCategoryRank(a);
      const rankB = getCategoryRank(b);
      if (rankA !== rankB) {
        return rankA - rankB;
      }
      return a.localeCompare(b, 'es', { sensitivity: 'base' });
    });

    return {
      groupedCategories: grouped,
      categoryNames: sortedCatNames
    };
  }, [services, searchQuery]);

  // Si hay una búsqueda activa y coincide una sola categoría, abrirla automáticamente
  useEffect(() => {
    if (searchQuery.trim().length > 0 && categoryNames.length === 1) {
      setOpenCategory(categoryNames[0]);
    }
  }, [searchQuery, categoryNames]);

  const toggleCategory = (catName: string) => {
    setOpenCategory(prev => {
      const isOpening = prev !== catName;
      if (isOpening) {
        // Esperamos a que el DOM procese el cierre de la categoría anterior para medir la posición exacta
        setTimeout(() => {
          const el = document.getElementById(catName.replace(/ /g, '-').toLowerCase());
          if (el) {
            const header = document.querySelector('.site-header');
            const headerHeight = header ? header.getBoundingClientRect().height : 130;
            const targetY = el.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
            window.scrollTo({
              top: Math.max(0, targetY),
              behavior: 'smooth'
            });
          }
        }, 60);
        return catName;
      }
      return null;
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
        <Loader2 className="animate-spin" size={48} color="var(--color-purple)" />
        <p style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Cargando Guía Local...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '50px' }}>
      
      {/* Banner Principal Responsivo */}
      <div className="responsive-banner">
        <div className="banner-header">
          <div className="banner-title">
            <span style={{ color: 'var(--color-green)' }}>Aluminé</span>
            <span style={{ color: 'var(--color-orange)' }}>GO</span>
            <span style={{ color: 'white', margin: '0 8px' }}>-</span>
            <span style={{ color: 'white' }}>GUÍA LOCAL</span>
          </div>
          <div className="banner-subtitle">SERVICIOS PÚBLICOS, PROFESIONALES Y COMERCIOS</div>
        </div>
        <div className="banner-categories">
          {[
            { cat: "Salud", color: "#00b4d8", bgImage: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80" },
            { cat: "Emergencias", color: "#e74c3c", bgImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80" },
            { cat: "Instituciones", color: "#475569", bgImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80" },
            { cat: "Medios", color: "#e74c3c", bgImage: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80" },
            { cat: "Transporte", color: "#0284c7", bgImage: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80" },
            { cat: "Oficios", color: "#d97706", bgImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80" }
          ].map((item) => (
            <button 
              key={item.cat} 
              type="button"
              className="banner-item" 
              style={{ backgroundImage: `url(${item.bgImage})`, width: '100%', border: 'none', cursor: 'pointer' }}
              onClick={() => {
                const found = categoryNames.find(c => c.toLowerCase().includes(item.cat.toLowerCase()));
                if (found) {
                  toggleCategory(found);
                }
              }}
            >
              <div className="banner-overlay" style={{ borderBottom: `4px solid ${item.color}` }}></div>
              <span className="banner-text">
                {item.cat.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* BANNER SUPERIOR DE LA GUÍA */}
      <div style={{ marginBottom: '28px' }}>
        <PublicityBanner page="GuiaLocal" section={1} height="140px" delay="0s" />
      </div>

      {/* Buscador de Comercios / Rubros */}
      <div style={{
        position: 'relative',
        maxWidth: '650px',
        margin: '0 auto 28px auto',
        display: 'flex',
        alignItems: 'center',
        background: 'white',
        borderRadius: '50px',
        border: '1.5px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        padding: '2px 8px 2px 20px',
        transition: 'all 0.3s ease',
      }}>
        <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', marginRight: '10px' }}>
          <Search size={20} />
        </span>
        <input 
          type="text" 
          placeholder="Buscar rubro, servicio o comercio..." 
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
              fontWeight: 700
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* LISTA VERTICAL DE RUBROS (1 POR FILA - ESTILO MENÚ PRINCIPAL) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px', margin: '0 auto' }}>
        {categoryNames.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '16px', border: '1px dashed var(--color-border)' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', margin: 0 }}>
              No se encontraron comercios ni rubros para &quot;<strong>{searchQuery}</strong>&quot;
            </p>
          </div>
        ) : (
          categoryNames.map((catName) => {
            const items = groupedCategories[catName] || [];
            const count = items.length;
            const meta = getCategoryMeta(catName);
            const IconComponent = meta.icon;
            const isOpen = openCategory === catName;

            return (
              <div 
                key={catName} 
                id={catName.replace(/ /g, '-').toLowerCase()}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  borderRadius: '16px', 
                  overflow: 'hidden',
                  boxShadow: isOpen ? '0 8px 24px rgba(0,0,0,0.12)' : '0 4px 14px rgba(0,0,0,0.06)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: isOpen ? `2px solid ${meta.color}` : '1px solid rgba(0,0,0,0.06)',
                  scrollMarginTop: '140px'
                }}
              >
                {/* BOTÓN FILA DE RUBRO */}
                <button
                  type="button"
                  onClick={() => toggleCategory(catName)}
                  style={{
                    background: meta.bgGradient,
                    padding: '16px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: 'white',
                    width: '100%',
                    textAlign: 'left',
                    cursor: 'pointer',
                    userSelect: 'none',
                    gap: '12px',
                    transition: 'opacity 0.2s, transform 0.15s',
                    boxSizing: 'border-box'
                  }}
                  aria-expanded={isOpen}
                >
                  {/* Contenedor Izquierdo: Icono + Textos + Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    {/* Icono del Rubro con contenedor redondeado */}
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      backdropFilter: 'blur(4px)',
                      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.3)'
                    }}>
                      <IconComponent size={24} color="white" strokeWidth={2} />
                    </div>

                    {/* Título del Rubro, Badge y Subtítulo en Horizontal */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ 
                          fontSize: '1.1rem', 
                          fontWeight: 800, 
                          fontFamily: 'var(--font-oswald), sans-serif', 
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                          lineHeight: 1.2,
                          color: 'white',
                          textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                          whiteSpace: 'normal',
                          wordBreak: 'normal',
                          overflowWrap: 'break-word'
                        }}>
                          {catName}
                        </span>

                        <span style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.25)',
                          backdropFilter: 'blur(4px)',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          whiteSpace: 'nowrap',
                          border: '1px solid rgba(255,255,255,0.35)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          display: 'inline-flex',
                          alignItems: 'center'
                        }}>
                          {count} {count === 1 ? 'comercio' : 'comercios'}
                        </span>
                      </div>

                      <div style={{ 
                        fontSize: '0.82rem', 
                        opacity: 0.92, 
                        lineHeight: 1.25, 
                        textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                        whiteSpace: 'normal',
                        wordBreak: 'normal',
                        overflowWrap: 'break-word'
                      }}>
                        {meta.subtitle}
                      </div>
                    </div>
                  </div>

                  {/* Flecha Desplegable a la derecha */}
                  <div style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    flexShrink: 0
                  }}>
                    <ChevronDown size={20} color="white" strokeWidth={2.5} />
                  </div>
                </button>

                {/* CONTENIDO DESPLEGABLE: COMERCIOS DEL RUBRO */}
                {isOpen && (
                  <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '16px 12px',
                    borderTop: '1px solid rgba(0,0,0,0.06)',
                    animation: 'fadeInSlide 0.25s ease-out',
                    boxSizing: 'border-box'
                  }}>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 270px), 1fr))', 
                      gap: '16px',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}>
                      {items.map((item: any) => {
                        const priority = getPriority(item);
                        const isPremium = priority <= 3;
                        const isBasicoDestacado = priority === 4;
                        const whatsappMsg = `Hola, me contacto desde AluminéGO. Quisiera hacerles una consulta...`;
                        const targetUrl = item.targetUrl || `/guia/${item.id}`;

                        // Parsear los hasta 5 artículos/productos destacados
                        let itemProducts: { name: string; price?: string | number }[] = [];
                        if (item.details) {
                          try {
                            if (item.details.trim().startsWith('[')) {
                              const parsed = JSON.parse(item.details);
                              itemProducts = parsed.map((p: any) => {
                                if (typeof p === 'string') return { name: p };
                                return { name: p.name, price: p.price };
                              }).filter((p: any) => p && p.name);
                            } else {
                              itemProducts = item.details.split(',').map((s: string) => ({ name: s.trim() })).filter((p: any) => p.name);
                            }
                          } catch {
                            itemProducts = item.details.split(',').map((s: string) => ({ name: s.trim() })).filter((p: any) => p.name);
                          }
                        }

                        // 1. COMERCIOS COMPLETOS / PREMIUM / BANNERS (PRIORIDAD 1, 2, 3)
                        if (isPremium) {
                          const badgeLabel = priority === 1 ? '⭐ PORTADA PRINCIPAL' : priority === 2 ? '✨ DESTACADO BANNER' : '🌟 COMERCIO COMPLETO';
                          const firstImage = item.image ? item.image.split(',')[0].trim() : null;
                          return (
                            <div 
                              key={item.id} 
                              onClick={() => { router.push(targetUrl); }}
                              style={{ 
                                backgroundColor: 'white', 
                                borderRadius: 'var(--radius-md)', 
                                overflow: 'hidden',
                                boxShadow: '0 4px 16px rgba(211, 84, 0, 0.16)', 
                                border: '2.5px solid var(--color-orange)', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                cursor: 'pointer', 
                                transition: 'all 0.2s ease', 
                                position: 'relative',
                                width: '100%',
                                boxSizing: 'border-box'
                              }}
                              className="card-hover-effect"
                            >
                              {/* Header con Imagen de Portada o Botón de Favorito */}
                              {firstImage ? (
                                <div style={{ position: 'relative', width: '100%', height: '150px', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                                  <img 
                                    src={firstImage} 
                                    alt={item.name} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                  />
                                  <FavoriteButton item={{
                                    id: item.id,
                                    title: item.name,
                                    image: firstImage,
                                    type: item.category || 'Guía Local',
                                    url: targetUrl
                                  }} />
                                </div>
                              ) : (
                                <FavoriteButton item={{
                                  id: item.id,
                                  title: item.name,
                                  image: '',
                                  type: item.category || 'Guía Local',
                                  url: targetUrl
                                }} />
                              )}

                              {/* Contenido de la Tarjeta */}
                              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, boxSizing: 'border-box' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: firstImage ? '0px' : '36px' }}>
                                  <h3 style={{ fontSize: '1.18rem', fontWeight: 900, fontFamily: 'var(--font-oswald), sans-serif', letterSpacing: '0.4px', color: '#111827', margin: 0, lineHeight: 1.2, textTransform: 'uppercase' }}>
                                    {item.name}
                                  </h3>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                                    {item.subcategory && (
                                      <span style={{ fontSize: '0.75rem', color: '#0369a1', backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                                        {item.subcategory}
                                      </span>
                                    )}
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-orange)', backgroundColor: '#fff7ed', border: '1px solid #ffedd5', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                                      {badgeLabel}
                                    </span>
                                  </div>
                                </div>

                                {/* Descripción */}
                                {item.description && (
                                  <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {item.description}
                                  </p>
                                )}

                                {/* Artículos / Productos destacados */}
                                {itemProducts.length > 0 && (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                    {itemProducts.slice(0, 5).map((prod, idx) => (
                                      <span key={idx} style={{ fontSize: '0.75rem', fontWeight: 600, background: '#f8fafc', color: '#1e293b', padding: '3px 8px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        🛍️ {prod.name}
                                        {prod.price && !isNaN(parseFloat(String(prod.price))) && (
                                          <b style={{ color: '#16a34a' }}>(${new Intl.NumberFormat('es-AR').format(parseFloat(String(prod.price)))})</b>
                                        )}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Estado de Horarios y Delivery */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginTop: 'auto' }}>
                                  <OpeningStatusBadge openingHours={item.openingHours} isVisible={item.showSchedule} />
                                  {item.hasDelivery ? (
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '6px' }}>
                                      🛵 Delivery
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#991b1b', background: '#fef2f2', border: '1px solid #fecaca', padding: '2px 8px', borderRadius: '6px' }}>
                                      🚫 Sin Delivery
                                    </span>
                                  )}
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                                  {item.address && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                      <MapPin size={14} color="#64748b" style={{ flexShrink: 0 }} />
                                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.address}</span>
                                    </div>
                                  )}
                                  
                                  {item.whatsapp && (
                                    <a 
                                      href={`https://wa.me/${item.whatsapp}?text=${encodeURIComponent(whatsappMsg)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#25D366', color: 'white', padding: '9px 12px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 800, textDecoration: 'none', marginTop: '2px', boxShadow: '0 2px 4px rgba(37,211,102,0.2)' }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        fetch('/api/track-event', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ entityId: item.id, type: 'WHATSAPP_CLICK' })
                                        });
                                      }}
                                    >
                                      <Phone size={15} />
                                      Contactar por WhatsApp
                                    </a>
                                  )}

                                  <Link 
                                    href={targetUrl}
                                    style={{ fontSize: '0.82rem', color: 'var(--color-orange)', fontWeight: 800, textDecoration: 'underline', textAlign: 'center', marginTop: '2px' }}
                                  >
                                    Ver ficha completa y ubicación
                                  </Link>
                                </div>
                                <VerifiedBadge isVerified={item.isVerified} style={{ bottom: '8px', right: '8px' }} />
                              </div>
                            </div>
                          );
                        }

                        // 2. COMERCIOS PLAN BÁSICO DESTACADO (PRIORIDAD 4)
                        if (isBasicoDestacado) {
                          const firstImage = item.image ? item.image.split(',')[0].trim() : null;
                          return (
                            <div 
                              key={item.id} 
                              onClick={() => { router.push(targetUrl); }}
                              style={{ 
                                backgroundColor: 'white', 
                                borderRadius: 'var(--radius-md)', 
                                overflow: 'hidden',
                                boxShadow: '0 4px 14px rgba(56, 176, 0, 0.15)', 
                                border: '2.5px solid var(--color-green)', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                cursor: 'pointer', 
                                transition: 'all 0.2s ease', 
                                position: 'relative',
                                width: '100%',
                                boxSizing: 'border-box'
                              }}
                              className="card-hover-effect"
                            >
                              {firstImage ? (
                                <div style={{ position: 'relative', width: '100%', height: '140px', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                                  <img 
                                    src={firstImage} 
                                    alt={item.name} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                  />
                                  <FavoriteButton item={{
                                    id: item.id,
                                    title: item.name,
                                    image: firstImage,
                                    type: item.category || 'Guía Local',
                                    url: targetUrl
                                  }} />
                                </div>
                              ) : (
                                <FavoriteButton item={{
                                  id: item.id,
                                  title: item.name,
                                  image: '',
                                  type: item.category || 'Guía Local',
                                  url: targetUrl
                                }} />
                              )}
                              
                              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, boxSizing: 'border-box' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: firstImage ? '0px' : '36px' }}>
                                  <h3 style={{ fontSize: '1.12rem', fontWeight: 900, fontFamily: 'var(--font-oswald), sans-serif', letterSpacing: '0.4px', color: '#111827', margin: 0, lineHeight: 1.2, textTransform: 'uppercase' }}>
                                    {item.name}
                                  </h3>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                                    {item.subcategory && (
                                      <span style={{ fontSize: '0.75rem', color: '#0369a1', backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                                        {item.subcategory}
                                      </span>
                                    )}
                                    <span style={{ fontSize: '0.75rem', color: '#16a34a', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                                      ⭐ DESTACADO
                                    </span>
                                  </div>
                                </div>

                                {/* Descripción */}
                                {item.description && (
                                  <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {item.description}
                                  </p>
                                )}

                                {/* Artículos / Productos destacados */}
                                {itemProducts.length > 0 && (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                    {itemProducts.slice(0, 5).map((prod, idx) => (
                                      <span key={idx} style={{ fontSize: '0.75rem', fontWeight: 600, background: '#f8fafc', color: '#1e293b', padding: '3px 8px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        🛍️ {prod.name}
                                        {prod.price && !isNaN(parseFloat(String(prod.price))) && (
                                          <b style={{ color: '#16a34a' }}>(${new Intl.NumberFormat('es-AR').format(parseFloat(String(prod.price)))})</b>
                                        )}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginTop: 'auto' }}>
                                  <OpeningStatusBadge openingHours={item.openingHours} isVisible={item.showSchedule} />
                                  {item.hasDelivery ? (
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '6px' }}>
                                      🛵 Delivery
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#991b1b', background: '#fef2f2', border: '1px solid #fecaca', padding: '2px 8px', borderRadius: '6px' }}>
                                      🚫 Sin Delivery
                                    </span>
                                  )}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                                  {item.address && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                      <MapPin size={14} color="#64748b" style={{ flexShrink: 0 }} />
                                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.address}</span>
                                    </div>
                                  )}
                                  {item.whatsapp && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-green)', fontSize: '0.9rem', fontWeight: 800, marginTop: '4px' }}>
                                      <Phone size={14} style={{ flexShrink: 0 }} />
                                      <a 
                                        href={`https://wa.me/${item.whatsapp}?text=${encodeURIComponent(whatsappMsg)}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        style={{ color: 'inherit', textDecoration: 'none', backgroundColor: '#f0fdf4', padding: '4px 10px', borderRadius: '6px', border: '1px solid #bbf7d0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          fetch('/api/track-event', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ entityId: item.id, type: 'WHATSAPP_CLICK' })
                                          });
                                        }}
                                      >
                                        WhatsApp: {item.whatsapp}
                                      </a>
                                    </div>
                                  )}
                                  <Link 
                                    href={targetUrl}
                                    style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 800, textDecoration: 'underline', textAlign: 'center', marginTop: '2px' }}
                                  >
                                    Ver ficha completa y ubicación
                                  </Link>
                                </div>
                                <VerifiedBadge isVerified={item.isVerified} style={{ bottom: '8px', right: '8px' }} />
                              </div>
                            </div>
                          );
                        }

                        // 3. COMERCIOS / SERVICIOS BÁSICOS (GRATUITOS - PRIORIDAD 5)
                        return (
                          <div 
                            key={item.id} 
                            onClick={() => { router.push(targetUrl); }}
                            style={{ 
                              backgroundColor: 'white', 
                              borderRadius: 'var(--radius-md)', 
                              padding: '16px', 
                              boxShadow: '0 1px 3px rgba(0,0,0,0.04)', 
                              border: '1px solid var(--color-border)', 
                              display: 'flex', 
                              flexDirection: 'column', 
                              gap: '10px', 
                              position: 'relative',
                              cursor: 'pointer'
                            }}
                            className="card-hover-effect"
                          >
                            <div>
                              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-main)', margin: 0, lineHeight: 1.2 }}>
                                {item.name}
                              </h3>
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                                {item.subcategory || item.category}
                              </span>
                            </div>

                            {item.description && (
                              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {item.description}
                              </p>
                            )}

                            {itemProducts.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {itemProducts.slice(0, 5).map((prod, idx: number) => (
                                  <span key={idx} style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                    🛍️ {prod.name}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                              <OpeningStatusBadge openingHours={item.openingHours} isVisible={item.showSchedule} />
                              {item.hasDelivery ? (
                                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#065f46', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px' }}>
                                  🛵 Delivery
                                </span>
                              ) : null}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                              {item.address && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
                                  <MapPin size={13} color="#64748b" />
                                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.address}</span>
                                </div>
                              )}
                              {item.phone && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
                                  <PhoneCall size={13} color="#64748b" />
                                  <span>{item.phone}</span>
                                </div>
                              )}
                            </div>
                            <VerifiedBadge isVerified={item.isVerified} style={{ bottom: '6px', right: '6px' }} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* BANNER INFERIOR DE LA GUÍA */}
      <div style={{ marginTop: '40px' }}>
        <PublicityBanner page="GuiaLocal" section={2} height="120px" delay="1s" />
      </div>

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }

        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .card-hover-effect:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 20px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </div>
  );
}
