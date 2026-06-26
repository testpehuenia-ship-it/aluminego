'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface PublicityBannerProps {
  page?: string;
  section?: number;
  height?: string;
  delay?: string;
  maxWidth?: string;
}

export default function PublicityBanner({ 
  page,
  section,
  height = '150px', 
  delay = '0s',
  maxWidth = '600px'
}: PublicityBannerProps) {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si no pasamos page/section, no podemos fetchear de la base
    if (!page || !section) {
      setLoading(false);
      return;
    }

    const fetchBanners = async () => {
      try {
        const res = await fetch(`/api/publicity?page=${page}&section=${section}`);
        if (res.ok) {
          const data = await res.json();
          setBanners(data);
        }
      } catch (e) {
        console.error('Error fetching publicity banner', e);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [page, section]);

  if (loading) return <div style={{ height, maxWidth, margin: '0 auto 24px auto', background: '#f1f5f9', borderRadius: '16px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />;

  // Default fallback if no banners exist in the database for this slot
  if (banners.length === 0) {
    return (
      <div className="ad-banner-container" style={{ height: height, maxWidth: maxWidth, margin: '0 auto 24px auto', position: 'relative' }}>
        <a 
          href="https://wa.me/5492942524300?text=Hola%20quiero%20publicitar%20en%20AluminéGO" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="ad-slide ad-slide-1" 
          style={{ 
            textDecoration: 'none', 
            animationDelay: delay,
            backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80')"
          }}
        >
          <h2 style={{ fontSize: height === '100px' ? '1.8rem' : '2.5rem', margin: 0, color: 'var(--color-green)', fontFamily: 'var(--font-oswald), sans-serif', textTransform: 'uppercase', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            Aluminé<span style={{ color: 'var(--color-orange)' }}>GO</span>
          </h2>
          <p style={{ color: 'white', fontSize: height === '100px' ? '0.9rem' : '1.2rem', marginTop: '4px', fontWeight: 700, textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
            Publicite Aquí
          </p>
        </a>
        <a 
          href="https://wa.me/5492942524300?text=Hola%20quiero%20publicitar%20en%20AluminéGO" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="ad-slide ad-slide-2" 
          style={{ textDecoration: 'none', animationDelay: delay }}
        >
          <h2 style={{ fontSize: height === '100px' ? '1.5rem' : '2rem', margin: 0, color: 'var(--color-green)', fontFamily: 'var(--font-oswald), sans-serif', textTransform: 'uppercase' }}>
            Publicite Aquí
          </h2>
          <p style={{ color: 'var(--color-orange)', fontSize: height === '100px' ? '0.9rem' : '1.1rem', marginTop: '4px', fontWeight: 700 }}>
            Haga crecer su negocio
          </p>
        </a>
        <a 
          href="https://wa.me/5492942524300?text=Hola%20quiero%20publicitar%20en%20AluminéGO" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="ad-slide ad-slide-3" 
          style={{ textDecoration: 'none', animationDelay: delay }}
        >
          <h2 style={{ fontSize: height === '100px' ? '1.5rem' : '1.8rem', margin: 0, color: 'white', fontFamily: 'var(--font-oswald), sans-serif', textTransform: 'uppercase', textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>
            PROMOCIÓN LANZAMIENTO
          </h2>
          <p style={{ color: '#fffbeb', fontSize: height === '100px' ? '1.2rem' : '1.5rem', marginTop: '4px', fontWeight: 900, background: 'var(--color-green)', padding: '4px 12px', borderRadius: '8px', display: 'inline-block' }}>
            50% DESCUENTO
          </p>
        </a>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: maxWidth, margin: '0 auto 24px auto' }}>
      {banners.slice(0, 3).map((banner) => {
        const isSmall = banner.size === 'chico';
        const bannerHeight = isSmall ? '100px' : '150px';

        const content = (
          <div style={{ position: 'relative', width: '100%', height: bannerHeight, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', background: '#000' }}>
            {banner.image.toLowerCase().endsWith('.mp4') || banner.image.includes('/video/upload/') ? (
              <video 
                src={banner.image} 
                autoPlay 
                loop 
                muted 
                playsInline 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              />
            ) : (
              <Image 
                src={banner.image} 
                alt={`Banner Publicitario ${banner.order}`} 
                fill 
                style={{ objectFit: 'contain' }} 
                unoptimized={banner.image.toLowerCase().includes('.gif')} 
              />
            )}
          </div>
        );

        if (banner.link) {
          return (
            <a key={banner.id} href={banner.link} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none' }}>
              {content}
            </a>
          );
        }

        return <div key={banner.id}>{content}</div>;
      })}
    </div>
  );
}



