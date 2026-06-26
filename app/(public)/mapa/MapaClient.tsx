'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './mapa.css';
import PublicityBanner from '@/components/PublicityBanner';
import { 
  Sun, CloudSun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind, Droplets,
  MapPin, Map as MapIcon, Navigation, Route, AlertTriangle, CalendarDays,
  Car, Info, ArrowRight, Search, CheckCircle, XCircle, Heart
} from 'lucide-react';
import type { DPVUnifiedData, DPVPaso, DPVRouteTramo } from '@/lib/services/dpv';
import type { WeatherData } from '@/lib/services/weather';
import { useFavorites } from '@/components/FavoritesContext';

interface MapMarkerItem {
  id: string;
  title: string;
  description?: string | null;
  latitude: number;
  longitude: number;
  color: string;
}

interface MapaClientProps {
  initialMarkers: MapMarkerItem[];
  dpvData?: DPVUnifiedData | null;
  weatherData?: WeatherData | null;
}

// Helper: Weather Icons & Backgrounds
const getWeatherMeta = (code: number, isDay: boolean = true) => {
  if (code === 0) return { icon: <Sun size={32} />, label: 'Despejado', bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' };
  if ([1, 2, 3].includes(code)) return { icon: <CloudSun size={32} />, label: 'Nubosidad', bg: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' };
  if ([45, 48].includes(code)) return { icon: <Cloud size={32} />, label: 'Niebla', bg: 'linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)' };
  if ([51, 53, 55, 56, 57].includes(code)) return { icon: <CloudRain size={32} />, label: 'Llovizna', bg: 'linear-gradient(135deg, #757f9a 0%, #d7dde8 100%)' };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { icon: <CloudRain size={32} />, label: 'Lluvia', bg: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)' };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { icon: <CloudSnow size={32} />, label: 'Nieve', bg: 'linear-gradient(135deg, #E0EAFC 0%, #CFDEF3 100%)' };
  if ([95, 96, 99].includes(code)) return { icon: <CloudLightning size={32} />, label: 'Tormenta', bg: 'linear-gradient(135deg, #141E30 0%, #243B55 100%)' };
  return { icon: <Cloud size={32} />, label: 'Desconocido', bg: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)' };
};

const getPasoCoordinates = (codTramo: number): [number, number] => {
  switch(codTramo) {
    case 9002: return [-70.9298, -38.6597]; // Pino Hachado
    case 9004: return [-71.2825, -38.8042]; // Icalma
    case 9006: return [-71.6667, -40.1167]; // Hua Hum
    case 9008: return [-71.4167, -39.5667]; // Mamuil Malal
    case 9010: return [-71.8667, -40.7167]; // Cardenal Samoré
    default: return [-70.3, -38.8];
  }
};

const getRouteColor = (status: string | undefined | null) => {
  if (!status) return '#16a34a'; // Fallback a Verde
  const lower = status.toLowerCase();
  if (lower.includes('precaución') || lower.includes('tcp') || status === 'TCP') return '#ea580c'; // Naranja
  if (lower.includes('intransitable') || lower.includes('cerrado') || status === 'I' || status === 'C') return '#dc2626'; // Rojo
  return '#16a34a'; // Verde por defecto
};

export default function MapaClient({ initialMarkers }: MapaClientProps) {
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const [activeTab, setActiveTab] = useState<'clima'|'mapa'|'rutas'>('mapa');
  const [mapView, setMapView] = useState<'local'|'provincial'>('local');
  const [mapLayer, setMapLayer] = useState<'satelite'|'calle'>('satelite');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [routeSearch, setRouteSearch] = useState('');
  const [mapError, setMapError] = useState<string | null>(null);

  const [dpvData, setDpvData] = useState<DPVUnifiedData | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function loadRealTimeData() {
      setLoadingData(true);
      try {
        const res = await fetch('/api/map-status');
        if (res.ok) {
          const data = await res.json();
          setDpvData(data.dpvData);
          setWeatherData(data.weatherData);
        }
      } catch (err) {
        console.error('Error loading real-time map/weather/routes data:', err);
      } finally {
        setLoadingData(false);
      }
    }
    loadRealTimeData();
  }, []);

  // Auto-Highlighting / Opening favorite link logic
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const openParam = params.get('open');

      if (tabParam === 'rutas' || openParam) {
        setActiveTab('rutas');
      }

      if (openParam && dpvData) {
        const openId = parseInt(openParam, 10);
        const matchedPaso = dpvData.pasos.find(p => p.codTramo === openId);
        if (matchedPaso) {
          setRouteSearch(matchedPaso.descripcion);
          return;
        }

        const matchedRuta = dpvData.rutas.find(r => r.codigoTramo === openId);
        if (matchedRuta) {
          setRouteSearch(matchedRuta.rutaTramo);
        }
      }
    }
  }, [dpvData]);

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  // Initialize Map
  useEffect(() => {
    if (activeTab !== 'mapa') return;
    
    // Destroy previous map instance if it exists and we are recreating
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    if (mapContainer.current) {
      const isLocal = mapView === 'local';
      
      try {
        setMapError(null);
        map.current = new maplibregl.Map({
          container: mapContainer.current,
          style: mapLayer === 'satelite' 
            ? {
                version: 8,
                sources: {
                  satellite: {
                    type: 'raster',
                    tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
                    tileSize: 256,
                    attribution: 'Esri, Maxar, Earthstar Geographics'
                  }
                },
                layers: [
                  {
                    id: 'satellite',
                    type: 'raster',
                    source: 'satellite',
                    minzoom: 0,
                    maxzoom: 22
                  }
                ]
              }
            : 'https://tiles.openfreemap.org/styles/liberty',
          center: isLocal ? [-71.1667, -38.8833] : [-70.3, -38.8], 
          zoom: isLocal ? 12 : 6,
          pitch: 0, 
          bearing: 0
        });

        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        if (isLocal) {
          // Draw Aluminé Local Markers
          let markersToRender = initialMarkers && initialMarkers.length > 0 ? initialMarkers : [
            { id: '1', title: 'Aluminé', longitude: -71.1667, latitude: -38.8833, color: '#ea580c' }
          ];

          if (categoryFilter !== 'all') {
            const term = categoryFilter.toLowerCase();
            markersToRender = markersToRender.filter(m => {
              const text = `${m.title} ${m.description || ''}`.toLowerCase();
              if (term === 'alojamiento') return text.includes('cabaña') || text.includes('hotel') || text.includes('alojamiento') || text.includes('hostel');
              if (term === 'gastronomia') return text.includes('restaurante') || text.includes('comida') || text.includes('pizzer') || text.includes('cerve') || text.includes('cafe');
              if (term === 'aventura') return text.includes('aventura') || text.includes('trekking') || text.includes('pesca') || text.includes('nieve') || text.includes('guia');
              return text.includes(term);
            });
          }

          markersToRender.forEach((marker) => {
            if (!marker.longitude || !marker.latitude) return;
            new maplibregl.Marker({ color: marker.color || '#00b4d8' })
              .setLngLat([marker.longitude, marker.latitude])
              .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`
                <div style="padding: 8px;">
                  <h3 style="margin: 0 0 4px 0; font-size: 1rem; font-weight: 700; color: #14352a;">${marker.title}</h3>
                  <p style="margin: 0; font-size: 0.85rem; color: #475569;">${marker.description || ''}</p>
                </div>
              `))
              .addTo(map.current!);
          });
        } else if (dpvData?.pasos) {
          // Draw Provincial Border Crossings
          dpvData.pasos.forEach((paso) => {
            const coords = getPasoCoordinates(paso.codTramo);
            const safeStatus = paso.status || '';
            const statusColor = getRouteColor(safeStatus);
            
            new maplibregl.Marker({ color: statusColor })
              .setLngLat(coords)
              .setPopup(new maplibregl.Popup({ offset: 25, maxWidth: '300px' }).setHTML(`
                <div style="padding: 8px;">
                  <span style="font-size: 0.7rem; font-weight: 800; color: ${statusColor}; text-transform: uppercase;">ESTADO OFICIAL</span>
                  <h3 style="margin: 4px 0; font-size: 1.1rem; font-weight: 800; color: #111;">${paso.descripcion}</h3>
                  <p style="margin: 0 0 8px 0; font-size: 0.85rem; font-weight: 600; color: #475569;">Estado: ${safeStatus}</p>
                  <p style="margin: 0; font-size: 0.8rem; color: #64748b; line-height: 1.4;">${paso.observacion || 'Sin observaciones'}</p>
                </div>
              `))
              .addTo(map.current!);
          });
        }
      } catch (error: any) {
        console.error("Error al inicializar el mapa:", error);
        setMapError("El motor de mapas no es compatible con este dispositivo o navegador.");
      }
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [activeTab, mapView, mapLayer, initialMarkers, dpvData, categoryFilter]);

  // Filters for Routes
  const filteredRoutes = useMemo(() => {
    return dpvData?.rutas.filter(r => {
      const search = routeSearch.toLowerCase();
      const rName = (r.rutaNumero || '').toString();
      const rTramo = r.rutaTramo || '';
      return rName.toLowerCase().includes(search) || rTramo.toLowerCase().includes(search);
    }) || [];
  }, [dpvData, routeSearch]);

  const currentMeta = weatherData ? getWeatherMeta(weatherData.current.weatherCode, weatherData.current.isDay) : null;

  return (
    <div className="container mapa-container">
      
      {/* Premium Hero Banner */}
      <div className="dashboard-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Info Hub Aluminé</h1>
          <p>Tu centro de planificación: Clima en tiempo real, mapa interactivo y estado oficial de rutas de la DPV NeuQuén.</p>
        </div>
      </div>

      <PublicityBanner page="GuiaLocal" section={1} height="100px" />

      {/* Modern Tab Navigation */}
      <div className="tab-navigation">
        <button className={activeTab === 'mapa' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('mapa')}>
          <MapIcon size={20} /> Mapa Interactivo
        </button>
        <button className={activeTab === 'clima' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('clima')}>
          <CloudSun size={20} /> Clima Local
        </button>
        <button className={activeTab === 'rutas' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('rutas')}>
          <Route size={20} /> Rutas y Pasos
        </button>
      </div>

      {/* --- TAB: MAPA INTERACTIVO --- */}
      {activeTab === 'mapa' && (
        <div className="tab-content fade-in">
          <div className="map-controls">
            <button className={mapView === 'local' ? 'btn-toggle active' : 'btn-toggle'} onClick={() => setMapView('local')}>
              <MapPin size={18} /> Aluminé Local
            </button>
            <button className={mapView === 'provincial' ? 'btn-toggle active' : 'btn-toggle'} onClick={() => setMapView('provincial')}>
              <Navigation size={18} /> NeuQuén y Fronteras
            </button>
            <button className="btn-toggle" onClick={() => setMapLayer(prev => prev === 'satelite' ? 'calle' : 'satelite')} style={{ marginLeft: 'auto', background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1' }}>
              <MapIcon size={18} /> Capa: {mapLayer === 'satelite' ? 'Satélite' : 'Calles'}
            </button>
          </div>

          {mapView === 'local' && (
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '12px', scrollbarWidth: 'none' }}>
              {['all', 'alojamiento', 'gastronomia', 'aventura'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '50px',
                    border: '1px solid',
                    borderColor: categoryFilter === cat ? 'var(--color-green)' : '#cbd5e1',
                    backgroundColor: categoryFilter === cat ? 'var(--color-green)' : 'white',
                    color: categoryFilter === cat ? 'white' : 'var(--color-text-main)',
                    fontWeight: categoryFilter === cat ? 700 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                  }}
                >
                  {cat === 'all' ? 'Todos' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          )}
          
          <div className="map-wrapper">
            {mapError ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <AlertTriangle size={48} color="#ea580c" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '1.2rem', color: '#14352a', marginBottom: '8px' }}>Modo Seguro Activado</h3>
                <p style={{ color: '#475569', fontSize: '0.9rem' }}>{mapError}</p>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '12px' }}>Puede usar las pestañas de Clima y Rutas con normalidad.</p>
              </div>
            ) : (
              <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
            )}
            
            <div className="map-legend glass-panel">
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '8px' }}>
                {mapView === 'local' ? 'Mapa Local' : 'Pasos Internacionales'}
              </h4>
              {mapView === 'local' ? (
                <p style={{ fontSize: '0.8rem', margin: 0, color: '#475569' }}>Atractivos y puntos de interés locales.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#16a34a' }}></div> Transitable</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ea580c' }}></div> Precaución</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#dc2626' }}></div> Cerrado</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB: CLIMA --- */}
      {activeTab === 'clima' && (
        !weatherData ? (
          <div className="tab-content fade-in" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '16px', color: '#64748b', fontWeight: 500 }}>Cargando pronóstico meteorológico...</p>
          </div>
        ) : (
          currentMeta && (
            <div className="tab-content fade-in">
              <div className="weather-dashboard">
                {/* Current Weather Big Card */}
                <div className="current-weather-card" style={{ background: currentMeta.bg, color: currentMeta.icon.type.name === 'Sun' ? '#111' : 'white' }}>
                  <div className="weather-header">
                    <h2>Aluminé</h2>
                    <div className="weather-badge">En vivo</div>
                  </div>
                  <div className="weather-main">
                    <div className="weather-temp">
                      <span className="temp-value">{Math.round(weatherData.current.temperature)}°</span>
                      <div className="weather-desc">
                        {currentMeta.icon}
                        <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{currentMeta.label}</span>
                      </div>
                    </div>
                    <div className="weather-details-grid">
                      <div className="detail-item"><Wind size={18} /> {weatherData.current.windSpeed} km/h</div>
                      <div className="detail-item"><Droplets size={18} /> {weatherData.current.humidity}%</div>
                      <div className="detail-item">ST: {Math.round(weatherData.current.apparentTemperature)}°</div>
                      <div className="detail-item">Lluvia: {weatherData.current.precipitation} mm</div>
                    </div>
                  </div>
                </div>

                {/* 7 Day Forecast */}
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '32px', marginBottom: '16px', color: 'var(--color-dark-green)' }}>
                  Pronóstico Semanal
                </h3>
                <div className="weekly-forecast-grid">
                  {weatherData.daily.time.map((day, idx) => {
                    // Parse date manually to avoid SSR timezone hydration mismatch
                    const parts = day.split('-');
                    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                    const dayName = days[d.getDay()];
                    const dayMeta = getWeatherMeta(weatherData.daily.weatherCode[idx], true);
                    
                    return (
                      <div key={day} className="daily-card glass-panel">
                        <span className="day-name">{idx === 0 ? 'Hoy' : dayName}</span>
                        <div className="daily-icon" style={{ color: '#0284c7' }}>{dayMeta.icon}</div>
                        <div className="daily-temps">
                          <span className="temp-max">{Math.round(weatherData.daily.temperatureMax[idx])}°</span>
                          <span className="temp-min">{Math.round(weatherData.daily.temperatureMin[idx])}°</span>
                        </div>
                        {weatherData.daily.precipitationSum[idx] > 0 && (
                          <span className="precip-prob"><Droplets size={12} /> {weatherData.daily.precipitationSum[idx]} mm</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )
        )
      )}

      {/* --- TAB: RUTAS Y PASOS --- */}
      {activeTab === 'rutas' && (
        <div className="tab-content fade-in">
          {/* Status Header */}
          <div className="routes-status-header">
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', margin: 0 }}>Estado Oficial de la Red Vial</h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.9rem' }}>Fuente: Dirección Provincial de Vialidad, NeuQuén</p>
            </div>
            {dpvData && (
              <div className="update-badge">
                <CalendarDays size={14} /> Actualizado: {dpvData.lastUpdated}
              </div>
            )}
          </div>

          {loadingData ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div className="spinner"></div>
              <p style={{ marginTop: '16px', color: '#64748b', fontWeight: 500 }}>Cargando datos en tiempo real de DPV NeuQuén...</p>
            </div>
          ) : dpvData ? (
            <>
              {/* Pasos Internacionales */}
              <h3 className="section-title-sm"><MapPin size={20} /> Pasos Internacionales</h3>
              <div className="pasos-grid">
                {dpvData.pasos.map(paso => {
                  const safeStatus = paso.status || '';
                  const statusColor = getRouteColor(safeStatus);
                  const isOpen = !safeStatus.toLowerCase().includes('cerrado') && !safeStatus.toLowerCase().includes('intransitable');
                  
                  const pasoId = `paso-${paso.codTramo}`;
                  const isFav = isFavorite(pasoId);
                  
                  const handleToggleFavorite = () => {
                    if (isFav) {
                      removeFavorite(pasoId);
                    } else {
                      addFavorite({
                        id: pasoId,
                        title: paso.descripcion,
                        image: '/images/banner_rutas.png',
                        url: `/mapa?tab=rutas&open=${paso.codTramo}`,
                        type: 'paso'
                      });
                    }
                  };

                  return (
                    <div key={paso.codTramo} className="paso-card glass-panel" style={{ borderTop: `4px solid ${statusColor}` }}>
                      <div className="paso-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{paso.descripcion}</h4>
                          <button
                            onClick={handleToggleFavorite}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: isFav ? '#ef4444' : '#cbd5e1',
                              transition: 'color 0.2s',
                            }}
                            title={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
                          >
                            <Heart size={18} fill={isFav ? '#ef4444' : 'none'} />
                          </button>
                        </div>
                        <div className="paso-badge" style={{ backgroundColor: `${statusColor}20`, color: statusColor }}>
                          {isOpen ? <CheckCircle size={14} /> : <XCircle size={14} />} {paso.status}
                        </div>
                      </div>
                      <div className="paso-details">
                        <span className="paso-tag">RN {paso.nroRuta}</span>
                        <span className="paso-tag">{paso.superficie}</span>
                      </div>
                      <p className="paso-obs"><Info size={14} style={{ display: 'inline', marginRight: '4px' }} />{paso.observacion}</p>
                    </div>
                  );
                })}
              </div>

              {/* Todas las Rutas */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <h3 className="section-title-sm" style={{ margin: 0 }}><Route size={20} /> Estado de Rutas (NeuQuén)</h3>
                <div className="search-box">
                  <Search size={18} color="#94a3b8" />
                  <input 
                    type="text" 
                    placeholder="Buscar ruta o tramo (ej: 13, Aluminé)..." 
                    value={routeSearch}
                    onChange={(e) => setRouteSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="routes-list">
                {filteredRoutes.map((ruta, i) => {
                  const color = getRouteColor(ruta.rutaEstado);
                  const rutaId = `ruta-${ruta.codigoTramo}`;
                  const isFav = isFavorite(rutaId);
                  
                  const handleToggleFavorite = () => {
                    if (isFav) {
                      removeFavorite(rutaId);
                    } else {
                      addFavorite({
                        id: rutaId,
                        title: `${ruta.rutaProvincial ? 'RP' : 'RN'} ${ruta.rutaNumero}: ${ruta.rutaTramo}`,
                        image: '/images/banner_rutas.png',
                        url: `/mapa?tab=rutas&open=${ruta.codigoTramo}`,
                        type: 'ruta'
                      });
                    }
                  };

                  return (
                    <div key={i} className="route-item glass-panel">
                      <div className="route-number" style={{ backgroundColor: ruta.rutaProvincial ? '#0284c7' : '#16a34a' }}>
                        {ruta.rutaProvincial ? 'RP' : 'RN'} {ruta.rutaNumero}
                      </div>
                      <div className="route-info">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h5 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>{ruta.rutaTramo}</h5>
                            <button
                              onClick={handleToggleFavorite}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isFav ? '#ef4444' : '#cbd5e1',
                                transition: 'color 0.2s',
                              }}
                              title={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
                            >
                              <Heart size={18} fill={isFav ? '#ef4444' : 'none'} />
                            </button>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', backgroundColor: `${color}15`, color: color }}>
                            {formatEstadoDPV(ruta.rutaEstado)}
                          </span>
                        </div>
                        <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#475569', lineHeight: '1.4' }}>
                          <AlertTriangle size={14} style={{ display: 'inline', color: '#f59e0b', marginRight: '4px' }}/>
                          {ruta.rutaObservacion}
                        </p>
                      </div>
                    </div>
                  )
                })}
                {filteredRoutes.length === 0 && (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No se encontraron rutas con esa bÁºsqueda.</div>
                )}
              </div>
            </>
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: '#fef2f2', borderRadius: '12px', border: '1px solid #fee2e2', color: '#991b1b', margin: '20px 0' }}>
              <AlertTriangle size={36} style={{ margin: '0 auto 12px', color: '#dc2626' }} />
              <h4 style={{ margin: '0 0 8px', fontWeight: 800, fontSize: '1.2rem' }}>Servicio de Rutas no Disponible</h4>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#7f1d1d', lineHeight: 1.5 }}>
                El servidor oficial de la Dirección Provincial de Vialidad de NeuQuén (DPV) no está respondiendo en este momento o se encuentra temporalmente fuera de servicio.
                <br />
                Por favor, intenta de nuevo más tarde o consulta los partes oficiales de DPV NeuQuén directamente.
              </p>
            </div>
          )}
        </div>
      )}

      <PublicityBanner page="GuiaLocal" section={2} delay="4s" />
    </div>
  );
}

// Helper for generic status
function formatEstadoDPV(estado: string) {
  if (estado === 'TCP') return 'Transitable c/ Precaución';
  if (estado === 'T') return 'Transitable';
  if (estado === 'I' || estado === 'C') return 'Cerrado / Intransitable';
  return estado;
}


