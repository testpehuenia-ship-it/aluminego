'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Bike, BedDouble, MountainSnow, ShoppingBag, 
  Rocket, Home, Compass, Store, 
  Clock, ShieldCheck, Heart, HeartHandshake,
  ChevronRight, ChevronLeft, ChevronDown, HelpCircle, Wind, Droplets,
  Sun, CloudSun, Cloud, CloudRain, CloudSnow, CloudLightning,
  PhoneCall, Newspaper, Map, Share2
} from 'lucide-react';
import PublicityBanner from '@/components/PublicityBanner';
import RadioPlayer from '@/components/RadioPlayer';
import type { WeatherData } from '@/lib/services/weather';

const getWeatherMeta = (code: number, isDay: boolean = true) => {
  if (code === 0) return { icon: Sun, text: 'Despejado', bg: '#3b82f6' };
  if ([1, 2, 3].includes(code)) return { icon: CloudSun, text: 'Nubosidad', bg: '#60a5fa' };
  if ([45, 48].includes(code)) return { icon: Cloud, text: 'Niebla', bg: '#9ca3af' };
  if ([51, 53, 55, 56, 57].includes(code)) return { icon: CloudRain, text: 'Llovizna', bg: '#64748b' };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { icon: CloudRain, text: 'Lluvia', bg: '#334155' };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { icon: CloudSnow, text: 'Nieve', bg: '#e2e8f0' };
  if ([95, 96, 99].includes(code)) return { icon: CloudLightning, text: 'Tormenta', bg: '#1e293b' };
  return { icon: Cloud, text: 'Desconocido', bg: '#cbd5e1' };
};

const BACKGROUND_IMAGES = [
  "/images/bg_slider_1.jpg",
  "/images/bg_slider_2.jpg",
  "/images/bg_slider_3.jpg",
  "/images/bg_slider_4.jpg",
];

const FAQ_ITEMS = [
  {
    q: "¿Cómo llegar a Aluminé, Neuquén?",
    a: "Se accede desde Zapala por la RP 13 empalmando con la RP 23, o por la RN 40 empalmando con la RP 23 o RP 46 por la Cuesta del Rahue. Te recomendamos consultar siempre el estado de rutas en tiempo real en nuestra sección de Mapas antes de viajar."
  },
  {
    q: "¿Dónde alojarse en Aluminé?",
    a: "Contamos con una amplia selección de cabañas a la vera del río, hosterías, hoteles y campings habilitados con contacto directo por WhatsApp y reserva sin comisiones intermediarias."
  },
  {
    q: "¿Qué actividades y excursiones hacer en Aluminé?",
    a: "Rafting y kayak en el Río Aluminé (de renombre internacional), pesca deportiva con mosca, senderismo en Lago Ruca Choroy y Quillén, visitas a comunidades mapuches y cabalgatas cordilleranas."
  },
  {
    q: "¿Dónde consultar el estado de rutas y accesos?",
    a: "En nuestro Mapa Interactivo dispones del parte oficial de transitabilidad de las Rutas 13, 23 y 46 proporcionado en tiempo real por la Dirección Provincial de Vialidad de Neuquén."
  },
  {
    q: "¿Cómo pedir delivery y ver menús gastronómicos en Aluminé?",
    a: "En la sección 'Qué Comer' puedes explorar la carta de pizzerías, cervecerías, restaurantes y rotiserías de Aluminé, armar tu pedido online y enviarlo directamente por WhatsApp al comercio."
  }
];

