"use client";

import React, { useState, useEffect } from 'react';
import { useFavorites, FavoriteItem } from './FavoritesContext';
import { Heart } from 'lucide-react';

export default function FavoriteButton({ item }: { item: FavoriteItem }) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isFav = isFavorite(item.id);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFav) {
      removeFavorite(item.id);
    } else {
      addFavorite(item);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 10,
        transition: 'transform 0.2s',
      }}
      aria-label={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      <Heart 
        size={20} 
        color={isFav ? '#ef4444' : '#64748b'} 
        fill={isFav ? '#ef4444' : 'none'} 
      />
    </button>
  );
}
