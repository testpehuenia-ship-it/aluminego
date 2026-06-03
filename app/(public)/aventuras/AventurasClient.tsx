'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import PublicityBanner from '@/components/PublicityBanner';
import { Loader2 } from 'lucide-react';

export default function AventurasClient({ initialAdventures }: { initialAdventures?: any[] }) {
  const [selectedAventura, setSelectedAventura] = useState<any | null>(null);
  const [adventures, setAdventures] = useState<any[]>(initialAdventures || []);
  const [loading, setLoading] = useState(!initialAdventures);

  const categories = ["Trekking", "A. Acuaticas", "Cabalgatas", "Nieve", "Pesca", "Agencia de turismo"];

  const fetchData = async () => {
    try {
      const res = await fetch('/api/adventures');
      const data = await res.json();
      setAdventures(data);
    } catch (e) {
      console.error('Error fetching adventures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialAdventures || initialAdventures.length === 0) {
      fetchData();
    }
  }, [initialAdventures]);

  const buildWhatsAppUrl = (aventura: any) => {
    const message = `*Hola ${aventura.name}!* \nTe contacto desde AlumineGo.\nQuisiera consultar más información y reservar la siguiente actividad: *${aventura.category}*.\n\n¡Muchas gracias!`;
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
        <div className="banner-categories">
          {[
            { cat: "Trekking", color: "#2a9d8f", bgImage: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80" },
            { cat: "A. Acuaticas", color: "#00b4d8", bgImage: "/images/aventura_rafting.png" },
            { cat: "Cabalgatas", color: "#f4a261", bgImage: "/images/aventura_cabalgatas.png" },
            { cat: "Nieve", color: "#e9c46a", bgImage: "https://images.unsplash.com/photo-1605540436563-5bca919ae766?auto=format&fit=crop&w=800&q=80" },
            { cat: "Pesca", color: "#e76f51", bgImage: "/images/aventura_pesca.png" },
            { cat: "Agencia de turismo", color: "#264653", bgImage: "/images/aventura_agencia.png" }
          ].map((item) => (
            <a 
              href={`#${item.cat.replace(/ /g, '-').toLowerCase()}`} 
              key={item.cat} 
              className="banner-item" 
              style={{ backgroundImage: `url(${item.bgImage})` }}
            >
              <div className="banner-overlay" style={{ borderBottom: `4px solid ${item.color}` }}></div>
              <span className="banner-text" style={{ fontSize: item.cat === "Agencia de turismo" ? "0.9rem" : "inherit" }}>
                {item.cat.toUpperCase()}
              </span>
            </a>
          ))}
        </div>
      </div>
      
      <PublicityBanner height="100px" />

      <h1 className="section-title">¿Qué aventura elegimos hoy?</h1>

      {categories.map((category, index) => {
        const filtered = adventures.filter(a => a.category === category);
        
        return (
          <React.Fragment key={category}>
            <section id={category.replace(/ /g, '-').toLowerCase()} style={{ marginBottom: '60px' }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                borderLeft: '5px solid var(--color-orange)', 
                paddingLeft: '12px',
                marginBottom: '24px',
                color: 'var(--color-text-main)'
              }}>
                {category}
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '24px'
              }}>
                {filtered.map(aventura => (
                  <button key={aventura.id} style={{
                    backgroundColor: 'white',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'var(--transition)',
                    cursor: 'pointer',
                    display: 'block',
                    width: '100%',
                    textAlign: 'left'
                  }}
                  onClick={() => setSelectedAventura(aventura)}
                  className="commerce-card"
                  >
                    <div style={{ position: 'relative', height: '200px' }}>
                      <Image src={aventura.image} alt={aventura.name} fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '16px' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>{aventura.name}</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
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
                ))}
                {filtered.length === 0 && (
                  <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Próximamente más aventuras en esta categoría.</p>
                )}
              </div>
            </section>
            {index === Math.floor(categories.length / 2) - 1 && (
              <PublicityBanner delay="2s" />
            )}
          </React.Fragment>
        );
      })}

      <PublicityBanner delay="4s" />

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
              <Image src={selectedAventura.image} alt={selectedAventura.name} fill style={{ objectFit: 'cover' }} />
              <button 
                onClick={() => setSelectedAventura(null)}
                style={{ position: 'absolute', top: '16px', right: '16px', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.8)', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
              >
                âœ•
              </button>
            </div>
            
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>{selectedAventura.name}</h2>
              <p style={{ color: 'var(--color-orange)', fontWeight: 600, marginBottom: '16px', fontSize: '1.1rem' }}>{selectedAventura.category}</p>
              
              <p style={{ color: 'var(--color-text-main)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '24px' }}>
                {selectedAventura.description}
              </p>

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
                style={{ width: '100%', padding: '16px', fontSize: '1.1rem', textDecoration: 'none', textAlign: 'center', display: 'block', borderRadius: '16px' }}
              >
                ðŸ“± Consultar y Reservar
              </a>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
