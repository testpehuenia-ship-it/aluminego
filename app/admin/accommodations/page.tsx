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
  MessageCircle,
  CheckCircle2,
  Check,
  Upload,
  DollarSign,
  MapPin
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import OpeningHoursEditor, { DEFAULT_SCHEDULE_STRING } from '@/components/admin/OpeningHoursEditor';

const baseTypes = ["Cabañas", "Hoteles", "Hostel", "Campings"];

export default function AccommodationsAdminPage() {
  const [accommodations, setAccommodations] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [categories, setCategories] = React.useState<any[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingAcc, setEditingAcc] = React.useState<any>(null);
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    name: '',
    type: '',
    image: '',
    whatsapp: '',
    description: '',
    features: [] as string[],
    selectedPricingKeys: [] as string[],
    latitude: '-38.87942114574949',
    longitude: '-71.18375154775678',
    openingHours: DEFAULT_SCHEDULE_STRING
  });
  
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [newFeature, setNewFeature] = React.useState('');
  const [pricingOptions, setPricingOptions] = React.useState<any[]>([]);
  const [generatedCredentials, setGeneratedCredentials] = React.useState<any>(null);

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
      const [accRes, catRes] = await Promise.all([
        fetch('/api/accommodations'),
        fetch('/api/categories')
      ]);
      const accData = await accRes.json();
      const catData = await catRes.json();
      setAccommodations(accData);
      setCategories(catData);

      const { getPricingConfigs } = await import('@/app/admin/pricing/actions');
      const pricingData = await getPricingConfigs();
      setPricingOptions(pricingData);
    } catch (e) {
      console.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const openModal = (acc: any = null) => {
    if (acc) {
      setEditingAcc(acc);
      setFormData({
        name: acc.name,
        type: acc.type || '',
        image: acc.image || '',
        whatsapp: acc.whatsapp || '',
        description: acc.description || '',
        features: acc.features?.map((f: any) => f.name) || [],
        selectedPricingKeys: acc.subscription ? acc.subscription.planType.split(', ').filter(Boolean) : [],
        latitude: acc.latitude ? acc.latitude.toString() : '',
        longitude: acc.longitude ? acc.longitude.toString() : '',
        openingHours: acc.openingHours || ''
      });
    } else {
      setEditingAcc(null);
      setFormData({ name: '', type: '', image: '', whatsapp: '', description: '', features: [], selectedPricingKeys: [], latitude: '-38.87942114574949', longitude: '-71.18375154775678', openingHours: DEFAULT_SCHEDULE_STRING });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAcc(null);
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
        setFormData(prev => {
          const currentImages = prev.image ? prev.image.split(',').filter(Boolean) : [];
          const updatedImages = [...currentImages, data.url];
          return { ...prev, image: updatedImages.join(',') };
        });
      } else {
        alert('Error al subir imagen: ' + data.error);
      }
    } catch (err) {
      alert('Error de conexión al subir');
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset standard file input to allow uploading again
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFormData(prev => {
      const currentImages = prev.image ? prev.image.split(',').filter(Boolean) : [];
      const updatedImages = currentImages.filter((_, idx) => idx !== indexToRemove);
      return { ...prev, image: updatedImages.join(',') };
    });
  };

  const addFeature = () => {
    if (newFeature && !formData.features.includes(newFeature)) {
      setFormData({...formData, features: [...formData.features, newFeature]});
      setNewFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    setFormData({...formData, features: formData.features.filter(f => f !== feature)});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones de Banners
    const hasCategoryBanner = formData.selectedPricingKeys.includes('banner_top') || formData.selectedPricingKeys.includes('banner_middle') || formData.selectedPricingKeys.includes('banner_bottom');
    const hasPortadaBanner = formData.selectedPricingKeys.includes('portada_principal');
    const hasComercioCompleto = formData.selectedPricingKeys.includes('plan_comercio_completo');

    if (hasCategoryBanner && !hasComercioCompleto) {
      alert('Para poder contratar un Banner de Categoría (Top, Middle o Bottom), primero debe seleccionar el Plan Comercio Completo.');
      return;
    }

    if (hasPortadaBanner && !hasCategoryBanner) {
      alert('Para tener un Banner en la Portada Principal, debe tener también un Banner de Categoría contratado.');
      return;
    }

    setSaving(true);

    try {
      const url = editingAcc 
        ? `/api/accommodations/${editingAcc.id}` 
        : '/api/accommodations';
      
      const method = editingAcc ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        await fetchData();
        closeModal();

        if (data.generatedCredentials) {
          const creds = {
            ...data.generatedCredentials,
            businessName: formData.name,
            whatsapp: formData.whatsapp
          };
          setGeneratedCredentials(creds);
          
          // Abrir WhatsApp automáticamente
          const cleanPhone = (creds.whatsapp || '').replace(/\D/g, '');
          const textMsg = `Hola! Bienvenido a AluminéGO. Ya puedes acceder a tu panel de control desde https://AluminéGO.ar/portal-comercial/login \n\nTu usuario es: ${creds.email}\nTu contraseña provisoria es: ${creds.password}\n\nTe sugerimos cambiarla al ingresar en la sección Editar Perfil.`;
          window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(textMsg)}`, '_blank');
        } else {
          const hasBanner = formData.selectedPricingKeys.some(k => k.includes('banner') || k.includes('portada'));
          if (hasBanner) {
            router.push(`/admin/publicity?businessName=${encodeURIComponent(formData.name)}`);
          }
        }
      } else {
        alert('Error al guardar el alojamiento');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este alojamiento?')) return;

    try {
      const res = await fetch(`/api/accommodations/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setAccommodations(accommodations.filter(a => a.id !== id));
      } else {
        alert('Error al eliminar');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const filteredAccommodations = accommodations.filter(acc => 
    acc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-view">
      <div className="view-header">
        <div>
          <h1>Alojamientos</h1>
          <p>Cabañas, hoteles y hostels</p>
        </div>
      </div>

      <div className="content-card">
        <div className="toolbar">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar alojamiento..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="count-badge">{filteredAccommodations.length} alojamientos</div>
        </div>

        {loading ? (
          <div className="loading-state">
            <Loader2 size={40} className="animate-spin" />
            <p>Cargando alojamientos...</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>WhatsApp</th>
                  <th>Plan Actual</th>
                  <th>Características</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccommodations.map((acc) => (
                  <tr key={acc.id}>
                    <td>
                      <div className="category-img-thumb">
                        {acc.image ? (
                          <img src={acc.image.split(',')[0]} alt={acc.name} />
                        ) : (
                          <ImageIcon size={20} />
                        )}
                      </div>
                    </td>
                    <td className="bold">{acc.name}</td>
                    <td><span className="badge">{acc.type}</span></td>
                    <td>
                      <div className="whatsapp-cell">
                        <MessageCircle size={14} /> {acc.whatsapp}
                      </div>
                    </td>
                    <td>
                      {acc.subscription && acc.subscription.planType ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {acc.subscription.planType.split(', ').map((plan: string, i: number) => {
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
                      <div className="features-list-inline">
                        {acc.features?.slice(0, 2).map((f: any) => (
                          <span key={f.id} className="feature-tag-small">{f.name}</span>
                        ))}
                        {(acc.features?.length || 0) > 2 && <span>+{(acc.features?.length || 0) - 2}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="icon-btn edit" title="Editar" onClick={() => openModal(acc)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="icon-btn delete" title="Eliminar" onClick={() => handleDelete(acc.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>{editingAcc ? 'Editar Alojamiento' : 'Nuevo Alojamiento'}</h2>
              <button className="close-btn" onClick={closeModal}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body scrollable">
              <div className="form-group">
                <label>Nombre del Alojamiento</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ej: Cabañas del Sol"
                  required
                />
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Tipo / Categoría</label>
                  <select 
                    value={formData.type} 
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    required
                    className="admin-select"
                  >
                    <option value="">Seleccionar Categoría</option>
                    {categories
                      .filter(cat => cat.link?.startsWith('/alojarse'))
                      .map(cat => (
                        <option key={cat.id} value={cat.title}>{cat.title}</option>
                      ))
                    }
                    {formData.type && !categories.some(cat => cat.link?.startsWith('/alojarse') && cat.title === formData.type) && (
                      <option value={formData.type}>{formData.type} (Categoría desactualizada)</option>
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label>WhatsApp (Sin espacios ni +)</label>
                  <input 
                    type="text" 
                    value={formData.whatsapp} 
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                    placeholder="5492942..."
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Descripción del Alojamiento</label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Ej: Hermosas cabañas frente al lago, con capacidad para 4 a 6 personas, totalmente equipadas con calefacción por radiadores, deck individual, parrilla y cochera cubierta."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    lineHeight: '1.5',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div className="form-group">
                <label>Imágenes del Alojamiento <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#64748b', marginLeft: '6px' }}>(Sube una o varias para el carrusel. Recomendado: 800x600px horizontal, Máx: 2MB)</span></label>
                <div className="file-upload-wrapper">
                  <input 
                    type="file" 
                    id="acc-image"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="acc-image" className="file-upload-label">
                    {uploading ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
                    {formData.image ? 'Agregar Otra Imagen (Para el Carrusel)' : 'Subir Imagen Principal'}
                  </label>
                </div>
                {formData.image && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px', marginTop: '16px' }}>
                    {formData.image.split(',').filter(Boolean).map((imgUrl, idx) => (
                      <div key={idx} style={{ position: 'relative', height: '90px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <img src={imgUrl} alt={`Preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button 
                          type="button" 
                          onClick={() => removeImage(idx)} 
                          style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Características / Servicios</label>
                <div className="features-input-group">
                  <input 
                    type="text" 
                    value={newFeature} 
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Ej: WiFi, Estacionamiento..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <button type="button" className="add-feature-btn" onClick={addFeature}>Agregar</button>
                </div>
                <div className="features-tags-container">
                  {formData.features.map(feature => (
                    <span key={feature} className="feature-tag-editable">
                      {feature}
                      <button type="button" onClick={() => removeFeature(feature)}><X size={14} /></button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Horario de Atención</label>
                <OpeningHoursEditor 
                  value={formData.openingHours} 
                  onChange={(val) => setFormData({...formData, openingHours: val})}
                />
              </div>

              <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '20px', marginTop: '10px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={18} /> Geolocalización en el Mapa
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '16px' }}>
                  Ingresa las coordenadas de latitud y longitud para mostrar el mapa al final de la ficha y ubicar el marcador.
                </p>
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Latitud (Ej: -38.8833)</label>
                    <input 
                      type="text" 
                      value={formData.latitude} 
                      onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                      placeholder="Coordenada latitud"
                    />
                  </div>
                  <div className="form-group">
                    <label>Longitud (Ej: -71.1667)</label>
                    <input 
                      type="text" 
                      value={formData.longitude} 
                      onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                      placeholder="Coordenada longitud"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn-save" disabled={saving || uploading}>
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {editingAcc ? 'Guardar Cambios' : 'Crear Alojamiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* Modal de Credenciales Generadas */}
      {generatedCredentials && (
        <div className="modal-overlay" onClick={() => setGeneratedCredentials(null)}>
          <div className="modal-content" style={{ maxWidth: '500px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ backgroundColor: '#dcfce7', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#166534' }}>
              <Check size={30} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#166534' }}>¡Alojamiento y Portal Creados!</h2>
            <p style={{ color: '#475569', marginBottom: '24px' }}>
              Se ha generado automáticamente el acceso para <strong>{generatedCredentials.businessName}</strong>.
            </p>
            
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px', textAlign: 'left' }}>
              <p style={{ margin: '0 0 8px', fontSize: '0.9rem', color: '#64748b' }}>Usuario (Email):</p>
              <p style={{ margin: '0 0 16px', fontWeight: 'bold', fontSize: '1.1rem' }}>{generatedCredentials.email}</p>
              
              <p style={{ margin: '0 0 8px', fontSize: '0.9rem', color: '#64748b' }}>Contraseña Provisoria:</p>
              <p style={{ margin: '0', fontWeight: 'bold', fontSize: '1.1rem' }}>{generatedCredentials.password}</p>
            </div>

            <a 
              href={`https://wa.me/${(generatedCredentials.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Bienvenido a AluminéGO. Ya puedes acceder a tu panel de control desde https://AluminéGO.ar/portal-comercial/login \n\nTu usuario es: ${generatedCredentials.email}\nTu contraseña provisoria es: ${generatedCredentials.password}\n\nTe sugerimos cambiarla al ingresar en la sección Editar Perfil.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ width: '100%', padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '1.1rem', textDecoration: 'none', backgroundColor: '#25D366', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}
              onClick={() => setGeneratedCredentials(null)}
            >
              <MessageCircle size={24} /> Enviar Datos por WhatsApp
            </a>
            
            <button 
              onClick={() => setGeneratedCredentials(null)}
              style={{ marginTop: '16px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 600 }}
            >
              Cerrar y continuar
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        h1 { font-size: 1.875rem; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
        p { color: #64748b; }
        .view-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .add-btn { background: #0d9488; color: white; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; }
        .add-btn:hover { background: #0f766e; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(13, 148, 136, 0.2); }
        .content-card { background: white; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; }
        .toolbar { padding: 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; gap: 20px; }
        .search-wrapper { position: relative; flex: 1; max-width: 400px; }
        .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .search-wrapper input { width: 100%; padding: 10px 10px 10px 42px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.9rem; outline: none; transition: all 0.2s; }
        .search-wrapper input:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1); }
        .count-badge { background: #f1f5f9; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; color: #64748b; }
        .table-container { overflow-x: auto; }
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th { padding: 16px 24px; text-align: left; font-size: 0.75rem; text-transform: uppercase; color: #64748b; font-weight: 600; background: #f8fafc; border-bottom: 1px solid #f1f5f9; }
        .admin-table td { padding: 16px 24px; font-size: 0.9rem; border-bottom: 1px solid #f1f5f9; }
        .bold { font-weight: 600; color: #1e293b; }
        .category-img-thumb { width: 64px; height: 48px; border-radius: 10px; background: #f1f5f9; overflow: hidden; display: flex; align-items: center; justify-content: center; color: #94a3b8; }
        .category-img-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .badge { background: #f0fdf4; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; color: #16a34a; font-weight: 600; }
        .whatsapp-cell { display: flex; align-items: center; gap: 6px; color: #0d9488; font-weight: 500; }
        .features-list-inline { display: flex; gap: 4px; flex-wrap: wrap; }
        .feature-tag-small { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; color: #64748b; }
        .actions-cell { display: flex; gap: 8px; }
        .icon-btn { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: all 0.2s; background: #f1f5f9; color: #64748b; }
        .icon-btn.edit:hover { background: #0d948815; color: #0d9488; }
        .icon-btn.delete:hover { background: #ef444415; color: #ef4444; }
        
        /* Modal Styles */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal-content { background: white; width: 100%; max-width: 500px; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); animation: modalSlide 0.3s ease-out; }
        .modal-content.large { max-width: 650px; }
        @keyframes modalSlide { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .modal-header { padding: 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        .modal-header h2 { font-size: 1.25rem; font-weight: 700; color: #1e293b; }
        .close-btn { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px; border-radius: 8px; transition: all 0.2s; }
        .close-btn:hover { background: #f1f5f9; color: #1e293b; }
        .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
        .modal-body.scrollable { max-height: 85vh; overflow-y: auto; }
        
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-size: 0.85rem; font-weight: 600; color: #475569; }
        .form-group input, .admin-select { width: 100%; padding: 12px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-size: 0.95rem; transition: all 0.2s; outline: none; }
        .form-group input:focus, .admin-select:focus { border-color: #0d9488; box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1); }
        .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        
        .file-upload-wrapper { display: flex; flex-direction: column; gap: 8px; }
        .file-upload-label { border: 2px dashed #e2e8f0; padding: 20px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; gap: 10px; color: #64748b; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .file-upload-label:hover { border-color: #0d9488; background: #f0fdfa; color: #0d9488; }
        .image-preview.wide { width: 100%; height: 160px; border-radius: 12px; overflow: hidden; background: #f1f5f9; border: 1px solid #e2e8f0; }
        .image-preview img { width: 100%; height: 100%; object-fit: cover; }

        .features-input-group { display: flex; gap: 8px; }
        .add-feature-btn { background: #1e293b; color: white; border: none; padding: 0 16px; border-radius: 10px; font-weight: 600; cursor: pointer; }
        .features-tags-container { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
        .feature-tag-editable { background: #f1f5f9; color: #475569; padding: 6px 12px; border-radius: 50px; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 6px; }
        .feature-tag-editable button { background: none; border: none; color: #94a3b8; cursor: pointer; display: flex; align-items: center; }
        .feature-tag-editable button:hover { color: #ef4444; }

        .modal-footer { margin-top: 12px; display: flex; justify-content: flex-end; gap: 12px; }
        .btn-cancel { padding: 12px 20px; background: #f1f5f9; color: #475569; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-save { padding: 12px 24px; background: #0d9488; color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
        
        .loading-state { padding: 60px; display: flex; flex-direction: column; align-items: center; gap: 16px; color: #64748b; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}