export default function HomeClient({ initialCategories, weatherData }: { initialCategories?: any[], weatherData?: WeatherData | null }) {
  const [bgIndex, setBgIndex] = useState(0);
  const [categories, setCategories] = useState<any[]>(initialCategories || []);
  const [loading, setLoading] = useState(!initialCategories);
  const [time, setTime] = useState(new Date());
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(prev => (prev === index ? null : index));
  };

  const handleShare = async () => {
    const shareData = {
      title: 'AluminéGO',
      text: 'Mirá AluminéGO, la guía digital y comercial de Aluminé, Neuquén.',
      url: 'https://www.aluminego.ar',
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error compartiendo:', err);
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert('¡Enlace copiado al portapapeles!');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (e) {
      console.error('Error fetching categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialCategories || initialCategories.length === 0) {
      fetchCategories();
    }
    
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 5000);

    const clockInterval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(clockInterval);
    };
  }, []);

  const currentMeta = weatherData ? getWeatherMeta(weatherData.current.weatherCode, weatherData.current.isDay) : null;

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
      
      {/* 1. HERO SECTION WITH SLIDER */}
      <section style={{ 
        position: 'relative', 
        padding: '60px 20px 40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        overflow: 'hidden',
        minHeight: '450px'
      }}>
        {BACKGROUND_IMAGES.map((src, index) => (
          <div 
            key={src}
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundImage: `url(${src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: index === bgIndex ? 1 : 0,
              transition: 'opacity 1.5s ease-in-out',
              zIndex: 0
            }}
          />
        ))}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)', zIndex: 1 }} />

        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '600px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.95)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px', textShadow: '1px 2px 6px rgba(0,0,0,0.8)', display: 'inline-block', backgroundColor: 'rgba(0,0,0,0.35)', padding: '4px 14px', borderRadius: '20px', backdropFilter: 'blur(4px)' }}>
            Aluminé, Neuquén • Guía Oficial
          </div>
          <div style={{ marginBottom: '0px' }}>
            <h1 style={{ fontFamily: 'var(--font-oswald), sans-serif', fontSize: '4.5rem', fontWeight: 700, lineHeight: 0.9, marginBottom: '0px', textTransform: 'uppercase', letterSpacing: '1px', textShadow: '2px 4px 10px rgba(0,0,0,0.5)' }} aria-label="Aluminé: Guía Turística, Alojamientos, Rafting y Servicios">
              <span className="swap-green">TO</span><span className="swap-orange">DO</span>{' '}
              <span style={{ color: 'white' }}>ALUM</span><span className="swap-green">I</span><span className="swap-orange">NÉ</span>
            </h1>
          </div>
          <h2 style={{ fontFamily: 'var(--font-caveat), cursive', fontSize: '3.5rem', color: '#f1c40f', lineHeight: 0.8, marginBottom: '24px', transform: 'rotate(-2deg)', textShadow: '1px 2px 4px rgba(0,0,0,0.5)' }}>
            en un solo lugar
          </h2>
          
          <p style={{ color: 'white', fontSize: '1.1rem', fontWeight: 500, marginBottom: '20px', textShadow: '1px 1px 4px rgba(0,0,0,0.8)', padding: '0 10px' }}>
            Comé rico, alojate cómodo,<br/>viví aventuras en el río y pedí sin<br/>moverte de tu cabaña.
          </p>

          <button
            onClick={handleShare}
            style={{
              backgroundColor: 'transparent',
              border: '2px solid var(--color-green)',
              color: 'white',
              borderRadius: '24px',
              padding: '8px 24px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              marginBottom: '32px',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
              gap: '8px',
              textShadow: '1px 1px 3px rgba(0,0,0,0.8)'
            }}
          >
            <Share2 size={18} color="var(--color-green)" strokeWidth={2.5} />
            COMPARTIR APP
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '20px' }}>
            {[
              { icon: Bike, text: "DELIVERY\nRÁPIDO" },
              { icon: BedDouble, text: "ALOJAMIENTOS\nPARA TODOS" },
              { icon: MountainSnow, text: "AVENTURAS\nY ACTIVIDADES" },
              { icon: ShoppingBag, text: "COMERCIOS\nLOCALES" }
            ].map((item, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: idx < 3 ? '1px solid rgba(255,255,255,0.3)' : 'none' }}>
                <item.icon color="white" size={28} style={{ marginBottom: '8px' }} />
                <span style={{ color: 'white', fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'pre-line', lineHeight: 1.2 }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. MAIN ACTION BUTTONS */}
      <section style={{ padding: '24px 20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px', margin: '0 auto', marginTop: '-30px', position: 'relative', zIndex: 10 }}>
        {[
          { title: "PEDÍ COMIDA AHORA", sub: "Delivery a tu cabaña", icon: Rocket, color: "var(--color-orange)", link: "/comer" },
          { title: "ENCONTRÁ TU ALOJAMIENTO", sub: "Las mejores opciones", icon: Home, color: "var(--color-green)", link: "/alojarse" },
          { title: "VER AVENTURAS Y RAFTING", sub: "Reservá tu experiencia", icon: Compass, color: "var(--color-dark-green)", link: "/aventuras" },
          { title: "VER COMERCIOS", sub: "Tiendas y mercados locales", icon: ShoppingBag, color: "var(--color-purple)", link: "/comercios" },
          { title: "GUÍA LOCAL y SERVICIOS", sub: "Salud, transporte, emergencias", icon: PhoneCall, color: "var(--color-celeste)", link: "/guia" },
          { title: "NOTICIAS Y NOVEDADES", sub: "Eventos, guías y turismo", icon: Newspaper, color: "#e74c3c", link: "/novedades" },
          { title: "MIS FAVORITOS", sub: "Tus lugares preferidos guardados", icon: Heart, color: "#e84393", link: "/favoritos" },
          { title: "MAPAS Y ESTADO DE RUTAS", sub: "Ubicaciones, clima y transitabilidad", icon: Map, color: "#0984e3", link: "/mapa" },
        ].map((btn, idx) => (
          <Link href={btn.link} key={idx} style={{ backgroundColor: btn.color, borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', color: 'white', textDecoration: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', transition: 'transform 0.2s' }}>
            <div style={{ marginRight: '16px' }}>
              <btn.icon size={36} color="white" strokeWidth={1.5} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-oswald), sans-serif', letterSpacing: '0.5px' }}>{btn.title}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{btn.sub}</div>
            </div>
            <ChevronRight size={24} color="white" />
          </Link>
        ))}

        {/* COMPACT NEON WEATHER WIDGET */}
        {currentMeta && weatherData && (
          <div style={{
            background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            color: 'white',
            boxShadow: `0 4px 15px rgba(0,0,0,0.3)`,
            border: `1px solid ${currentMeta.bg}40`,
          }}>
            <div style={{ marginRight: '16px', color: currentMeta.bg, filter: `drop-shadow(0 0 8px ${currentMeta.bg}80)` }}>
              <currentMeta.icon size={36} strokeWidth={1.5} />
            </div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                  {time.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-oswald), sans-serif', letterSpacing: '0.5px', lineHeight: 1.2 }}>
                  {Math.round(weatherData.current.temperature)}° • {currentMeta.text}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#9ca3af', display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                  <span style={{ color: currentMeta.bg, fontWeight: 700 }}>{time.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>•</span>
                  <span>Viento {weatherData.current.windSpeed} km/h</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RADIO PLAYER COMPONENT */}
        <RadioPlayer />

        {/* BANNER PROMO */}
        <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 25px rgba(0,0,0,0.15)', animation: 'float 6s ease-in-out infinite', marginTop: '8px' }}>
          <Image src="/images/banner_peluqueria.png" alt="Servicios en Aluminé" width={600} height={200} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
      </section>

      {/* 3. TRUST BADGES */}
      <section style={{ backgroundColor: 'white', padding: '30px 20px', marginTop: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', borderRight: '1px solid var(--color-border)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}>
              <circle cx="12" cy="12" r="10" stroke="var(--color-dark-green)"></circle>
              <polyline points="12 6 12 12 16 14" stroke="var(--color-orange)"></polyline>
            </svg>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-dark-green)', marginBottom: '4px' }}>RÁPIDO</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', whiteSpace: 'pre-line', lineHeight: 1.2 }}>{'Entrega en\nminutos'}</div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', borderRight: '1px solid var(--color-border)' }}>
            <div style={{ position: 'relative', width: 32, height: 32, marginBottom: '8px' }}>
              <svg viewBox="0 0 24 24" fill="var(--color-orange)" width="32" height="32">
                <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
              </svg>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="32" height="32" style={{ position: 'absolute', top: 0, left: 0 }}>
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-dark-green)', marginBottom: '4px' }}>SEGURO</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', whiteSpace: 'pre-line', lineHeight: 1.2 }}>{'Comercios\nverificados'}</div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', borderRight: '1px solid var(--color-border)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}>
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-dark-green)', marginBottom: '4px' }}>LOCAL</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', whiteSpace: 'pre-line', lineHeight: 1.2 }}>{'Apoyá lo\nnuestro'}</div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}>
              <g stroke="var(--color-orange)">
                <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
                <path d="M3 4h8" />
              </g>
              <g stroke="var(--color-green)">
                <path d="m11 17 2 2a1 1 0 1 0 3-3" />
                <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
                <path d="m21 3 1 11h-2" />
              </g>
            </svg>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-dark-green)', marginBottom: '4px' }}>SIEMPRE</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', whiteSpace: 'pre-line', lineHeight: 1.2 }}>{'Atención\ncercana'}</div>
          </div>
        </div>
      </section>

      {/* 3.5. PUBLICITY BANNER */}
      <div style={{ padding: '20px 20px 0', maxWidth: '600px', margin: '0 auto' }}>
        <PublicityBanner page="Inicio" section={1} height="100px" />
      </div>

      {/* 4. BOTTOM CATEGORIES SLIDER */}
      <section style={{ padding: '30px 20px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-dark-green)' }}>DESCUBRÍ ALUMINÉ</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Opciones para cada momento de tu estadía</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => document.getElementById('category-slider')?.scrollBy({ left: -200, behavior: 'smooth' })}
              style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}
            >
              <ChevronLeft size={20} color="var(--color-dark-green)" />
            </button>
            <button 
              onClick={() => document.getElementById('category-slider')?.scrollBy({ left: 200, behavior: 'smooth' })}
              style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-dark-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronRight size={20} color="white" />
            </button>
          </div>
        </div>
        
        <div 
          id="category-slider"
          style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}
        >
          {loading ? (
             [1,2,3,4].map(i => <div key={i} style={{ minWidth: '160px', height: '120px', borderRadius: '16px', backgroundColor: '#f1f5f9', animation: 'pulse 1.5s infinite' }} />)
          ) : (
            categories.map((cat, idx) => {
              const imgSrc = cat.image && cat.image.trim() !== '' ? cat.image : (
                cat.title?.toLowerCase().includes('gastronom') || cat.title?.toLowerCase().includes('restauran') 
                  ? '/images/comer_restaurante.png'
                  : cat.title?.toLowerCase().includes('hotel') || cat.title?.toLowerCase().includes('cabaña')
                  ? '/images/hotel_pehuenia.png'
                  : '/images/comer_supermercado.png'
              );

              return (
                <Link 
                  href={cat.link || '/'} 
                  key={idx} 
                  style={{ minWidth: '160px', height: '120px', borderRadius: '16px', overflow: 'hidden', position: 'relative', scrollSnapAlign: 'start', display: 'block' }}
                >
                  <Image src={imgSrc} alt={cat.title} fill style={{ objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 100%)', display: 'flex', alignItems: 'flex-end', padding: '12px' }}>
                    <span style={{ color: 'white', fontWeight: 700, fontSize: '1rem', textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>
                      {cat.title}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </section>

      {/* 5. PREGUNTAS FRECUENTES (FAQ) */}
      <section style={{ padding: '30px 20px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(39, 174, 96, 0.12)', color: 'var(--color-green)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>
            <HelpCircle size={14} /> INFORMACIÓN ÚTIL
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-dark-green)', margin: 0 }}>
            Preguntas Frecuentes de Viajeros
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Todo lo que necesitas saber para tu visita a Aluminé
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index} 
                style={{ 
                  backgroundColor: 'white', 
                  borderRadius: '16px', 
                  border: isOpen ? '1px solid var(--color-green)' : '1px solid var(--color-border)', 
                  boxShadow: isOpen ? '0 4px 14px rgba(39, 174, 96, 0.12)' : 'var(--shadow-sm)',
                  overflow: 'hidden',
                  transition: 'all 0.25s ease'
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  style={{
                    width: '100%',
                    padding: '16px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  aria-expanded={isOpen}
                >
                  <span style={{ fontSize: '0.98rem', fontWeight: 700, color: isOpen ? 'var(--color-green)' : 'var(--color-text-main)', lineHeight: 1.35 }}>
                    {item.q}
                  </span>
                  <div style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s ease',
                    color: isOpen ? 'var(--color-green)' : 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <ChevronDown size={20} />
                  </div>
                </button>
                {isOpen && (
                  <div style={{ padding: '0 18px 16px', color: 'var(--color-text-muted)', fontSize: '0.92rem', lineHeight: 1.6, borderTop: '1px dashed #e2e8f0', paddingTop: '12px' }}>
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <PublicityBanner page="Inicio" section={2} />
      <style jsx global>{`
        @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
        @keyframes float { 
          0% { transform: translateY(0px); } 
          50% { transform: translateY(-8px); } 
          100% { transform: translateY(0px); } 
        }
      `}</style>
    </div>
  );
}
