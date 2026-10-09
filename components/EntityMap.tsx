'use client';

import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface EntityMapProps {
  latitude: number;
  longitude: number;
  title: string;
}

export default function EntityMap({ latitude, longitude, title }: EntityMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      // Destruir mapa anterior si existiera
      if (map.current) {
        map.current.remove();
        map.current = null;
      }

      map.current = new maplibregl.Map({
        container: mapContainer.current,
        cooperativeGestures: true,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: [longitude, latitude],
        zoom: 15,
        attributionControl: false
      });

      // Función para ocultar todos los comercios / POIs de fondo de OpenStreetMap
      const hideBackgroundPOIs = () => {
        if (!map.current) return;
        const layers = map.current.getStyle()?.layers || [];
        for (const layer of layers) {
          const id = layer.id.toLowerCase();
          const sourceLayer = ((layer as any)['source-layer'] || '').toLowerCase();
          if (
            id.includes('poi') ||
            sourceLayer.includes('poi') ||
            id.includes('amenity') ||
            id.includes('shop') ||
            id.includes('food') ||
            id.includes('restaurant') ||
            id.includes('hotel') ||
            id.includes('lodging') ||
            id.includes('tourism') ||
            id.includes('commercial') ||
            id.includes('place_other') ||
            id.includes('place-other')
          ) {
            try {
              map.current.setLayoutProperty(layer.id, 'visibility', 'none');
            } catch (e) {}
          }
        }
      };

      map.current.on('style.load', hideBackgroundPOIs);
      map.current.on('load', hideBackgroundPOIs);

      // Añadir controles de navegación (zoom, rotación)
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

      // Crear y añadir el marcador rojo premium
      new maplibregl.Marker({ color: '#ea580c' })
        .setLngLat([longitude, latitude])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(`
            <div style="padding: 4px; font-family: sans-serif;">
              <h4 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: #1e293b;">${title}</h4>
            </div>
          `)
        )
        .addTo(map.current);

    } catch (error) {
      console.error('Error rendering MapLibre GL map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [latitude, longitude, title]);

  return (
    <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', padding: '24px 20px', boxShadow: 'var(--shadow-sm)', marginTop: '24px' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '16px' }}>Ubicación</h2>
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
        {/* Safe touch scroll gutter on the right side for mobile swiping */}
        <div style={{ width: '20px', flexShrink: 0 }} aria-hidden="true" />
      </div>
    </div>
  );
}
