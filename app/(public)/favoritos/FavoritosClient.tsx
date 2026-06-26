"use client";

import React, { useState, useEffect } from 'react';
import { useFavorites } from '@/components/FavoritesContext';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Trash2, ArrowLeft } from 'lucide-react';

export default function FavoritosClient() {
  const { favorites, removeFavorite } = useFavorites();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        Cargando tus favoritos...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Link href="/" style={{ padding: '8px', backgroundColor: 'white', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', color: 'var(--color-text)' }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-green)', margin: 0 }}>
          Mis Favoritos
        </h1>
      </div>

      {favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <Heart size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.4rem', color: 'var(--color-text-main)', marginBottom: '8px' }}>No tienes favoritos guardados</h2>
          <p style={{ color: 'var(--color-text)', marginBottom: '24px' }}>Explora alojamientos, restaurantes y actividades para armar tu itinerario perfecto.</p>
          <Link href="/" style={{ display: 'inline-block', backgroundColor: 'var(--color-orange)', color: 'white', textDecoration: 'none', padding: '12px 24px', borderRadius: '24px', fontWeight: 'bold' }}>
            Explorar AluminéGO
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {favorites.map((fav) => (
            <div key={fav.id} style={{ display: 'flex', backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', position: 'relative' }}>
              <Link href={fav.url} style={{ flexShrink: 0, display: 'block' }}>
                <Image 
                  src={fav.image} 
                  alt={fav.title} 
                  width={120} 
                  height={120} 
                  style={{ objectFit: 'cover', width: '120px', height: '100%' }}
                />
              </Link>
              <div style={{ padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-orange)', fontWeight: 700, marginBottom: '4px' }}>
                  {fav.type === 'gastronomia' ? 'gastronomía' :
                   fav.type === 'alojamiento' ? 'Alojamiento' :
                   fav.type === 'aventura' ? 'Aventura' :
                   fav.type === 'comercio' ? 'Comercio' :
                   fav.type === 'ruta' ? 'Estado de Ruta' :
                   fav.type === 'paso' ? 'Paso Internacional' : fav.type}
                </div>
                <Link href={fav.url} style={{ textDecoration: 'none', color: 'var(--color-text-main)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 8px 0' }}>{fav.title}</h3>
                </Link>
                <div style={{ marginTop: 'auto' }}>
                  <Link href={fav.url} style={{ fontSize: '0.9rem', color: 'var(--color-green)', fontWeight: 600, textDecoration: 'none' }}>
                    Ver detalles â†’
                  </Link>
                </div>
              </div>
              <button 
                onClick={() => removeFavorite(fav.id)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: '#fee2e2', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444' }}
                aria-label="Eliminar favorito"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


