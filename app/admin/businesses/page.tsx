'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  X,
  Save,
  MessageCircle,
  UtensilsCrossed,
  Upload,
  Info,
  DollarSign,
  Check,
  MapPin
} from 'lucide-react';
import OpeningHoursEditor, { DEFAULT_SCHEDULE_STRING } from '@/components/admin/OpeningHoursEditor';

export default function BusinessesAdminPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [pricingOptions, setPricingOptions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingBusiness, setEditingBusiness] = React.useState<any>(null);
  const [formData, setFormData] = React.useState({
    name: '',
    image: '',
    whatsapp: '',
    categoryId: '',
    menu: [] as any[],
    selectedPricingKeys: [] as string[],
    description: '',
    details: '',
    latitude: '-39.237200',
    longitude: '-70.931400',
    openingHours: DEFAULT_SCHEDULE_STRING
  });
  
  const [uploading, setUploading] = React.useState(false);
  const [uploadingItem, setUploadingItem] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [generatedCredentials, setGeneratedCredentials] = React.useState<any>(null);

  // Menu Item Local State (dentro del modal)
  const [newMenuItem, setNewMenuItem] = React.useState({ name: '', description: '', price: '', image: '' });
  const [editingMenuItemId, setEditingMenuItemId] = React.useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [bizRes, catRes] = await Promise.all([
        fetch('/api/businesses'),
        fetch('/api/categories')
      ]);
      const bizData = await bizRes.json();
      const catData = await catRes.json();
      setBusinesses(bizData);
      setCategories(catData);

      // Fetch pricing options for subscriptions
      const { getPricingConfigs } = await import('@/app/admin/pricing/actions');
      const pricingData = await getPricingConfigs();
      setPricingOptions(pricingData);
    } catch (e) {
      console.error('Error fetching data', e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const openModal = (business: any = null) => {
    if (business) {
      setEditingBusiness(business);
      setFormData({
        name: business.name,
        image: business.image || '',
        whatsapp: business.whatsapp || '',
        categoryId: business.categoryId || '',
        menu: business.menu || [],
        selectedPricingKeys: business.subscription ? business.subscription.planType.split(', ').filter(Boolean) : [],
        description: business.description || '',
        details: business.details || '',
        latitude: business.latitude ? business.latitude.toString() : '',
        longitude: business.longitude ? business.longitude.toString() : '',
        openingHours: business.openingHours || ''
      });
    } else {
      setEditingBusiness(null);
      setFormData({ name: '', image: '', whatsapp: '', categoryId: '', menu: [], selectedPricingKeys: [], description: '', details: '', latitude: '-39.237200', longitude: '-70.931400', openingHours: DEFAULT_SCHEDULE_STRING });
    }
    setNewMenuItem({ name: '', description: '', price: '', image: '' });
    setEditingMenuItemId(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBusiness(null);
    setEditingMenuItemId(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'business' | 'menuItem' = 'business') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (target === 'business') setUploading(true);
    else setUploadingItem(true);

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });
      const data = await res.json();
      if (data.success) {
        if (target === 'business') {
          setFormData(prev => ({ ...prev, image: data.url }));
        } else {
          setNewMenuItem(prev => ({ ...prev, image: data.url }));
        }
      } else {
        alert('Error al subir imagen: ' + data.error);
      }
    } catch (err) {
      alert('Error de conexión al subir');
    } finally {
      setUploading(false);
      setUploadingItem(false);
    }
  };

  const saveMenuItem = () => {
    if (!newMenuItem.name || !newMenuItem.price) {
      alert('Nombre y Precio son obligatorios');
      return;
    }

    if (editingMenuItemId) {
      setFormData(prev => ({
        ...prev,
        menu: prev.menu.map(m => m.id === editingMenuItemId ? { ...newMenuItem, id: editingMenuItemId } : m)
      }));
      setEditingMenuItemId(null);
    } else {
      setFormData(prev => ({
        ...prev,
        menu: [...prev.menu, { ...newMenuItem, id: Date.now().toString() }]
      }));
    }
    setNewMenuItem({ name: '', description: '', price: '', image: '' });
  };

  const startEditMenuItem = (item: any) => {
    setNewMenuItem({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      image: item.image || ''
    });
    setEditingMenuItemId(item.id);
  };

  const cancelEditMenuItem = () => {
    setNewMenuItem({ name: '', description: '', price: '', image: '' });
    setEditingMenuItemId(null);
  };

  const removeMenuItem = (id: string) => {
    if (editingMenuItemId === id) {
      cancelEditMenuItem();
    }
    setFormData(prev => ({
      ...prev,
      menu: prev.menu.filter(m => m.id !== id)
    }));
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

    // Auto-commit any in-progress menu item before sending to the backend
    let finalMenu = [...formData.menu];
    if (newMenuItem.name.trim() && newMenuItem.price) {
      if (editingMenuItemId) {
        finalMenu = finalMenu.map(m => m.id === editingMenuItemId ? { ...newMenuItem, id: editingMenuItemId } : m);
      } else {
        finalMenu = [...finalMenu, { ...newMenuItem, id: Date.now().toString() }];
      }
    }

    try {
      const url = editingBusiness 
        ? `/api/businesses/${editingBusiness.id}` 
        : '/api/businesses';
      
      const method = editingBusiness ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          menu: finalMenu
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
          // Check if any banner plans were selected
          const hasBanner = formData.selectedPricingKeys.some(k => k.includes('banner') || k.includes('portada'));
          if (hasBanner) {
            router.push(`/admin/publicity?businessName=${encodeURIComponent(formData.name)}`);
          }
        }
      } else {
        const errorData = await res.json();
        alert('Error al guardar el comercio: ' + (errorData.error || res.statusText));
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
      const res = await fetch(`/api/businesses/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setBusinesses(businesses.filter(b => b.id !== id));
      } else {
        alert('Error al eliminar');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const filteredBusinesses = businesses.filter(biz => 
    biz.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-view">
      <div className="view-header">
        <div>
          <h1>Comercios</h1>
          <p>Gestiona los locales, restaurantes y tiendas</p>
        </div>
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
          <div className="count-badge">{filteredBusinesses.length} comercios</div>
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
                  <th>Categoría</th>
                  <th>WhatsApp/Tel</th>
                  <th>Plan Actual</th>
                  <th>MenÁº</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredBusinesses.map((biz) => (
                  <tr key={biz.id}>
                    <td>
                      <div className="category-img-thumb">
                        {biz.image ? (
                          <img src={biz.image} alt={biz.name} />
                        ) : (
                          <ImageIcon size={20} />
                        )}
                      </div>
                    </td>
                    <td className="bold">{biz.name}</td>
                    <td><span className="badge">{biz.category?.title || 'Sin Categoría'}</span></td>
                    <td>
                      <div className="whatsapp-cell">
                        <MessageCircle size={14} /> {biz.whatsapp}
                      </div>
                    </td>
                    <td>
                      <button className="menu-count-btn" onClick={() => openModal(biz)}>
                        <UtensilsCrossed size={14} /> {biz.menu?.length || 0} items
                      </button>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="icon-btn edit" title="Editar" onClick={() => openModal(biz)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="icon-btn delete" title="Eliminar" onClick={() => handleDelete(biz.id)}>
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
          <div className="modal-content extra-large">
            <div className="modal-header">
              <h2>{editingBusiness ? 'Editar Comercio' : 'Nuevo Comercio'}</h2>
              <button className="close-btn" onClick={closeModal}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body scrollable">
              <div className="modal-grid-2">
                {/* Sección General */}
                <div className="modal-section">
                  <h3 className="section-title"><Info size={18} /> Información General</h3>
                  <div className="form-group">
                    <label>Nombre del Comercio</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ej: La Pizzería, El Buffet..."
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Categoría</label>
                    <select 
                      value={formData.categoryId} 
                      onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                      required
                      className="admin-select"
                    >
                      <option value="">Seleccionar Categoría</option>
                      {categories
                        .filter(cat => cat.link?.startsWith('/comer') && !cat.link?.startsWith('/comercios'))
                        .map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.title}</option>
                        ))
                      }
                    </select>
                  </div>
                  <div className="form-group">
                    <label>WhatsApp (Sin espacios ni +)</label>
                    <input 
                      type="text" 
                      value={formData.whatsapp} 
                      onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                      placeholder="5492942..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Imagen del Comercio <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#64748b', marginLeft: '6px' }}>(Recomendado: 800x600px o 500x500px, Máx: 2MB)</span></label>
                    <div className="file-upload-wrapper">
                      <input 
                        type="file" 
                        id="biz-image"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'business')}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="biz-image" className="file-upload-label">
                        {uploading ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
                        {formData.image ? 'Cambiar Imagen' : 'Subir Imagen'}
                      </label>
                    </div>
                    {formData.image && (
                      <div className="image-preview large">
                        <img src={formData.image} alt="Preview" />
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Descripción del Comercio</label>
                    <textarea 
                      value={formData.description} 
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Ej: Restaurant con especialidad en chivito y trucha..."
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label>Detalles / Características (Separar por comas)</label>
                    <textarea 
                      value={formData.details} 
                      onChange={(e) => setFormData({...formData, details: e.target.value})}
                      placeholder="Ej: WiFi, Estacionamiento, Tarjetas de crédito..."
                      rows={2}
                    />
                  </div>
                  <div className="form-group">
                    <label>Horario de Atención</label>
                    <OpeningHoursEditor 
                      value={formData.openingHours} 
                      onChange={(val) => setFormData({...formData, openingHours: val})}
                    />
                  </div>
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '16px' }}>
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

                {/* Sección MenÁº */}
                <div className="modal-section">
                  <h3 className="section-title"><UtensilsCrossed size={18} /> Gestión del MenÁº</h3>
                  
                  <div 
                    className="menu-form" 
                    style={{
                      border: editingMenuItemId ? '2px solid #0d9488' : '1px dashed #cbd5e1',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '16px',
                      transition: 'all 0.3s ease',
                      backgroundColor: editingMenuItemId ? '#f0fdfa' : '#f8fafc'
                    }}
                  >
                    <div className="form-row">
                      <div className="form-group" style={{ flex: 1 }}>
                        <label>Nombre del Plato</label>
                        <input 
                          type="text" 
                          value={newMenuItem.name} 
                          onChange={(e) => setNewMenuItem({...newMenuItem, name: e.target.value})}
                          placeholder="Ej: Pizza Muzzarella"
                        />
                      </div>
                      <div className="form-group" style={{ width: '120px' }}>
                        <label>Precio</label>
                        <div className="input-with-icon">
                          <DollarSign size={14} />
                          <input 
                            type="number" 
                            value={newMenuItem.price} 
                            onChange={(e) => setNewMenuItem({...newMenuItem, price: e.target.value})}
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Descripción</label>
                      <textarea 
                        value={newMenuItem.description} 
                        onChange={(e) => setNewMenuItem({...newMenuItem, description: e.target.value})}
                        placeholder="Ej: Salsa de tomate, mozzarella, aceitunas..."
                        rows={1}
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group" style={{ flex: 1 }}>
                        <label>Foto del Plato (Opcional)</label>
                        <div className="menu-item-upload">
                          <input 
                            type="file" 
                            id="menu-item-image"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'menuItem')}
                            style={{ display: 'none' }}
                          />
                          <label htmlFor="menu-item-image" className="item-upload-btn">
                            {uploadingItem ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                            {newMenuItem.image ? 'Cambiar Foto' : 'Subir Foto'}
                          </label>
                          {newMenuItem.image && (
                            <div className="item-preview-tiny">
                              <img src={newMenuItem.image} alt="Preview" />
                              <button type="button" onClick={() => setNewMenuItem({...newMenuItem, image: ''})}><X size={10} /></button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {editingMenuItemId && (
                          <button type="button" className="btn-cancel" onClick={cancelEditMenuItem} style={{ padding: '8px 16px', borderRadius: '10px' }}>
                            Cancelar
                          </button>
                        )}
                        <button type="button" className="btn-add-item" onClick={saveMenuItem} style={{ backgroundColor: editingMenuItemId ? '#0d9488' : '#1e293b' }}>
                          {editingMenuItemId ? <Check size={18} /> : <Plus size={18} />}
                          {editingMenuItemId ? 'Guardar' : 'Agregar'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="menu-list-container">
                    <label>Items en MenÁº ({formData.menu.length})</label>
                    <div className="menu-scroll-list">
                      {formData.menu.length === 0 ? (
                        <div className="empty-menu">AÁºn no hay platos en el menÁº</div>
                      ) : (
                        formData.menu.map((item, idx) => (
                          <div key={item.id || idx} className="menu-item-card-full">
                            {item.image && (
                              <div className="item-card-img">
                                <img src={item.image} alt={item.name} />
                              </div>
                            )}
                            <div className="item-card-info">
                              <div className="item-card-header">
                                <span className="item-card-title">{item.name}</span>
                                <span className="item-card-price">
                                  ${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(item.price)}
                                </span>
                              </div>
                              {item.description && <p className="item-card-desc">{item.description}</p>}
                            </div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button type="button" className="btn-remove-item" style={{ color: '#0d9488' }} onClick={() => startEditMenuItem(item)} title="Editar ítem">
                                <Edit2 size={14} />
                              </button>
                              <button type="button" className="btn-remove-item" onClick={() => removeMenuItem(item.id)} title="Eliminar ítem">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn-save" disabled={saving || uploading || uploadingItem}>
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {editingBusiness ? 'Guardar Cambios' : 'Crear Comercio'}
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

      <style jsx global>{`
        .admin-view { padding: 20px; max-width: 1200px; margin: 0 auto; }
        h1 { font-size: 1.875rem; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
        p { color: #64748b; }
        .view-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .add-btn { background: #0d9488; color: white; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; }
        .add-btn:hover { background: #0f766e; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(13, 148, 136, 0.2); }
        .content-card { background: white; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
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
        .category-img-thumb { width: 48px; height: 48px; border-radius: 10px; background: #f1f5f9; overflow: hidden; display: flex; align-items: center; justify-content: center; color: #94a3b8; }
        .category-img-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .badge { background: #f0fdfa; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; color: #0d9488; font-weight: 600; }
        .whatsapp-cell { display: flex; align-items: center; gap: 6px; color: #16a34a; font-weight: 500; font-size: 0.85rem; }
        .menu-count-btn { background: #f8fafc; border: 1px solid #e2e8f0; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; color: #64748b; cursor: pointer; display: flex; align-items: center; gap: 6px; }
        .actions-cell { display: flex; gap: 8px; }
        .icon-btn { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: all 0.2s; background: #f1f5f9; color: #64748b; }
        .icon-btn.edit:hover { background: #0d948815; color: #0d9488; }
        .icon-btn.delete:hover { background: #ef444415; color: #ef4444; }
        
        /* Modal Styles */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal-content.extra-large { max-width: 950px; background: white; width: 100%; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); animation: modalSlide 0.3s ease-out; overflow: hidden; }
        @keyframes modalSlide { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .modal-header { padding: 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        .modal-header h2 { font-size: 1.25rem; font-weight: 700; color: #1e293b; }
        .close-btn { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px; border-radius: 8px; transition: all 0.2s; }
        
        .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 24px; }
        .modal-body.scrollable { max-height: 85vh; overflow-y: auto; }
        
        .modal-grid-2 { display: grid; grid-template-columns: 1fr 1.2fr; gap: 40px; }
        .modal-section { display: flex; flex-direction: column; gap: 20px; }
        .section-title { font-size: 1rem; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 10px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; }
        
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-group label { font-size: 0.8rem; font-weight: 600; color: #475569; }
        .form-group input, .admin-select, textarea { width: 100%; padding: 10px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.9rem; outline: none; transition: all 0.2s; }
        .form-group input:focus, .admin-select:focus, textarea:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1); }
        
        .file-upload-label { border: 2px dashed #e2e8f0; padding: 16px; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 10px; color: #64748b; font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 0.9rem; }
        .file-upload-label:hover { border-color: #0d9488; background: #f0fdfa; color: #0d9488; }
        .image-preview.large { width: 100%; height: 160px; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; margin-top: 10px; }
        .image-preview img { width: 100%; height: 100%; object-fit: cover; }
        
        .menu-form { background: #f8fafc; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 16px; }
        .form-row { display: flex; gap: 12px; align-items: flex-end; }
        .input-with-icon { position: relative; display: flex; align-items: center; width: 100%; }
        .input-with-icon :global(svg) { position: absolute; left: 10px; color: #94a3b8; }
        .input-with-icon input { padding-left: 30px; }
        .btn-add-item { background: #0d9488; color: white; border: none; height: 42px; padding: 0 20px; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }
        
        .menu-item-upload { display: flex; align-items: center; gap: 12px; background: white; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 4px 12px; height: 42px; }
        .item-upload-btn { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; font-weight: 600; color: #64748b; cursor: pointer; }
        .item-preview-tiny { display: flex; align-items: center; gap: 8px; background: #f1f5f9; padding: 2px 6px; border-radius: 6px; }
        .item-preview-tiny img { width: 24px; height: 24px; object-fit: cover; border-radius: 4px; }
        .item-preview-tiny button { background: #ef4444; color: white; border: none; border-radius: 50%; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        
        .menu-scroll-list { border: 1.5px solid #f1f5f9; border-radius: 16px; max-height: 350px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding: 10px; background: #f8fafc; }
        .menu-item-card-full { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; display: flex; gap: 12px; align-items: flex-start; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .item-card-img { width: 60px; height: 60px; border-radius: 8px; overflow: hidden; flex-shrink: 0; }
        .item-card-img img { width: 100%; height: 100%; object-fit: cover; }
        .item-card-info { flex: 1; min-width: 0; }
        .item-card-header { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; margin-bottom: 4px; }
        .item-card-title { font-weight: 700; color: #1e293b; font-size: 0.95rem; }
        .item-card-price { color: #0d9488; font-weight: 800; font-size: 0.9rem; white-space: nowrap; }
        .item-card-desc { font-size: 0.8rem; color: #64748b; margin: 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        
        .modal-footer { padding: 20px 24px; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 12px; background: white; }
        .btn-cancel { padding: 10px 20px; background: #f1f5f9; color: #475569; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; }
        .btn-save { padding: 10px 24px; background: #0d9488; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        .btn-save:disabled { opacity: 0.7; cursor: not-allowed; }

        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 900px) {
          .modal-grid-2 { grid-template-columns: 1fr; gap: 24px; }
          .modal-content.extra-large { max-width: 100%; }
        }
      `}</style>
    </div>
  );
}


