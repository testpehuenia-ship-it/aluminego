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

const baseTypes = ["Supermercado", "Mercado", "Kiosco", "Farmacia", "Ferretería", "Regalería", "Tienda de Ropa", "Otros"];

export default function CommercesAdminPage() {
  const [commerces, setCommerces] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [categories, setCategories] = React.useState<any[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingComm, setEditingComm] = React.useState<any>(null);
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    name: '',
    type: '',
    image: '',
    whatsapp: '',
    description: '',
    latitude: '-39.237200',
    longitude: '-70.931400',
    locality: 'Aluminé',
    details: '',
    selectedPricingKeys: [] as string[],
    openingHours: DEFAULT_SCHEDULE_STRING
  });
  
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
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
      const [commRes, catRes] = await Promise.all([
        fetch('/api/commerces'),
        fetch('/api/categories')
      ]);
      const commData = await commRes.json();
      const catData = await catRes.json();
      setCommerces(commData);
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

  const openModal = (comm: any = null) => {
    if (comm) {
      setEditingComm(comm);
      setFormData({
        name: comm.name,
        type: comm.type || '',
        image: comm.image || '',
        whatsapp: comm.whatsapp || '',
        description: comm.description || '',
        latitude: comm.latitude ? comm.latitude.toString() : '',
        longitude: comm.longitude ? comm.longitude.toString() : '',
        locality: comm.locality || 'Aluminé',
        details: comm.details?.map((d: any) => d.name).join(', ') || '',
        selectedPricingKeys: comm.subscription ? comm.subscription.planType.split(', ').filter(Boolean) : [],
        openingHours: comm.openingHours || ''
      });
    } else {
      setEditingComm(null);
      setFormData({ 
        name: '', 
        type: '', 
        image: '', 
        whatsapp: '', 
        description: '', 
        latitude: '-39.237200',
        longitude: '-70.931400',
        locality: 'Aluminé',
        details: '', 
        selectedPricingKeys: [],
        openingHours: DEFAULT_SCHEDULE_STRING
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingComm(null);
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
      e.target.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFormData(prev => {
      const currentImages = prev.image ? prev.image.split(',').filter(Boolean) : [];
      const updatedImages = currentImages.filter((_, idx) => idx !== indexToRemove);
      return { ...prev, image: updatedImages.join(',') };
    });
  };

  // Details functions removed since we unifiy details as simple comma-separated textarea

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
      const url = editingComm 
        ? `/api/commerces/${editingComm.id}` 
        : '/api/commerces';
      
      const method = editingComm ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          details: formData.details.split(',').map((d: string) => d.trim()).filter(Boolean)
        }),
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
        alert('Error al guardar el comercio');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este comercio?')) return;

    try {
      const res = await fetch(`/api/commerces/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setCommerces(commerces.filter(c => c.id !== id));
      } else {
        alert('Error al eliminar');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const filteredCommerces = commerces.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-view">
      <div className="view-header">
        <div>
          <h1>Comercios</h1>
          <p>Supermercados, kioscos, tiendas y farmacias locales</p>
        </div>
        <button className="add-btn" onClick={() => openModal()}>
          <Plus size={20} /> Nuevo Comercio
        </button>
      </div>

      <div className="content-card">
        <div className="toolbar">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar comercio..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="count-badge">{filteredCommerces.length} comercios</div>
        </div>

        {loading ? (
          <div className="loading-state">
            <Loader2 size={40} className="animate-spin" />
            <p>Cargando comercios...</p>
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
                  <th>Detalles</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCommerces.map((comm) => (
                  <tr key={comm.id}>
                    <td>
                      <div className="category-img-thumb">
                        {comm.image ? (
                          <img src={comm.image.split(',')[0]} alt={comm.name} />
                        ) : (
                          <ImageIcon size={20} />
                        )}
                      </div>
                    </td>
                    <td className="bold">{comm.name}</td>
                    <td><span className="badge">{comm.type}</span></td>
                    <td>
                      <div className="whatsapp-cell">
                        <MessageCircle size={14} /> {comm.whatsapp}
                      </div>
                    </td>
                    <td>
                      {comm.subscription && comm.subscription.planType ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {comm.subscription.planType.split(', ').map((plan: string, i: number) => {
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
                        {comm.details?.slice(0, 2).map((d: any) => (
                          <span key={d.id} className="feature-tag-small">{d.name}</span>
                        ))}
                        {(comm.details?.length || 0) > 2 && <span>+{(comm.details?.length || 0) - 2}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="icon-btn edit" title="Editar" onClick={() => openModal(comm)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="icon-btn delete" title="Eliminar" onClick={() => handleDelete(comm.id)}>
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
              <h2>{editingComm ? 'Editar Comercio' : 'Nuevo Comercio'}</h2>
              <button className="close-btn" onClick={closeModal}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body scrollable">
              <div className="form-grid">
                <div className="form-left">
                  <div className="form-group">
                    <label>Nombre del Comercio</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ej: Supermercado Aluminé"
                      required
                    />
                  </div>
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
                        .filter(cat => cat.link?.startsWith('/comercios'))
                        .map(cat => (
                          <option key={cat.id} value={cat.title}>{cat.title}</option>
                        ))
                      }
                      {formData.type && !categories.some(cat => cat.link?.startsWith('/comercios') && cat.title === formData.type) && (
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
                  <div className="form-group">
                    <label>Localidad</label>
                    <select
                      value={formData.locality}
                      onChange={(e) => setFormData({...formData, locality: e.target.value})}
                      className="admin-select"
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                    >
                      <option value="Aluminé">Aluminé</option>
                      <option value="Moquehue">Moquehue</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Imágenes del Comercio <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#64748b', marginLeft: '6px' }}>(Sube una o varias para el carrusel. Recomendado: 800x600px horizontal, Máx: 2MB)</span></label>
                    <div className="file-upload-wrapper">
                      <input 
                        type="file" 
                        id="comm-image"
                        accept="image/*"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="comm-image" className="file-upload-label">
                        {uploading ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
                        {formData.image ? 'Agregar Otra Imagen' : 'Subir Imagen Principal'}
                      </label>
                    </div>
                    {formData.image && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px', marginTop: '12px' }}>
                        {formData.image.split(',').filter(Boolean).map((imgUrl, idx) => (
                          <div key={idx} style={{ position: 'relative', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <img src={imgUrl} alt={`Preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button 
                               type="button" 
                               onClick={() => removeImage(idx)} 
                               style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-right">
                  <div className="form-group">
                    <label>Descripción del Comercio</label>
                    <textarea 
                      value={formData.description} 
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Ej: Amplio stock en comestibles, bebidas frías, verduras frescas y fiambrería..."
                      rows={4}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Detalles / Características (Separar por comas)</label>
                    <textarea 
                      value={formData.details} 
                      onChange={(e) => setFormData({...formData, details: e.target.value})}
                      placeholder="Ej: Acepta Tarjetas, Estacionamiento, Delivery, WiFi..."
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label>Horario de Atención</label>
                    <OpeningHoursEditor 
                      value={formData.openingHours} 
                      onChange={(val) => setFormData({...formData, openingHours: val})}
                    />
                  </div>

                  <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '16px', marginTop: '10px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <MapPin size={16} /> Geolocalización (Mapa)
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Latitud</label>
                        <input 
                          type="text" 
                          value={formData.latitude} 
                          onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                          placeholder="-39.2372"
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Longitud</label>
                        <input 
                          type="text" 
                          value={formData.longitude} 
                          onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                          placeholder="-70.9314"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn-save" disabled={saving || uploading}>
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {editingComm ? 'Guardar Cambios' : 'Crear Comercio'}
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
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#166534' }}>¡Comercio y Portal Creados!</h2>
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


