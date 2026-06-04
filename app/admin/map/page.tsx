'use client';

import React from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2, 
  X, 
  Save, 
  Map, 
  MapPin, 
  Compass,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function MapAdminPage() {
  const [activeTab, setActiveTab] = React.useState<'routes' | 'markers'>('routes');
  
  // Routes States
  const [routes, setRoutes] = React.useState<any[]>([]);
  const [routesLoading, setRoutesLoading] = React.useState(true);
  const [routeSearch, setRouteSearch] = React.useState('');
  const [isRouteModalOpen, setIsRouteModalOpen] = React.useState(false);
  const [editingRoute, setEditingRoute] = React.useState<any>(null);
  const [routeFormData, setRouteFormData] = React.useState({
    title: '',
    status: 'Transitable',
    description: ''
  });

  // Markers States
  const [markers, setMarkers] = React.useState<any[]>([]);
  const [markersLoading, setMarkersLoading] = React.useState(true);
  const [markerSearch, setMarkerSearch] = React.useState('');
  const [isMarkerModalOpen, setIsMarkerModalOpen] = React.useState(false);
  const [editingMarker, setEditingMarker] = React.useState<any>(null);
  const [markerFormData, setMarkerFormData] = React.useState({
    title: '',
    description: '',
    latitude: '',
    longitude: '',
    color: '#ea580c'
  });

  const [saving, setSaving] = React.useState(false);

  const fetchRoutes = async () => {
    try {
      const res = await fetch('/api/routes');
      const data = await res.json();
      setRoutes(data);
    } catch (e) {
      console.error('Error fetching routes');
    } finally {
      setRoutesLoading(false);
    }
  };

  const fetchMarkers = async () => {
    try {
      const res = await fetch('/api/map-markers');
      const data = await res.json();
      setMarkers(data);
    } catch (e) {
      console.error('Error fetching markers');
    } finally {
      setMarkersLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRoutes();
    fetchMarkers();
  }, []);

  // --- Route Handlers ---
  const openRouteModal = (route: any = null) => {
    if (route) {
      setEditingRoute(route);
      setRouteFormData({
        title: route.title,
        status: route.status || 'Transitable',
        description: route.description || ''
      });
    } else {
      setEditingRoute(null);
      setRouteFormData({ title: '', status: 'Transitable', description: '' });
    }
    setIsRouteModalOpen(true);
  };

  const closeRouteModal = () => {
    setIsRouteModalOpen(false);
    setEditingRoute(null);
  };

  const handleRouteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingRoute ? `/api/routes/${editingRoute.id}` : '/api/routes';
      const method = editingRoute ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routeFormData),
      });

      if (res.ok) {
        await fetchRoutes();
        closeRouteModal();
      } else {
        alert('Error al guardar la ruta');
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleRouteDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta ruta?')) return;
    try {
      const res = await fetch(`/api/routes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRoutes(routes.filter(r => r.id !== id));
      } else {
        alert('Error al eliminar');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  // --- Marker Handlers ---
  const openMarkerModal = (marker: any = null) => {
    if (marker) {
      setEditingMarker(marker);
      setMarkerFormData({
        title: marker.title,
        description: marker.description || '',
        latitude: String(marker.latitude),
        longitude: String(marker.longitude),
        color: marker.color || '#ea580c'
      });
    } else {
      setEditingMarker(null);
      setMarkerFormData({
        title: '',
        description: '',
        latitude: '',
        longitude: '',
        color: '#ea580c'
      });
    }
    setIsMarkerModalOpen(true);
  };

  const closeMarkerModal = () => {
    setIsMarkerModalOpen(false);
    setEditingMarker(null);
  };

  const handleMarkerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingMarker ? `/api/map-markers/${editingMarker.id}` : '/api/map-markers';
      const method = editingMarker ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(markerFormData),
      });

      if (res.ok) {
        await fetchMarkers();
        closeMarkerModal();
      } else {
        alert('Error al guardar el marcador');
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkerDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este marcador?')) return;
    try {
      const res = await fetch(`/api/map-markers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMarkers(markers.filter(m => m.id !== id));
      } else {
        alert('Error al eliminar');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const filteredRoutes = routes.filter(r => 
    r.title.toLowerCase().includes(routeSearch.toLowerCase()) ||
    r.status.toLowerCase().includes(routeSearch.toLowerCase())
  );

  const filteredMarkers = markers.filter(m => 
    m.title.toLowerCase().includes(markerSearch.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'transitable':
        return <CheckCircle2 size={16} style={{ color: '#16a34a' }} />;
      case 'precaución':
      case 'transitable con precaución':
        return <AlertTriangle size={16} style={{ color: '#ea580c' }} />;
      case 'cerrado':
      case 'intransitable':
        return <XCircle size={16} style={{ color: '#dc2626' }} />;
      default:
        return <Compass size={16} style={{ color: '#64748b' }} />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'transitable':
        return 'badge-success';
      case 'precaución':
      case 'transitable con precaución':
        return 'badge-warning';
      case 'cerrado':
      case 'intransitable':
        return 'badge-danger';
      default:
        return 'badge-default';
    }
  };

  return (
    <div className="admin-view">
      <div className="view-header">
        <div>
          <h1>Mapas y Rutas</h1>
          <p>Gestiona el estado de accesos, rutas y pines interactivos en el mapa 3D</p>
        </div>
        <div>
          {activeTab === 'routes' ? (
            <button className="add-btn" onClick={() => openRouteModal()}>
              <Plus size={20} /> Nueva Ruta
            </button>
          ) : (
            <button className="add-btn" onClick={() => openMarkerModal()}>
              <Plus size={20} /> Nuevo Marcador
            </button>
          )}
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'routes' ? 'active' : ''}`}
          onClick={() => setActiveTab('routes')}
        >
          <Compass size={18} /> Rutas y Accesos
        </button>
        <button 
          className={`tab-btn ${activeTab === 'markers' ? 'active' : ''}`}
          onClick={() => setActiveTab('markers')}
        >
          <MapPin size={18} /> Marcadores de Mapa 3D
        </button>
      </div>

      {activeTab === 'routes' ? (
        <div className="content-card">
          <div className="toolbar">
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Buscar ruta..." 
                value={routeSearch}
                onChange={(e) => setRouteSearch(e.target.value)}
              />
            </div>
            <div className="count-badge">{filteredRoutes.length} rutas</div>
          </div>

          {routesLoading ? (
            <div className="loading-state">
              <Loader2 size={40} className="animate-spin" />
              <p>Cargando rutas...</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '25%' }}>Ruta / Acceso</th>
                    <th style={{ width: '20%' }}>Estado</th>
                    <th style={{ width: '40%' }}>Detalles</th>
                    <th style={{ width: '15%' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoutes.map((r) => (
                    <tr key={r.id}>
                      <td className="bold">{r.title}</td>
                      <td>
                        <span className={`badge-status ${getStatusBadgeClass(r.status)}`}>
                          {getStatusIcon(r.status)}
                          {r.status}
                        </span>
                      </td>
                      <td className="description-cell">{r.description}</td>
                      <td>
                        <div className="actions-cell">
                          <button className="icon-btn edit" onClick={() => openRouteModal(r)}>
                            <Edit2 size={16} />
                          </button>
                          <button className="icon-btn delete" onClick={() => handleRouteDelete(r.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredRoutes.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        No se encontraron rutas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="content-card">
          <div className="toolbar">
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Buscar marcador..." 
                value={markerSearch}
                onChange={(e) => setMarkerSearch(e.target.value)}
              />
            </div>
            <div className="count-badge">{filteredMarkers.length} marcadores</div>
          </div>

          {markersLoading ? (
            <div className="loading-state">
              <Loader2 size={40} className="animate-spin" />
              <p>Cargando marcadores...</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Pin</th>
                    <th>Título</th>
                    <th>Coordenadas (Lat / Lng)</th>
                    <th>Descripción</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMarkers.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div 
                          className="marker-color-preview"
                          style={{ backgroundColor: m.color || '#ea580c' }}
                        >
                          <MapPin size={18} style={{ color: 'white' }} />
                        </div>
                      </td>
                      <td className="bold">{m.title}</td>
                      <td>
                        <span className="coord-badge">{m.latitude}</span>
                        <span className="coord-badge">{m.longitude}</span>
                      </td>
                      <td className="description-cell">{m.description || 'N/A'}</td>
                      <td>
                        <div className="actions-cell">
                          <button className="icon-btn edit" onClick={() => openMarkerModal(m)}>
                            <Edit2 size={16} />
                          </button>
                          <button className="icon-btn delete" onClick={() => handleMarkerDelete(m.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredMarkers.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        No se encontraron marcadores de mapa.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Route Modal */}
      {isRouteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingRoute ? 'Editar Ruta/Acceso' : 'Nueva Ruta/Acceso'}</h2>
              <button className="close-btn" onClick={closeRouteModal}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleRouteSubmit} className="modal-body">
              <div className="form-group">
                <label>Nombre de la Ruta / Acceso</label>
                <input 
                  type="text" 
                  value={routeFormData.title} 
                  onChange={(e) => setRouteFormData({...routeFormData, title: e.target.value})}
                  placeholder="Ej: RP 13 (Primeros Pinos)"
                  required
                />
              </div>
              <div className="form-group">
                <label>Estado de Transitabilidad</label>
                <select 
                  value={routeFormData.status} 
                  onChange={(e) => setRouteFormData({...routeFormData, status: e.target.value})}
                  required
                  className="admin-select"
                >
                  <option value="Transitable">🟢 Transitable</option>
                  <option value="Transitable con precaución">🟠 Transitable con precaución</option>
                  <option value="Cerrado">🔴 Cerrado / Intransitable</option>
                </select>
              </div>
              <div className="form-group">
                <label>Indicaciones / Observaciones</label>
                <textarea 
                  value={routeFormData.description} 
                  onChange={(e) => setRouteFormData({...routeFormData, description: e.target.value})}
                  placeholder="Escribí los detalles de la ruta, sectores difíciles o requerimiento obligatorio de cadenas."
                  rows={4}
                  required
                  className="admin-textarea"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeRouteModal}>Cancelar</button>
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Guardar Ruta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Marker Modal */}
      {isMarkerModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingMarker ? 'Editar Marcador de Mapa' : 'Nuevo Marcador de Mapa'}</h2>
              <button className="close-btn" onClick={closeMarkerModal}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleMarkerSubmit} className="modal-body">
              <div className="form-group">
                <label>Título del Marcador</label>
                <input 
                  type="text" 
                  value={markerFormData.title} 
                  onChange={(e) => setMarkerFormData({...markerFormData, title: e.target.value})}
                  placeholder="Ej: Muelle de Aluminé"
                  required
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Latitud</label>
                  <input 
                    type="number" 
                    step="any"
                    value={markerFormData.latitude} 
                    onChange={(e) => setMarkerFormData({...markerFormData, latitude: e.target.value})}
                    placeholder="Ej: -38.8833"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Longitud</label>
                  <input 
                    type="number" 
                    step="any"
                    value={markerFormData.longitude} 
                    onChange={(e) => setMarkerFormData({...markerFormData, longitude: e.target.value})}
                    placeholder="Ej: -71.1667"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Descripción / Pop-up</label>
                <input 
                  type="text" 
                  value={markerFormData.description} 
                  onChange={(e) => setMarkerFormData({...markerFormData, description: e.target.value})}
                  placeholder="Ej: Muelle público y paseos lacustres"
                />
              </div>

              <div className="form-group">
                <label>Color del Pin</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input 
                    type="color" 
                    value={markerFormData.color} 
                    onChange={(e) => setMarkerFormData({...markerFormData, color: e.target.value})}
                    className="admin-color-picker"
                  />
                  <span style={{ fontSize: '0.9rem', color: '#64748b', fontFamily: 'monospace' }}>{markerFormData.color}</span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeMarkerModal}>Cancelar</button>
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Guardar Marcador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-view { padding: 20px; max-width: 1000px; margin: 0 auto; }
        .view-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        h1 { font-size: 1.8rem; font-weight: 700; color: #1e293b; margin: 0; }
        .add-btn { background: #0d9488; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        
        .tabs-container { display: flex; gap: 8px; border-bottom: 1.5px solid #e2e8f0; margin-bottom: 24px; padding-bottom: 2px; }
        .tab-btn { background: none; border: none; padding: 10px 16px; font-size: 0.95rem; font-weight: 600; color: #64748b; cursor: pointer; display: flex; align-items: center; gap: 8px; border-bottom: 3px solid transparent; transition: all 0.2s ease; }
        .tab-btn.active { color: #0d9488; border-bottom-color: #0d9488; }
        
        .content-card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
        .toolbar { padding: 20px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        .search-wrapper { position: relative; flex: 1; max-width: 400px; }
        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .search-wrapper input { width: 100%; padding: 10px 10px 10px 38px; border: 1.5px solid #e2e8f0; border-radius: 8px; outline: none; }
        
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th { padding: 15px 20px; text-align: left; background: #f8fafc; font-size: 0.8rem; color: #64748b; text-transform: uppercase; }
        .admin-table td { padding: 15px 20px; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }
        .bold { font-weight: 600; color: #1e293b; }
        
        .badge-status { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px; font-weight: 600; font-size: 0.8rem; }
        .badge-success { background: #dcfce7; color: #15803d; }
        .badge-warning { background: #ffedd5; color: #c2410c; }
        .badge-danger { background: #fee2e2; color: #b91c1c; }
        .badge-default { background: #f1f5f9; color: #475569; }
        
        .description-cell { color: #475569; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .coord-badge { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; font-family: monospace; margin-right: 4px; color: #475569; }
        
        .marker-color-preview { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        
        .actions-cell { display: flex; gap: 8px; }
        .icon-btn { width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; background: #f1f5f9; color: #64748b; }
        .icon-btn.edit:hover { background: #0d948815; color: #0d9488; }
        .icon-btn.delete:hover { background: #ef444415; color: #ef4444; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal-content { max-width: 500px; width: 100%; background: white; border-radius: 20px; overflow: hidden; }
        .modal-header { padding: 20px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        .modal-body { padding: 20px; }
        
        .form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
        .form-group label { font-size: 0.85rem; font-weight: 600; color: #475569; }
        .form-group input, .admin-select, .admin-textarea { padding: 10px; border: 1.5px solid #e2e8f0; border-radius: 10px; outline: none; }
        .admin-textarea { resize: vertical; font-family: inherit; }
        .admin-color-picker { width: 50px; height: 36px; border: 1.5px solid #e2e8f0; border-radius: 8px; cursor: pointer; padding: 0; }
        
        .modal-footer { padding: 20px; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 12px; }
        .btn-cancel { padding: 10px 20px; background: #f1f5f9; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .btn-save { padding: 10px 24px; background: #0d9488; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        
        .loading-state { padding: 50px; text-align: center; color: #64748b; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
