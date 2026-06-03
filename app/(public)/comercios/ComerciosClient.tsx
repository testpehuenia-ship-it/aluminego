'use client';

import React, { useState, useEffect } from 'react';
import PublicityBanner from '@/components/PublicityBanner';
import { Loader2, MapPin, Phone } from 'lucide-react';

export default function ComerciosClient({ initialServices }: { initialServices?: any[] }) {
  const [services, setServices] = useState<any[]>(initialServices || []);
  const [loading, setLoading] = useState(!initialServices);

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

  // Agrupamos por categoría para el renderizado
  const groupedServices = services.reduce((acc: any, service: any) => {
    const cat = service.category || 'Otros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(service);
    return acc;
  }, {});

  const categories = Object.keys(groupedServices).sort();

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
        <Loader2 className="animate-spin" size={48} color="var(--color-purple)" />
        <p style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Cargando Guía Local...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      
      {/* Banner Principal de la Guía Local */}
      <div style={{ position: 'relative', height: '240px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '40px', backgroundImage: 'url(/images/guia_local_banner.png)', backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '24px' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%)', zIndex: 1 }}></div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ color: 'var(--color-green)', fontWeight: 800, fontSize: '1.4rem' }}>Aluminé</span>
            <span style={{ color: 'var(--color-orange)', fontWeight: 800, fontSize: '1.4rem' }}>GO</span>
            <span style={{ color: 'white', margin: '0 4px' }}>|</span>
            <span style={{ color: 'white', fontWeight: 600, fontSize: '1.2rem', letterSpacing: '1px' }}>GUÍA LOCAL</span>
          </div>
          <p style={{ color: 'var(--color-bg)', fontSize: '1rem', opacity: 0.9 }}>
            Comercios, Servicios e Instituciones de Aluminé
          </p>
        </div>
      </div>



      {/* Botones de Anclaje Rápido */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '40px', scrollbarWidth: 'none' }}>
        {categories.map(cat => (
          <a
            key={cat}
            href={`#${cat.replace(/ /g, '-').toLowerCase()}`}
            style={{ backgroundColor: 'white', border: '1px solid var(--color-border)', padding: '10px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-main)', whiteSpace: 'nowrap', textDecoration: 'none', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)' }}
            className="category-anchor"
          >
            {cat}
          </a>
        ))}
      </div>

      {/* Renderizado de Secciones */}
      {categories.map((categoria, index) => {
        const items = groupedServices[categoria];
        const lowerCat = categoria.toLowerCase();
        let Banner = null;
        if (lowerCat.includes('comercio') || lowerCat.includes('prov')) {
          Banner = <PublicityBanner page="GuiaLocal" section={1} height="150px" delay="0s" />;
        } else if (lowerCat.includes('gastronom')) {
          Banner = <PublicityBanner page="GuiaLocal" section={2} height="100px" delay="1s" />;
        } else if (lowerCat.includes('institucion') || (lowerCat.includes('servicios') && !lowerCat.includes('varios'))) {
          Banner = <PublicityBanner page="GuiaLocal" section={3} height="150px" delay="2s" />;
        } else if (lowerCat.includes('varios')) {
          Banner = <PublicityBanner page="GuiaLocal" section={4} height="100px" delay="3s" />;
        }
        
        return (
          <React.Fragment key={categoria}>
            {Banner && <div style={{ marginBottom: '30px' }}>{Banner}</div>}
            <section id={categoria.replace(/ /g, '-').toLowerCase()} style={{ marginBottom: '50px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-main)', borderLeft: '5px solid var(--color-green)', paddingLeft: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{categoria}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg)', padding: '2px 8px', borderRadius: '10px' }}>
                  {items.length}
                </span>
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {items.map((item: any) => (
                  <div key={item.id} style={{ backgroundColor: 'white', borderRadius: 'var(--radius-md)', padding: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      {item.image && (
                        <div style={{ width: '50px', height: '50px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-main)', margin: 0 }}>
                          {item.name}
                        </h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-orange)', fontWeight: 600 }}>{item.category}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                      {item.address && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                          <MapPin size={14} color="#64748b" />
                          <span>{item.address}</span>
                        </div>
                      )}
                      {item.whatsapp && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-green)', fontSize: '0.9rem', fontWeight: 600 }}>
                          <Phone size={14} />
                          <a href={`https://wa.me/${item.whatsapp}`} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                            {item.whatsapp}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </React.Fragment>
        );
      })}


      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
