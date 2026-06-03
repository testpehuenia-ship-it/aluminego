'use client';

import React from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Image as ImageIcon,
  Loader2,
  X,
  Save,
  Upload,
  Phone,
  MapPin,
  Building2,
  DollarSign
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LocalServicesAdminPage() {
  const [services, setServices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingService, setEditingService] = React.useState<any>(null);
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    name: '',
    category: '',
    address: '',
    whatsapp: '',
    image: '',
    selectedPricingKeys: [] as string[]
  });
  
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [pricingOptions, setPricingOptions] = React.useState<any[]>([]);
  const [dynamicCategories, setDynamicCategories] = React.useState<string[]>([]);

  // Effect for Auto-checking plan when typing WhatsApp
  React.useEffect(() => {
    if (formData.whatsapp && formData.whatsapp.length > 5) {
      if (!formData.selectedPricingKeys.includes('plan_basico_destacado')) {
        setFormData(prev => ({
          ...prev,
          selectedPricingKeys: [...prev.selectedPricingKeys, 'plan_basico_destacado']
        }));
      }
    }
  }, [formData.whatsapp]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/local-services');
      const data = await res.json();
      setServices(data);

      const { getPricingConfigs } = await import('@/app/admin/pricing/actions');
      const pricingData = await getPricingConfigs();
      setPricingOptions(pricingData);

      // Extraer categorías únicas de los servicios existentes + las fijas
      const baseCats = ["Salud", "Seguridad", "Instituciones", "Transporte", "Comercios", "Servicios Profesionales", "Otros", "Todos los servicios"];
      const existingCats = Array.from(new Set(data.map((s: any) => s.category).filter(Boolean))) as string[];
      setDynamicCategories(Array.from(new Set([...baseCats, ...existingCats])));
    } catch (e) {
      console.error('Error fetching services');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const openModal = (service: any = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        category: service.category || '',
        address: service.address || '',
        whatsapp: service.whatsapp || '',
        image: service.image || '',
        selectedPricingKeys: service.subscription ? service.subscription.planType.split(', ').filter(Boolean) : []
      });
    } else {
      setEditingService(null);
      setFormData({ name: '', category: '', address: '', whatsapp: '', image: '', selectedPricingKeys: [] });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });
      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, image: data.url }));
      }
    } catch (err) {
      alert('Error al subir imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingService 
        ? `/api/local-services/${editingService.id}` 
        : '/api/local-services';
      
      const method = editingService ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchData();
        closeModal();

        const hasBanner = formData.selectedPricingKeys.some(k => k.includes('banner') || k.includes('portada'));
        if (hasBanner) {
          router.push(`/admin/publicity?businessName=${encodeURIComponent(formData.name)}`);
        }
      } else {
        alert('Error al guardar el servicio');
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return;

    try {
      const res = await fetch(`/api/local-services/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setServices(services.filter(s => s.id !== id));
      } else {
        alert('Error al eliminar');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-view">
      <div className="view-header">
        <div>
          <h1>Guía Local</h1>
          <p>Gestiona instituciones, servicios y comercios locales</p>
        </div>
        <button className="add-btn" onClick={() => openModal()}>
          <Plus size={20} /> Nuevo Registro
        </button>
      </div>

      <div className="content-card">
        <div className="toolbar">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar servicio..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="count-badge">{filteredServices.length} registros</div>
        </div>

        {loading ? (
          <div className="loading-state">
            <Loader2 size={40} className="animate-spin" />
            <p>Cargando guía local...</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Icono/Foto</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>WhatsApp/Tel</th>
                  <th>Plan Actual</th>
                  <th>Dirección</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="category-img-thumb">
                        {s.image ? (
                          <img src={s.image} alt={s.name} />
                        ) : (
                          <Building2 size={20} />
                        )}
                      </div>
                    </td>
                    <td className="bold">{s.name}</td>
                    <td><span className="badge-category">{s.category}</span></td>
                    <td>{s.whatsapp || 'N/A'}</td>
                    <td>
                      {s.subscription && s.subscription.planType ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {s.subscription.planType.split(', ').map((plan: string, i: number) => {
                            const matchedPlan = pricingOptions.find(p => p.key === plan);
                            return (
                              <span key={i} className="badge-plan" style={{ background: '#fef3c7', color: '#b45309', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-block', width: 'fit-content' }}>
                                {matchedPlan ? matchedPlan.name : plan}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="badge-plan" style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Gratis</span>
                      )}
                    </td>
                    <td>{s.address || 'Sin dirección'}</td>
                    <td>
                      <div className="actions-cell">
                        <button className="icon-btn edit" onClick={() => openModal(s)}><Edit2 size={16} /></button>
                        <button className="icon-btn delete" onClick={() => handleDelete(s.id)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingService ? 'Editar Registro' : 'Nuevo Registro'}</h2>
              <button className="close-btn" onClick={closeModal}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Nombre de la Institución/Servicio</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ej: Policía de Neuquén"
                  required
                />
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <input 
                  type="text"
                  list="categories-list"
                  value={formData.category} 
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                  className="admin-select"
                  placeholder="Selecciona o escribe una categoría"
                />
                <datalist id="categories-list">
                  {dynamicCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </datalist>
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <div className="input-with-icon">
                  <MapPin size={16} />
                  <input 
                    type="text" 
                    value={formData.address} 
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Ej: Calle Principal 123"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>WhatsApp / Teléfono</label>
                <div className="input-with-icon">
                  <Phone size={16} />
                  <input 
                    type="text" 
                    value={formData.whatsapp} 
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                    placeholder="Ej: 549..."
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Imagen / Logo (Opcional) <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#64748b', marginLeft: '6px' }}>(Recomendado: 500x500px cuadrado, Máx: 2MB)</span></label>
                <div className="file-upload-wrapper">
                  <input 
                    type="file" 
                    id="service-image"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="service-image" className="file-upload-label">
                    {uploading ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
                    Subir Imagen
                  </label>
                </div>
                {formData.image && (
                  <div className="image-preview">
                    <img src={formData.image} alt="Preview" />
                  </div>
                )}
              </div>

              {/* Sección Facturación */}
              <div className="modal-section" style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <h3 className="section-title" style={{ borderBottom: 'none', paddingBottom: 0, marginTop: 0 }}><DollarSign size={18} /> Facturación y Publicidad</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>Si escribes un teléfono, se marcará automáticamente el Plan Básico. Si deseas que sea gratis sin datos de contacto, puedes desmarcarlo.</p>
                  
                <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                  {pricingOptions.map(option => (
                    <label key={option.key} className="pricing-option" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '12px', borderRadius: '12px', border: formData.selectedPricingKeys.includes(option.key) ? '2px solid #0d9488' : '1px solid #cbd5e1', cursor: 'pointer', transition: 'all 0.2s' }}>
                      <input 
                        type="checkbox" 
                        checked={formData.selectedPricingKeys.includes(option.key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ ...prev, selectedPricingKeys: [...prev.selectedPricingKeys, option.key] }));
                          } else {
                            setFormData(prev => ({ ...prev, selectedPricingKeys: prev.selectedPricingKeys.filter(k => k !== option.key) }));
                          }
                        }}
                        style={{ width: '18px', height: '18px', accentColor: '#0d9488', cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.85rem' }}>{option.name}</div>
                        <div style={{ color: '#0d9488', fontWeight: 700, fontSize: '0.85rem' }}>${new Intl.NumberFormat('es-AR').format(option.price)}/mes</div>
                      </div>
                    </label>
                  ))}
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px', padding: '12px 16px', background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Total Mensual:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f766e' }}>
                    ${new Intl.NumberFormat('es-AR').format(
                      formData.selectedPricingKeys.reduce((sum, key) => sum + (pricingOptions.find(p => p.key === key)?.price || 0), 0)
                    )}
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn-save" disabled={saving || uploading}>
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Guardar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-view { padding: 20px; max-width: 1000px; margin: 0 auto; }
        .view-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        h1 { font-size: 1.8rem; font-weight: 700; color: #1e293b; margin: 0; }
        .add-btn { background: #0d9488; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        
        .content-card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
        .toolbar { padding: 20px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        .search-wrapper { position: relative; flex: 1; max-width: 400px; }
        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .search-wrapper input { width: 100%; padding: 10px 10px 10px 38px; border: 1.5px solid #e2e8f0; border-radius: 8px; outline: none; }
        
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th { padding: 15px 20px; text-align: left; background: #f8fafc; font-size: 0.8rem; color: #64748b; text-transform: uppercase; }
        .admin-table td { padding: 15px 20px; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }
        .bold { font-weight: 600; color: #1e293b; }
        .badge-category { background: #eff6ff; color: #1e40af; padding: 4px 10px; border-radius: 20px; font-weight: 600; font-size: 0.8rem; }
        
        .category-img-thumb { width: 40px; height: 40px; border-radius: 8px; overflow: hidden; background: #f1f5f9; display: flex; align-items: center; justify-content: center; }
        .category-img-thumb img { width: 100%; height: 100%; object-fit: cover; }
        
        .actions-cell { display: flex; gap: 8px; }
        .icon-btn { width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; background: #f1f5f9; color: #64748b; }
        .icon-btn.edit:hover { background: #0d948815; color: #0d9488; }
        .icon-btn.delete:hover { background: #ef444415; color: #ef4444; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal-content { max-width: 500px; width: 100%; background: white; border-radius: 20px; overflow: hidden; max-height: 90vh; display: flex; flex-direction: column; }
        .modal-header { padding: 20px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        .modal-body { padding: 20px; overflow-y: auto; }
        
        .form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
        .form-group label { font-size: 0.85rem; font-weight: 600; color: #475569; }
        .form-group input, .admin-select { padding: 10px; border: 1.5px solid #e2e8f0; border-radius: 10px; outline: none; }
        .input-with-icon { position: relative; display: flex; align-items: center; }
        .input-with-icon :global(svg) { position: absolute; left: 10px; color: #94a3b8; }
        .input-with-icon input { padding-left: 34px; width: 100%; }
        
        .file-upload-label { border: 2px dashed #e2e8f0; padding: 10px; border-radius: 10px; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; font-weight: 600; color: #64748b; }
        .image-preview { margin-top: 10px; height: 100px; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; }
        .image-preview img { width: 100%; height: 100%; object-fit: cover; }
        
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
