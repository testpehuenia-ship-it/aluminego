'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import PublicityBanner from '@/components/PublicityBanner';
import { Loader2 } from 'lucide-react';

export default function AlojarseClient({ initialAccommodations }: { initialAccommodations?: any[] }) {
  const [selectedAlojamiento, setSelectedAlojamiento] = useState<any | null>(null);
  const [accommodations, setAccommodations] = useState<any[]>(initialAccommodations || []);
  const [loading, setLoading] = useState(!initialAccommodations);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedAlojamiento]);

  const accommodationTypes = ["Cabañas", "Hoteles", "Hostel", "Campings"];

  const buildWhatsAppUrl = (alojamiento: any) => {
    const message = `*Hola ${alojamiento.name}!* \nTe contacto desde AlumineGo.\nQuisiera consultar disponibilidad y tarifas para alojarme con ustedes.\n\n¡Muchas gracias!`;
    return `https://wa.me/${alojamiento.whatsapp}?text=${encodeURIComponent(message)}`;
  };

  const fetchData = async () => {
    try {
      const res = await fetch('/api/accommodations');
      const data = await res.json();
      setAccommodations(data);
    } catch (e) {
      console.error('Error fetching accommodations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialAccommodations || initialAccommodations.length === 0) {
      fetchData();
    }
  }, [initialAccommodations]);

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
            { cat: "Cabañas", color: "#e63946", bgImage: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80" },
            { cat: "Hoteles", color: "#f4a261", bgImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80" },
            { cat: "Hostel", color: "#e9c46a", bgImage: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80" },
            { cat: "Campings", color: "#2a9d8f", bgImage: "https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?auto=format&fit=crop&w=800&q=80" }
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

      <h1 className="section-title">¿Dónde vas a dormir?</h1>

      {accommodationTypes.map((category, index) => {
        const catAccs = accommodations.filter(a => a.type === category);
        if (catAccs.length === 0) return null;

        return (
          <React.Fragment key={category}>
            <section id={category.toLowerCase()} style={{ marginBottom: '60px' }}>
              <h2 style={{ fontSize: '1.5rem', borderLeft: '5px solid var(--color-orange)', paddingLeft: '12px', marginBottom: '24px', color: 'var(--color-text-main)' }}>
                {category}
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {catAccs.map(alojamiento => (
                  <button key={alojamiento.id} style={{ backgroundColor: 'white', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)', cursor: 'pointer', display: 'block', width: '100%', textAlign: 'left' }}
                  onClick={() => setSelectedAlojamiento(alojamiento)}
                  className="commerce-card"
                  >
                    <div style={{ position: 'relative', height: '200px' }}>
                      {alojamiento.image ? (
                        <Image src={alojamiento.image.split(',')[0]} alt={alojamiento.name} fill style={{ objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: '#e2e8f0' }} />
                      )}
                    </div>
                    <div style={{ padding: '16px' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>{alojamiento.name}</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
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
                ))}
              </div>
            </section>
            {index === Math.floor(accommodationTypes.length / 2) && <PublicityBanner page="Dormir" section={2} height="100px" delay="2s" />}
          </React.Fragment>
        );
      })}

      <div style={{ marginTop: '20px' }}>
        <PublicityBanner page="Dormir" section={3} height="150px" delay="4s" />
      </div>

      {selectedAlojamiento && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', zIndex: 1000, padding: '20px' }}
        onClick={() => setSelectedAlojamiento(null)}
        >
          <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '600px', maxHeight: '90vh', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px', overflowY: 'auto', position: 'relative' }}
          onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setSelectedAlojamiento(null)} style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '1.5rem', fontWeight: 'bold', zIndex: 10 }}>✖</button>
            
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
            <p style={{ color: 'var(--color-orange)', fontWeight: 600, marginBottom: '16px', fontSize: '1.1rem' }}>{selectedAlojamiento.type}</p>
            
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
              <a href={buildWhatsAppUrl(selectedAlojamiento)} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem', textDecoration: 'none' }}>
                📱 Consultar Disponibilidad
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
