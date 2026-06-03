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
  Mountain,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdventuresAdminPage() {
  const [adventures, setAdventures] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingAdventure, setEditingAdventure] = React.useState<any>(null);
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    name: '',
    image: '',
    whatsapp: '',
    category: '',
    description: '',
    details: '',
    selectedPricingKeys: [] as string[]
  });
  
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [pricingOptions, setPricingOptions] = React.useState<any[]>([]);

  const categories = ["Trekking", "A. Acuaticas", "Cabalgatas", "Nieve", "Pesca", "Agencia de turismo"];

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
      const res = await fetch('/api/adventures');
      const data = await res.json();
      setAdventures(data);

      const { getPricingConfigs } = await import('@/app/admin/pricing/actions');
      const pricingData = await getPricingConfigs();
      setPricingOptions(pricingData);
    } catch (e) {
      console.error('Error fetching adventures');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const openModal = (adventure: any = null) => {
    if (adventure) {
      setEditingAdventure(adventure);
      setFormData({
        name: adventure.name,
        image: adventure.image || '',
        whatsapp: adventure.whatsapp || '',
        category: adventure.category || '',
        description: adventure.description || '',
        details: adventure.details || '',
        selectedPricingKeys: adventure.subscription ? adventure.subscription.planType.split(', ').filter(Boolean) : []
      });
    } else {
      setEditingAdventure(null);
      setFormData({ name: '', image: '', whatsapp: '', category: '', description: '', details: '', selectedPricingKeys: [] });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAdventure(null);
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
      } else {
        alert('Error al subir imagen: ' + data.error);
      }
    } catch (err) {
      alert('Error de conexión al subir');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingAdventure 
        ? `/api/adventures/${editingAdventure.id}` 
        : '/api/adventures';
      
      const method = editingAdventure ? 'PUT' : 'POST';

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
        alert('Error al guardar la aventura');
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta aventura?')) return;

    try {
      const res = await fetch(`/api/adventures/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAdventures(adventures.filter(a => a.id !== id));
      } else {
        alert('Error al eliminar');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const filteredAdventures = adventures.filter(adv => 
    adv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adv.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-view">
      <div className="view-header">
        <div>
          <h1>Aventuras</h1>
          <p>Gestiona las actividades al aire libre y excursiones</p>
        </div>
        <button className="add-btn" onClick={() => openModal()}>
          <Plus size={20} /> Nueva Aventura
        </button>
      </div>

      <div className="content-card">
        <div className="toolbar">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar aventura o categoría..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="count-badge">{filteredAdventures.length} aventuras</div>
        </div>

        {loading ? (
          <div className="loading-state">
            <Loader2 size={40} className="animate-spin" />
            <p>Cargando aventuras...</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>WhatsApp</th>
                  <th>Plan Actual</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdventures.map((adv) => (
                  <tr key={adv.id}>
                    <td>
                      <div className="category-img-thumb">
                        {adv.image ? (
                          <img src={adv.image} alt={adv.name} />
                        ) : (
                          <ImageIcon size={20} />
                        )}
                      </div>
                    </td>
                    <td className="bold">{adv.name}</td>
                    <td><span className="badge-category">{adv.category}</span></td>
                    <td>{adv.whatsapp}</td>
                    <td>
                      {adv.subscription && adv.subscription.planType ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {adv.subscription.planType.split(', ').map((plan: string, i: number) => {
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
                    <td>
                      <div className="actions-cell">
                        <button className="icon-btn edit" onClick={() => openModal(adv)}><Edit2 size={16} /></button>
                        <button className="icon-btn delete" onClick={() => handleDelete(adv.id)}><Trash2 size={16} /></button>
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
          <div className="modal-content large">
            <div className="modal-header">
              <h2>{editingAdventure ? 'Editar Aventura' : 'Nueva Aventura'}</h2>
              <button className="close-btn" onClick={closeModal}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body scrollable">
              <div className="form-grid">
                <div className="form-left">
                  <div className="form-group">
                    <label>Nombre de la Actividad / Prestador</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ej: Guía de Pesca Juan Pérez"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Categoría</label>
                    <select 
                      value={formData.category} 
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      required
                      className="admin-select"
                    >
                      <option value="">Seleccionar Categoría</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>WhatsApp</label>
                    <input 
                      type="text" 
                      value={formData.whatsapp} 
                      onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                      placeholder="5492942..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Imagen <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#64748b', marginLeft: '6px' }}>(Recomendado: 800x600px horizontal, Máx: 2MB)</span></label>
                    <div className="file-upload-wrapper">
                      <input 
                        type="file" 
                        id="adv-image"
                        accept="image/*"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="adv-image" className="file-upload-label">
                        {uploading ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
                        {formData.image ? 'Cambiar Imagen' : 'Subir Imagen'}
                      </label>
                    </div>
                    {formData.image && (
                      <div className="image-preview">
                        <img src={formData.image} alt="Preview" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-right">
                  <div className="form-group">
                    <label>Descripción</label>
                    <textarea 
                      value={formData.description} 
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe la experiencia..."
                      rows={4}
                    />
                  </div>
                  <div className="form-group">
                    <label>Detalles / Características (Separar por comas)</label>
                    <textarea 
                      value={formData.details} 
                      onChange={(e) => setFormData({...formData, details: e.target.value})}
                      placeholder="Ej: Equipamiento incluido, Guía bilingüe, Seguro..."
                      rows={4}
                    />
                    <div className="details-preview">
                      {formData.details.split(',').filter(d => d.trim()).map((d, i) => (
                        <span key={i} className="detail-tag"><CheckCircle2 size={12} /> {d.trim()}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección Facturación */}
              <div className="modal-section" style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginTop: '16px' }}>
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
                  Guardar Aventura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-view { padding: 20px; max-width: 1100px; margin: 0 auto; }
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
        .badge-category { background: #f0fdf4; color: #166534; padding: 4px 10px; border-radius: 20px; font-weight: 600; font-size: 0.8rem; }
        
        .category-img-thumb { width: 50px; height: 50px; border-radius: 8px; overflow: hidden; background: #f1f5f9; display: flex; align-items: center; justify-content: center; }
        .category-img-thumb img { width: 100%; height: 100%; object-fit: cover; }
        
        .actions-cell { display: flex; gap: 8px; }
        .icon-btn { width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; background: #f1f5f9; color: #64748b; }
        .icon-btn.edit:hover { background: #0d948815; color: #0d9488; }
        .icon-btn.delete:hover { background: #ef444415; color: #ef4444; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal-content.large { max-width: 900px; width: 100%; background: white; border-radius: 20px; overflow: hidden; max-height: 90vh; display: flex; flex-direction: column; }
        .modal-header { padding: 20px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        .modal-body { padding: 20px; overflow-y: auto; }
        
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
        .form-group label { font-size: 0.85rem; font-weight: 600; color: #475569; }
        .form-group input, .admin-select, textarea { padding: 12px; border: 1.5px solid #e2e8f0; border-radius: 10px; outline: none; }
        
        .file-upload-label { border: 2px dashed #e2e8f0; padding: 15px; border-radius: 10px; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; font-weight: 600; color: #64748b; }
        .image-preview { margin-top: 10px; height: 150px; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; }
        .image-preview img { width: 100%; height: 100%; object-fit: cover; }
        
        .details-preview { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .detail-tag { background: #f1f5f9; padding: 4px 8px; border-radius: 6px; font-size: 0.8rem; display: flex; align-items: center; gap: 4px; color: #475569; }
        
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
