'use client';

import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ExternalLink, Navigation } from 'lucide-react';

interface EntityMapProps {
  latitude: number | string;
  longitude: number | string;
  title: string;
}

export default function EntityMap({ latitude, longitude, title }: EntityMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  const numLat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
  const numLng = typeof longitude === 'string' ? parseFloat(longitude) : longitude;

  useEffect(() => {
    if (!mapContainer.current || isNaN(numLat) || isNaN(numLng)) return;

    try {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }

      map.current = new maplibregl.Map({
        container: mapContainer.current,
        cooperativeGestures: true,
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '&copy; OpenStreetMap contributors'
            }
          },
          layers: [
            {
              id: 'osm-tiles',
              type: 'raster',
              source: 'osm',
              minzoom: 0,
              maxzoom: 19
            }
          ]
        },
        center: [numLng, numLat],
        zoom: 15,
        attributionControl: false
      });

      // Añadir controles de navegación (zoom, rotación)
      map.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

      // Crear elemento personalizado para el pin naranja con punto blanco idéntico al diseño original
      const el = document.createElement('div');
      el.className = 'custom-map-pin';
      el.style.width = '36px';
      el.style.height = '48px';
      el.style.cursor = 'pointer';
      el.innerHTML = `
        <svg viewBox="0 0 24 32" width="36" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.372 0 0 5.372 0 12C0 20.25 10.68 31.02 11.136 31.476C11.604 31.944 12.396 31.944 12.864 31.476C13.32 31.02 24 20.25 24 12C24 5.372 18.628 0 12 0Z" fill="#ea580c"/>
          <circle cx="12" cy="12" r="5" fill="white"/>
        </svg>
      `;

      new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([numLng, numLat])
        .setPopup(
          new maplibregl.Popup({ offset: 35 }).setHTML(`
            <div style="padding: 6px 8px; font-family: sans-serif;">
              <h4 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: #0f172a;">${title}</h4>
            </div>
          `)
        )
        .addTo(map.current);

    } catch (error) {
      console.error('Error rendering map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [numLat, numLng, title]);

  if (isNaN(numLat) || isNaN(numLng)) return null;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${numLat},${numLng}`;

  return (
    <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', padding: '24px 20px', boxShadow: 'var(--shadow-sm)', marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-main)', margin: 0 }}>Ubicación</h2>
        <a 
          href={googleMapsUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px', 
            fontSize: '0.88rem', 
            color: 'var(--color-orange)', 
            fontWeight: 600, 
            textDecoration: 'none' 
          }}
        >
          <Navigation size={15} /> Cómo llegar <ExternalLink size={13} />
        </a>
      </div>
      <div style={{ display: 'flex', width: '100%' }}>
        <div 
          ref={mapContainer} 
          style={{ 
            width: '100%', 
            maxWidth: 'calc(100% - 20px)',
            height: '320px', 
            borderRadius: '12px', 
            overflow: 'hidden', 
            border: '1px solid var(--color-border)' 
          }} 
        />
        {/* Espacio seguro para scroll táctil en celulares */}
        <div style={{ width: '20px', flexShrink: 0 }} aria-hidden="true" />
      </div>
    </div>
  );
}

