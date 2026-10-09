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
  MapPin,
  Key,
  Eye,
  EyeOff,
  Copy
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
    latitude: '-38.87942114574949',
    longitude: '-71.18375154775678',
    locality: 'Villa Pehuenia',
    details: '',
    features: [] as string[],
    selectedPricingKeys: [] as string[],
    openingHours: DEFAULT_SCHEDULE_STRING,
    isVerified: false,
    showSchedule: false,
    hasDelivery: false
  });
  
  const [newFeature, setNewFeature] = React.useState('');
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [pricingOptions, setPricingOptions] = React.useState<any[]>([]);
  const [generatedCredentials, setGeneratedCredentials] = React.useState<any>(null);

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (featureToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== featureToRemove)
    }));
  };

  const availableCommerceCategories = React.useMemo(() => {
    const dbCats = categories
      .filter(cat => cat.link?.startsWith('/comercios') || cat.link?.startsWith('/comer'))
      .map(cat => cat.title);
    const existingTypes = commerces.map(c => c.type).filter(Boolean);
    const presets = [
      "Supermercados y Almacenes",
      "Indumentaria y Calzado",
      "Farmacias y Salud",
      "Ferretería y Construcción",
      "Parques, Jardines, Mascotas",
      "Regionales y Artesanías",
      "Kioscos y Regalería",
      "Panaderías y Pastelerías",
      "Librerías y Fotografía",
      "Hogar y Decoración",
      "Servicios y Medios",
      "Forrajería y Agro",
      "Otros Comercios"
    ];
    return Array.from(new Set([...presets, ...dbCats, ...existingTypes])).filter(Boolean).sort();
  }, [categories, commerces]);

  // Password reset modal state
  const [resetModalData, setResetModalData] = React.useState<{
    isOpen: boolean;
    commerceName: string;
    whatsapp: string;
    loading: boolean;
    credentials: { email: string; newPassword: string } | null;
    showPassword: boolean;
    copied: boolean;
  }>({
    isOpen: false,
    commerceName: '',
    whatsapp: '',
    loading: false,
    credentials: null,
    showPassword: true,
    copied: false
  });

  // Products / Offers State
  const [productsList, setProductsList] = React.useState<any[]>([]);
  const [newProduct, setNewProduct] = React.useState<{ name: string; description: string; price: string; image: string }>({
    name: '',
    description: '',
    price: '',
    image: ''
  });
  const [editingProductIdx, setEditingProductIdx] = React.useState<number | null>(null);
  const [uploadingProductImg, setUploadingProductImg] = React.useState(false);

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
      let initialProducts: any[] = [];
      let initialFeatures: string[] = [];
      if (comm.details && Array.isArray(comm.details)) {
        comm.details.forEach((d: any) => {
          let parsed: any = null;
          try {
            if (typeof d.name === 'string' && d.name.trim().startsWith('{')) {
              parsed = JSON.parse(d.name);
            }
          } catch {}

          if (parsed) {
            if (parsed.type === 'feature' || parsed.isFeature) {
              if (parsed.name) initialFeatures.push(parsed.name);
            } else {
              initialProducts.push({
                name: parsed.name || '',
                description: parsed.description || '',
                price: parsed.price !== undefined && parsed.price !== null ? String(parsed.price) : '',
                image: parsed.image || ''
              });
            }
          } else if (d.name && typeof d.name === 'string' && d.name.trim()) {
            initialFeatures.push(d.name.trim());
          }
        });
      }
      setProductsList(initialProducts.slice(0, 5));
      setNewProduct({ name: '', description: '', price: '', image: '' });
      setNewFeature('');
      setEditingProductIdx(null);

      setFormData({
        name: comm.name,
        type: comm.type || '',
        image: comm.image || '',
        whatsapp: comm.whatsapp || '',
        description: comm.description || '',
        latitude: comm.latitude ? comm.latitude.toString() : '',
        longitude: comm.longitude ? comm.longitude.toString() : '',
        locality: comm.locality || 'Villa Pehuenia',
        details: '',
        features: Array.from(new Set(initialFeatures)),
        selectedPricingKeys: comm.subscription ? comm.subscription.planType.split(', ').filter(Boolean) : [],
        openingHours: comm.openingHours || '',
        isVerified: comm.isVerified || false,
        showSchedule: comm.showSchedule || false,
        hasDelivery: comm.hasDelivery || false
      });
    } else {
      setEditingComm(null);
      setProductsList([]);
      setNewProduct({ name: '', description: '', price: '', image: '' });
      setNewFeature('');
      setEditingProductIdx(null);
      setFormData({ 
        name: '', 
        type: '', 
        image: '', 
        whatsapp: '', 
        description: '', 
        latitude: '-38.87942114574949',
        longitude: '-71.18375154775678',
        locality: 'Villa Pehuenia',
        details: '', 
        features: [],
        selectedPricingKeys: [],
        openingHours: DEFAULT_SCHEDULE_STRING,
        isVerified: false,
        showSchedule: false,
        hasDelivery: false
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingComm(null);
    setProductsList([]);
    setNewProduct({ name: '', description: '', price: '', image: '' });
    setNewFeature('');
    setEditingProductIdx(null);
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProductImg(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });
      const data = await res.json();
      if (data.success) {
        setNewProduct(prev => ({ ...prev, image: data.url }));
      } else {
        alert('Error al subir imagen: ' + data.error);
      }
    } catch (err) {
      alert('Error de conexión al subir imagen');
    } finally {
      setUploadingProductImg(false);
      e.target.value = '';
    }
  };

  const handleSaveProduct = () => {
    if (!newProduct.name.trim()) {
      alert('El nombre o título del producto/oferta es obligatorio');
      return;
    }

    if (editingProductIdx !== null) {
      const updated = [...productsList];
      updated[editingProductIdx] = { ...newProduct };
      setProductsList(updated);
      setEditingProductIdx(null);
    } else {
      if (productsList.length >= 5) {
        alert('⚠️ Límite alcanzado: El máximo permitido es de 5 productos u ofertas. El comercio puede enviar su catálogo completo por WhatsApp.');
        return;
      }
      setProductsList([...productsList, { ...newProduct }]);
    }
    setNewProduct({ name: '', description: '', price: '', image: '' });
  };

  const handleEditProduct = (index: number) => {
    const item = productsList[index];
    setNewProduct({
      name: item.name || '',
      description: item.description || '',
      price: item.price !== undefined && item.price !== null ? String(item.price) : '',
      image: item.image || ''
    });
    setEditingProductIdx(index);
  };

  const handleCancelEditProduct = () => {
    setNewProduct({ name: '', description: '', price: '', image: '' });
    setEditingProductIdx(null);
  };

  const handleRemoveProduct = (index: number) => {
    setProductsList(prev => prev.filter((_, idx) => idx !== index));
    if (editingProductIdx === index) {
      handleCancelEditProduct();
    }
  };

  const handleResetPasswordClick = async (comm: any) => {
    const targetId = comm.portalUserId || comm.id;
    setResetModalData({
      isOpen: true,
      commerceName: comm.name,
      whatsapp: comm.whatsapp || '',
      loading: true,
      credentials: null,
      showPassword: true,
      copied: false
    });

    try {
      const res = await fetch(`/api/admin/portal-users/${targetId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResetModalData(prev => ({
          ...prev,
          loading: false,
          credentials: {
            email: data.email,
            newPassword: data.newPassword
          },
          whatsapp: data.whatsapp || comm.whatsapp || ''
        }));
      } else {
        alert(data.error || 'No se pudo generar nueva contraseña');
        setResetModalData(prev => ({ ...prev, isOpen: false, loading: false }));
      }
    } catch (e) {
      alert('Error de conexión al resetear contraseña');
      setResetModalData(prev => ({ ...prev, isOpen: false, loading: false }));
    }
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

      const productPayload = productsList.map((p: any) => JSON.stringify({
        name: p.name || '',
        description: p.description || '',
        price: p.price || '',
        image: p.image || ''
      }));

      const featurePayload = formData.features.map((f: string) => JSON.stringify({
        type: 'feature',
        name: f
      }));

      const detailsPayload = [...productPayload, ...featurePayload];

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          details: detailsPayload
        }),
      });

      if (res.ok) {
        const data = await res.json();
        await fetchData();
        closeModal();

        if (!editingComm && data.generatedCredentials && data.generatedCredentials.password && !data.generatedCredentials.password.includes('anteriormente')) {
          const creds = {
            ...data.generatedCredentials,
            businessName: formData.name,
            whatsapp: formData.whatsapp
          };
          setGeneratedCredentials(creds);
          
          // Abrir WhatsApp automáticamente SOLO en alta nueva
          const cleanPhone = (creds.whatsapp || '').replace(/\D/g, '');
          const textMsg = `Hola! Bienvenido a PehueniaGO. Ya puedes acceder a tu panel de control desde https://pehueniago.ar/portal-comercial/login \n\nTu usuario es: ${creds.email}\nTu contraseña provisoria es: ${creds.password}\n\nTe sugerimos cambiarla al ingresar en la sección Editar Perfil.`;
          if (cleanPhone) {
            window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(textMsg)}`, '_blank');
          }
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
                        {comm.details?.slice(0, 2).map((d: any) => {
                          let itemName = d.name;
                          try {
                            if (typeof d.name === 'string' && d.name.trim().startsWith('{')) {
                              itemName = JSON.parse(d.name).name || d.name;
                            }
                          } catch {}
                          return <span key={d.id} className="feature-tag-small">🛍️ {itemName}</span>;
                        })}
                        {(comm.details?.length || 0) > 2 && <span>+{(comm.details?.length || 0) - 2}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="icon-btn edit" title="Editar" onClick={() => openModal(comm)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="icon-btn" title="Generar / Resetear Clave de Portal" style={{ color: '#0d9488' }} onClick={() => handleResetPasswordClick(comm)}>
                          <Key size={16} />
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
                      placeholder="Ej: Supermercado Pehuenia"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Tipo / Categoría</label>
                    <input 
                      type="text" 
                      list="commerce-categories-list"
                      value={formData.type} 
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      placeholder="Selecciona o escribe una categoría (ej: Regionales, Supermercado...)"
                      required
                      className="admin-select"
                    />
                    <datalist id="commerce-categories-list">
                      {availableCommerceCategories.map((cat: string) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </datalist>
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
                      <option value="Villa Pehuenia">Villa Pehuenia</option>
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
                  
                  {/* SECCIÓN GESTIÓN DE PRODUCTOS U OFERTAS A LA VENTA */}
                  <div 
                    style={{
                      border: editingProductIdx !== null ? '2px solid #0d9488' : '1px dashed #cbd5e1',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '16px',
                      backgroundColor: editingProductIdx !== null ? '#f0fdfa' : '#f8fafc'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>
                        🛍️ Productos u Ofertas a la Venta
                      </label>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: productsList.length >= 5 ? '#dc2626' : '#0d9488', background: productsList.length >= 5 ? '#fee2e2' : '#ccfbf1', padding: '2px 8px', borderRadius: '10px' }}>
                        {productsList.length} / 5 máx.
                      </span>
                    </div>

                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 130px', gap: '10px', marginBottom: '10px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Nombre del Producto *</label>
                        <input 
                          type="text" 
                          value={newProduct.name} 
                          onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                          placeholder="Ej: Mate de Alpaca / Poncho"
                          disabled={productsList.length >= 5 && editingProductIdx === null}
                          style={{ padding: '8px 10px', fontSize: '0.88rem' }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Precio (Opcional)</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <span style={{ position: 'absolute', left: '8px', color: '#64748b', fontSize: '0.85rem' }}>$</span>
                          <input 
                            type="number" 
                            value={newProduct.price} 
                            onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                            placeholder="0.00"
                            disabled={productsList.length >= 5 && editingProductIdx === null}
                            style={{ padding: '8px 10px 8px 20px', fontSize: '0.88rem' }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Descripción (Opcional)</label>
                      <textarea 
                        value={newProduct.description} 
                        onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                        placeholder="Ej: Cincelado a mano, incluye bombilla de acero..."
                        rows={2}
                        disabled={productsList.length >= 5 && editingProductIdx === null}
                        style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div className="form-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input 
                          type="file" 
                          id="comm-prod-image"
                          accept="image/*"
                          onChange={handleProductImageUpload}
                          style={{ display: 'none' }}
                          disabled={productsList.length >= 5 && editingProductIdx === null}
                        />
                        <label 
                          htmlFor="comm-prod-image" 
                          style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            padding: '6px 12px', 
                            backgroundColor: '#e2e8f0', 
                            color: '#1e293b', 
                            borderRadius: '8px', 
                            fontSize: '0.8rem', 
                            fontWeight: 600, 
                            cursor: productsList.length >= 5 && editingProductIdx === null ? 'not-allowed' : 'pointer' 
                          }}
                        >
                          {uploadingProductImg ? <Loader2 size={13} className="animate-spin" /> : <ImageIcon size={13} />}
                          {newProduct.image ? 'Cambiar Foto' : 'Subir Foto'}
                        </label>
                        {newProduct.image && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                            <img src={newProduct.image} alt="Preview" style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px' }} />
                            <button type="button" onClick={() => setNewProduct({...newProduct, image: ''})} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}>
                              <X size={12} />
                            </button>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        {editingProductIdx !== null && (
                          <button 
                            type="button" 
                            onClick={handleCancelEditProduct} 
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
                          >
                            Cancelar
                          </button>
                        )}
                        <button 
                          type="button" 
                          onClick={handleSaveProduct} 
                          disabled={productsList.length >= 5 && editingProductIdx === null}
                          style={{ 
                            backgroundColor: editingProductIdx !== null ? '#0d9488' : (productsList.length >= 5 ? '#94a3b8' : '#1e293b'), 
                            color: 'white', 
                            border: 'none', 
                            padding: '6px 14px', 
                            borderRadius: '6px', 
                            fontWeight: 700, 
                            fontSize: '0.82rem', 
                            cursor: productsList.length >= 5 && editingProductIdx === null ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {editingProductIdx !== null ? <Check size={14} /> : <Plus size={14} />}
                          {editingProductIdx !== null ? 'Guardar' : 'Agregar'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* LISTA DE PRODUCTOS A LA VENTA */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'block' }}>
                      Productos en Venta ({productsList.length})
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                      {productsList.length === 0 ? (
                        <div style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                          Aún no hay productos u ofertas cargadas.
                        </div>
                      ) : (
                        productsList.map((prod, idx) => (
                          <div 
                            key={idx} 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between', 
                              gap: '10px', 
                              backgroundColor: 'white', 
                              padding: '8px 12px', 
                              borderRadius: '8px', 
                              border: '1px solid #e2e8f0' 
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                              {prod.image ? (
                                <img src={prod.image} alt={prod.name} style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                              ) : (
                                <div style={{ width: '38px', height: '38px', borderRadius: '6px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '1rem', flexShrink: 0 }}>
                                  🛍️
                                </div>
                              )}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prod.name}</span>
                                  {prod.price && !isNaN(parseFloat(String(prod.price))) && (
                                    <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '0.8rem', backgroundColor: '#dcfce7', padding: '1px 6px', borderRadius: '4px' }}>
                                      ${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(parseFloat(String(prod.price)))}
                                    </span>
                                  )}
                                </div>
                                {prod.description && (
                                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {prod.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                              <button 
                                type="button" 
                                onClick={() => handleEditProduct(idx)} 
                                style={{ background: 'none', border: 'none', color: '#0d9488', cursor: 'pointer', padding: '4px' }}
                                title="Editar"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                type="button" 
                                onClick={() => handleRemoveProduct(idx)} 
                                style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '4px' }}
                                title="Eliminar"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* SECCIÓN SERVICIOS Y COMODIDADES GENERALES (TILDES) */}
                  <div className="form-group" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                    <label style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      ✅ Servicios y Comodidades Generales (Tildes)
                    </label>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 10px 0' }}>
                      Agrega comodidades, medios de pago o servicios del comercio (ej: <em>Tarjetas de Débito y Crédito</em>, <em>Atención Personalizada</em>, <em>Envíos a Domicilio</em>, <em>Estacionamiento Propio</em>, <em>WiFi</em>). Aparecerán en la ficha con tilde verde.
                    </p>
                    <div className="features-input-group" style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <input 
                        type="text" 
                        value={newFeature} 
                        onChange={(e) => setNewFeature(e.target.value)}
                        placeholder="Ej: Acepta Tarjetas, Estacionamiento, Envíos..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addFeature();
                          }
                        }}
                        style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      />
                      <button 
                        type="button" 
                        className="add-feature-btn" 
                        onClick={addFeature}
                        style={{ padding: '8px 16px', background: '#0d9488', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        Agregar
                      </button>
                    </div>
                    <div className="features-tags-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {formData.features.length === 0 ? (
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                          No se han agregado comodidades aún.
                        </span>
                      ) : (
                        formData.features.map(feature => (
                          <span 
                            key={feature} 
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '6px', 
                              background: 'white', 
                              color: '#334155', 
                              border: '1px solid #cbd5e1', 
                              padding: '4px 10px', 
                              borderRadius: '20px', 
                              fontSize: '0.82rem', 
                              fontWeight: 600 
                            }}
                          >
                            <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span> {feature}
                            <button 
                              type="button" 
                              onClick={() => removeFeature(feature)}
                              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                            >
                              <X size={13} />
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Horario de Atención</label>
                    <OpeningHoursEditor 
                      value={formData.openingHours} 
                      onChange={(val) => setFormData({...formData, openingHours: val})}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                      <input 
                        type="checkbox" 
                        checked={formData.hasDelivery} 
                        onChange={(e) => setFormData({...formData, hasDelivery: e.target.checked})}
                        style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
                      />
                      <b style={{ color: formData.hasDelivery ? '#059669' : '#334155' }}>🛵 Cuenta con servicio de Delivery</b>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                      <input 
                        type="checkbox" 
                        checked={formData.isVerified} 
                        onChange={(e) => setFormData({...formData, isVerified: e.target.checked})}
                        style={{ width: '16px', height: '16px' }}
                      />
                      <b>Comercio Verificado (Sello Seguro)</b>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                      <input 
                        type="checkbox" 
                        checked={formData.showSchedule} 
                        onChange={(e) => setFormData({...formData, showSchedule: e.target.checked})}
                        style={{ width: '16px', height: '16px' }}
                      />
                      <b>Mostrar Horarios Públicamente</b>
                    </label>
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
                          placeholder="-38.8833"
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Longitud</label>
                        <input 
                          type="text" 
                          value={formData.longitude} 
                          onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                          placeholder="-71.1667"
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
              href={`https://wa.me/${(generatedCredentials.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Bienvenido a PehueniaGO. Ya puedes acceder a tu panel de control desde https://pehueniago.ar/portal-comercial/login \n\nTu usuario es: ${generatedCredentials.email}\nTu contraseña provisoria es: ${generatedCredentials.password}\n\nTe sugerimos cambiarla al ingresar en la sección Editar Perfil.`)}`}
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

      {/* Modal de Reset / Generar Contraseña */}
      {resetModalData.isOpen && (
        <div className="modal-overlay" onClick={() => setResetModalData(prev => ({ ...prev, isOpen: false }))}>
          <div className="modal-content" style={{ maxWidth: '480px', textAlign: 'center', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ backgroundColor: '#ccfbf1', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#0f766e' }}>
              <Key size={30} />
            </div>
            
            <h2 style={{ fontSize: '1.4rem', marginBottom: '8px', color: '#0f766e', fontWeight: 800 }}>
              Acceso al Portal Comercial
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
              Comercio: <strong>{resetModalData.commerceName}</strong>
            </p>

            {resetModalData.loading ? (
              <div style={{ padding: '30px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <Loader2 size={36} className="animate-spin" color="#0d9488" />
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Generando nuevas credenciales seguras...</p>
              </div>
            ) : resetModalData.credentials ? (
              <>
                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px', textAlign: 'left' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Usuario (Email):</span>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b', marginTop: '2px', wordBreak: 'break-all' }}>
                      {resetModalData.credentials.email}
                    </div>
                  </div>
                  
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Nueva Contraseña:</span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px', backgroundColor: 'white', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: resetModalData.showPassword ? '1px' : '3px', color: '#0f766e', fontFamily: 'monospace' }}>
                        {resetModalData.showPassword ? resetModalData.credentials.newPassword : '••••••••••••'}
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          type="button" 
                          onClick={() => setResetModalData(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                          title={resetModalData.showPassword ? 'Ocultar' : 'Mostrar'}
                        >
                          {resetModalData.showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button 
                          type="button" 
                          onClick={() => {
                            navigator.clipboard.writeText(resetModalData.credentials?.newPassword || '');
                            setResetModalData(prev => ({ ...prev, copied: true }));
                            setTimeout(() => setResetModalData(prev => ({ ...prev, copied: false })), 2000);
                          }}
                          style={{ background: 'none', border: 'none', color: resetModalData.copied ? '#16a34a' : '#0d9488', cursor: 'pointer', padding: '4px' }}
                          title="Copiar contraseña"
                        >
                          {resetModalData.copied ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <a 
                    href={`https://wa.me/${(resetModalData.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Aquí tienes tus datos de acceso al Portal Comercial de PehueniaGO (https://pehueniago.ar/portal-comercial/login):\n\nUsuario: ${resetModalData.credentials.email}\nContraseña: ${resetModalData.credentials.newPassword}\n\nTe sugerimos cambiarla al ingresar en la sección Editar Perfil.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ width: '100%', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '0.95rem', textDecoration: 'none', backgroundColor: '#25D366', color: 'white', borderRadius: '10px', fontWeight: 'bold' }}
                    onClick={() => setResetModalData(prev => ({ ...prev, isOpen: false }))}
                  >
                    <MessageCircle size={18} /> Enviar Clave por WhatsApp
                  </a>

                  <button 
                    type="button"
                    onClick={() => setResetModalData(prev => ({ ...prev, isOpen: false }))}
                    style={{ padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: '8px', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cerrar
                  </button>
                </div>
              </>
            ) : null}
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
