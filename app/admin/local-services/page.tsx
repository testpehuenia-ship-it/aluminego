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
  DollarSign,
  Check,
  MessageCircle,
  Key,
  Eye,
  EyeOff,
  Copy
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import OpeningHoursEditor, { DEFAULT_SCHEDULE_STRING } from '@/components/admin/OpeningHoursEditor';

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
    subcategory: '',
    description: '',
    details: '',
    selectedPricingKeys: [] as string[],
    bonifiedKeys: [] as string[],
    discountAmount: 0,
    linkedSections: [] as string[],
    latitude: '-38.87942114574949',
    longitude: '-71.18375154775678',
    openingHours: DEFAULT_SCHEDULE_STRING,
    isVerified: false,
    showSchedule: false,
    hasDelivery: false
  });
  
  // Multi-item / Products state before saving
  const [productsList, setProductsList] = React.useState<any[]>([]);
  const [newProduct, setNewProduct] = React.useState<{ name: string; description: string; price: string; image: string }>({
    name: '',
    description: '',
    price: '',
    image: ''
  });
  const [editingProductIdx, setEditingProductIdx] = React.useState<number | null>(null);
  const [uploadingProductImg, setUploadingProductImg] = React.useState(false);

  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [generatedCredentials, setGeneratedCredentials] = React.useState<any>(null);
  const [pricingOptions, setPricingOptions] = React.useState<any[]>([]);
  const [dynamicCategories, setDynamicCategories] = React.useState<string[]>([]);

  // Password reset modal state
  const [resetModalData, setResetModalData] = React.useState<{
    isOpen: boolean;
    serviceName: string;
    whatsapp: string;
    loading: boolean;
    credentials: { email: string; newPassword: string } | null;
    showPassword: boolean;
    copied: boolean;
  }>({
    isOpen: false,
    serviceName: '',
    whatsapp: '',
    loading: false,
    credentials: null,
    showPassword: true,
    copied: false
  });

  const existingSubcategories = React.useMemo(() => {
    if (!formData.category) return [];
    const subs = services
      .filter(s => s.category && s.category.toLowerCase() === formData.category.toLowerCase() && s.subcategory)
      .map(s => s.subcategory);
    return Array.from(new Set(subs)) as string[];
  }, [services, formData.category]);

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
      const baseCats = ["Salud", "Seguridad", "Instituciones", "Transporte", "Comercios", "Servicios Profesionales", "Aventuras", "Otros", "Todos los servicios"];
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
      let initialProducts: any[] = [];
      if (service.details) {
        try {
          if (service.details.trim().startsWith('[')) {
            const parsed = JSON.parse(service.details);
            initialProducts = parsed.map((item: any) => {
              if (typeof item === 'string') {
                return { name: item, description: '', price: '', image: '' };
              }
              return {
                name: item.name || '',
                description: item.description || '',
                price: item.price !== undefined && item.price !== null ? String(item.price) : '',
                image: item.image || ''
              };
            });
          } else {
            initialProducts = service.details.split(',').map((s: string) => ({
              name: s.trim(),
              description: '',
              price: '',
              image: ''
            })).filter((p: any) => p.name);
          }
        } catch {
          initialProducts = service.details.split(',').map((s: string) => ({
            name: s.trim(),
            description: '',
            price: '',
            image: ''
          })).filter((p: any) => p.name);
        }
      }
      setProductsList(initialProducts);
      setNewProduct({ name: '', description: '', price: '', image: '' });
      setEditingProductIdx(null);

      setFormData({
        name: service.name,
        category: service.category || '',
        address: service.address || '',
        whatsapp: service.whatsapp || '',
        image: service.image || '',
        subcategory: service.subcategory || '',
        description: service.description || '',
        details: service.details || '',
        selectedPricingKeys: service.subscription ? service.subscription.planType.split(', ').filter(Boolean) : [],
        bonifiedKeys: service.subscription?.bonifiedKeys ? service.subscription.bonifiedKeys.split(', ').filter(Boolean) : [],
        discountAmount: service.subscription?.discountAmount || 0,
        linkedSections: [
          service.subscription?.business ? 'gastronomia' : null,
          service.subscription?.accommodation ? 'alojamiento' : null,
          service.subscription?.adventure ? 'aventuras' : null,
          service.subscription?.commerce ? 'comercios' : null
        ].filter(Boolean) as string[],
        latitude: service.latitude ? service.latitude.toString() : '',
        longitude: service.longitude ? service.longitude.toString() : '',
        openingHours: service.openingHours || '',
        isVerified: service.isVerified || false,
        showSchedule: service.showSchedule || false,
        hasDelivery: service.hasDelivery || false
      });
    } else {
      setEditingService(null);
      setProductsList([]);
      setNewProduct({ name: '', description: '', price: '', image: '' });
      setEditingProductIdx(null);
      setFormData({ name: '', category: '', subcategory: '', address: '', whatsapp: '', image: '', description: '', details: '', selectedPricingKeys: [], bonifiedKeys: [], discountAmount: 0, linkedSections: [], latitude: '-38.87942114574949', longitude: '-71.18375154775678', openingHours: DEFAULT_SCHEDULE_STRING, isVerified: false, showSchedule: false, hasDelivery: false });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setProductsList([]);
    setNewProduct({ name: '', description: '', price: '', image: '' });
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

  const handleResetPasswordClick = async (service: any) => {
    const targetId = service.portalUserId || service.id;
    setResetModalData({
      isOpen: true,
      serviceName: service.name,
      whatsapp: service.whatsapp || '',
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
          whatsapp: data.whatsapp || service.whatsapp || ''
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

    const payload = {
      ...formData,
      details: JSON.stringify(productsList.slice(0, 5))
    };

    setSaving(true);

    try {
      const isNew = !editingService;
      const url = editingService 
        ? `/api/local-services/${editingService.id}` 
        : '/api/local-services';
      
      const method = editingService ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        await fetchData();
        closeModal();

        // IMPORTANTE: SOLO enviar mensaje de WhatsApp y mostrar modal de bienvenida si es un ALTA NUEVA
        if (isNew && data.generatedCredentials && data.generatedCredentials.password && !data.generatedCredentials.password.includes('anteriormente')) {
          const creds = {
            ...data.generatedCredentials,
            businessName: formData.name,
            whatsapp: formData.whatsapp
          };
          setGeneratedCredentials(creds);
          
          const cleanPhone = (creds.whatsapp || '').replace(/\D/g, '');
          const textMsg = `Hola! Bienvenido a PehueniaGO. Ya puedes acceder a tu panel de control desde https://pehueniago.ar/portal-comercial/login \n\nTu usuario es: ${creds.email}\nTu contraseña provisoria es: ${creds.password}\n\nTe sugerimos cambiarla al ingresar en la sección Editar Perfil.`;
          if (cleanPhone) {
            window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(textMsg)}`, '_blank');
          }
        }

        const bannerKeys = formData.selectedPricingKeys.filter((k: string) => k.includes('banner') || k.includes('portada'));
        if (bannerKeys.length > 0) {
          // Build the list of contracted pages based on linked sections
          const sectionPageMap: Record<string, string> = {
            gastronomia: 'QueComer',
            alojamiento: 'Dormir',
            aventuras: 'Aventuras',
            comercios: 'Comercios',
            'guia-local': 'GuiaLocal',
            novedades: 'Novedades',
          };

          const contractedPagesList: string[] = formData.linkedSections
            .map((s: string) => sectionPageMap[s])
            .filter(Boolean);
          if (bannerKeys.includes('portada_principal')) {
            contractedPagesList.push('Inicio');
          }

          // Primary page for initial redirect (first linked section or Inicio)
          const sectionKey = bannerKeys.find((k: string) => k.includes('banner_'));
          const finalKey = sectionKey || bannerKeys[0];

          let section = 1;
          let pageName = contractedPagesList[0] || 'GuiaLocal';
          if (finalKey.includes('banner_top')) section = 1;
          if (finalKey.includes('banner_middle')) section = 2;
          if (finalKey.includes('banner_bottom')) section = 3;

          const params = new URLSearchParams({
            businessName: formData.name,
            page: pageName,
            section: String(section),
            contractedPages: contractedPagesList.join(','),
            contractedBanners: bannerKeys.join(','),
          });

          router.push(`/admin/publicity?${params.toString()}`);
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
                        <button className="icon-btn edit" title="Editar" onClick={() => openModal(s)}><Edit2 size={16} /></button>
                        <button className="icon-btn" title="Generar / Resetear Clave de Portal" style={{ color: '#0d9488' }} onClick={() => handleResetPasswordClick(s)}><Key size={16} /></button>
                        <button className="icon-btn delete" title="Eliminar" onClick={() => handleDelete(s.id)}><Trash2 size={16} /></button>
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
                <label style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span>Subcategoría / Rubro de Referencia (Opcional)</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#64748b' }}>
                    Indica el rubro o servicio general de referencia (ej: <em>Artesanías</em>, <em>Gomería</em>, <em>Poda</em>). Los productos a la venta se cargan por separado más abajo.
                  </span>
                </label>
                <input 
                  type="text" 
                  list="subcategories-list"
                  value={formData.subcategory || ''} 
                  onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                  placeholder="Ej: Artesanías, Regalería, Taller mecánico..."
                  className="admin-select"
                />
                <datalist id="subcategories-list">
                  {existingSubcategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
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
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '8px', marginBottom: '8px' }}>
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
                  <div className="image-gallery-preview" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                    {formData.image.split(',').filter(Boolean).map((imgUrl: string, idx: number) => (
                      <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                        <img src={imgUrl} alt={`Preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button 
                          type="button"
                          onClick={() => removeImage(idx)}
                          style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(255,0,0,0.8)', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sección Artículos y Productos u Ofertas (Estilo Gastronomía) */}
              <div className="modal-section" style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🛍️ Productos u Ofertas Destacadas
                  </label>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: productsList.length >= 5 ? '#dc2626' : '#0d9488', background: productsList.length >= 5 ? '#fee2e2' : '#ccfbf1', padding: '3px 10px', borderRadius: '12px' }}>
                    {productsList.length} / 5 máx.
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                  Ingresa hasta <strong>5 productos u ofertas</strong> con título, foto, descripción y precio opcional (el comercio puede enviar la carta o catálogo completo por WhatsApp cuando lo contacten).
                </p>

                {/* Formulario para agregar / editar producto */}
                <div 
                  style={{
                    border: editingProductIdx !== null ? '2px solid #0d9488' : '1px dashed #cbd5e1',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '16px',
                    backgroundColor: editingProductIdx !== null ? '#f0fdfa' : 'white'
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '12px', marginBottom: '12px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>Título / Nombre del Producto *</label>
                      <input 
                        type="text" 
                        value={newProduct.name} 
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        placeholder="Ej: Remera Térmica / Pack Oferta"
                        disabled={productsList.length >= 5 && editingProductIdx === null}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>Precio (Opcional)</label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <span style={{ position: 'absolute', left: '10px', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>$</span>
                        <input 
                          type="number" 
                          value={newProduct.price} 
                          onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                          placeholder="0.00"
                          disabled={productsList.length >= 5 && editingProductIdx === null}
                          style={{ width: '100%', padding: '9px 12px 9px 24px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>Descripción (Opcional)</label>
                    <textarea 
                      value={newProduct.description} 
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      placeholder="Ej: Talles del S al XXL, colores negro y azul..."
                      rows={2}
                      disabled={productsList.length >= 5 && editingProductIdx === null}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input 
                        type="file" 
                        id="product-item-image"
                        accept="image/*"
                        onChange={handleProductImageUpload}
                        style={{ display: 'none' }}
                        disabled={productsList.length >= 5 && editingProductIdx === null}
                      />
                      <label 
                        htmlFor="product-item-image" 
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          padding: '8px 14px', 
                          backgroundColor: '#e2e8f0', 
                          color: '#1e293b', 
                          borderRadius: '8px', 
                          fontSize: '0.82rem', 
                          fontWeight: 600, 
                          cursor: productsList.length >= 5 && editingProductIdx === null ? 'not-allowed' : 'pointer' 
                        }}
                      >
                        {uploadingProductImg ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                        {newProduct.image ? 'Cambiar Foto' : 'Subir Foto'}
                      </label>
                      {newProduct.image && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                          <img src={newProduct.image} alt="Preview" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '6px' }} />
                          <button type="button" onClick={() => setNewProduct({...newProduct, image: ''})} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }} title="Quitar foto">
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {editingProductIdx !== null && (
                        <button 
                          type="button" 
                          onClick={handleCancelEditProduct} 
                          style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
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
                          padding: '8px 18px', 
                          borderRadius: '8px', 
                          fontWeight: 700, 
                          fontSize: '0.85rem', 
                          cursor: productsList.length >= 5 && editingProductIdx === null ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {editingProductIdx !== null ? <Check size={16} /> : <Plus size={16} />}
                        {editingProductIdx !== null ? 'Guardar Cambios' : 'Agregar Producto'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lista de productos cargados */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {productsList.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem', backgroundColor: 'white', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                      Aún no hay productos u ofertas cargadas. Completa los datos de arriba y presiona "Agregar Producto".
                    </div>
                  ) : (
                    productsList.map((prod, idx) => (
                      <div 
                        key={idx} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between', 
                          gap: '12px', 
                          backgroundColor: 'white', 
                          padding: '12px 16px', 
                          borderRadius: '12px', 
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                          {prod.image ? (
                            <img src={prod.image} alt={prod.name} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0', flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '1.2rem', flexShrink: 0 }}>
                              🛍️
                            </div>
                          )}
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>{prod.name}</span>
                              {prod.price && !isNaN(parseFloat(String(prod.price))) && (
                                <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '0.85rem', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '6px' }}>
                                  ${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(parseFloat(String(prod.price)))}
                                </span>
                              )}
                            </div>
                            {prod.description && (
                              <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.3 }}>
                                {prod.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            type="button" 
                            onClick={() => handleEditProduct(idx)} 
                            style={{ background: '#f1f5f9', border: 'none', color: '#0d9488', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600 }}
                            title="Editar"
                          >
                            <Edit2 size={14} /> Editar
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveProduct(idx)} 
                            style={{ background: '#fee2e2', border: 'none', color: '#dc2626', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600 }}
                            title="Eliminar"
                          >
                            <Trash2 size={14} /> Borrar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {formData.selectedPricingKeys.includes('plan_comercio_completo') && (
                <div className="modal-section" style={{ background: '#fdf4ff', padding: '20px', borderRadius: '16px', border: '1px solid #fbcfe8', marginBottom: '16px' }}>
                  <h3 className="section-title" style={{ borderBottom: 'none', paddingBottom: 0, marginTop: 0, color: '#be185d' }}>Campos Premium (Plan Completo)</h3>
                  <div className="form-group" style={{ marginTop: '16px' }}>
                    <label>Descripción detallada</label>
                    <textarea 
                      value={formData.description || ''} 
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Escribe una descripción larga del comercio o servicio..."
                      rows={4}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                  </div>
                </div>
              )}

              {/* Sección Facturación */}
              <div className="modal-section" style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <h3 className="section-title" style={{ borderBottom: 'none', paddingBottom: 0, marginTop: 0 }}><DollarSign size={18} /> Facturación y Publicidad</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>Si escribes un teléfono, se marcará automáticamente el Plan Básico. Si deseas que sea gratis sin datos de contacto, puedes desmarcarlo.</p>
                  
                <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                  {pricingOptions.map(option => {
                    const hasSectionBanner = formData.selectedPricingKeys.some(k => k === 'banner_top' || k === 'banner_middle' || k === 'banner_bottom');
                    const isDisabled = option.key === 'portada_principal' && !hasSectionBanner;

                    return (
                      <label 
                        key={option.key} 
                        className="pricing-option" 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px', 
                          background: 'white', 
                          padding: '12px', 
                          borderRadius: '12px', 
                          border: formData.selectedPricingKeys.includes(option.key) ? '2px solid #0d9488' : '1px solid #cbd5e1', 
                          cursor: isDisabled ? 'not-allowed' : 'pointer', 
                          opacity: isDisabled ? 0.5 : 1,
                          transition: 'all 0.2s', 
                          position: 'relative' 
                        }}
                        title={isDisabled ? 'Debes seleccionar al menos un Banner de Sección (Top, Medio o Inferior) para contratar Portada Principal' : undefined}
                      >
                        <input 
                          type="checkbox" 
                          checked={formData.selectedPricingKeys.includes(option.key)}
                          disabled={isDisabled}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({ ...prev, selectedPricingKeys: [...prev.selectedPricingKeys, option.key] }));
                            } else {
                              setFormData(prev => {
                                let newKeys = prev.selectedPricingKeys.filter(k => k !== option.key);
                                const stillHasSectionBanner = newKeys.some(k => k === 'banner_top' || k === 'banner_middle' || k === 'banner_bottom');
                                if (!stillHasSectionBanner) {
                                  newKeys = newKeys.filter(k => k !== 'portada_principal');
                                }
                                return {
                                  ...prev,
                                  selectedPricingKeys: newKeys,
                                  bonifiedKeys: prev.bonifiedKeys.filter(k => k !== option.key && (k !== 'portada_principal' || stillHasSectionBanner))
                                };
                              });
                            }
                          }}
                          style={{ width: '18px', height: '18px', accentColor: '#0d9488', cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                        />
                        <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.85rem' }}>{option.name}</div>
                        <div style={{ color: formData.bonifiedKeys.includes(option.key) ? '#94a3b8' : '#0d9488', fontWeight: 700, fontSize: '0.85rem', textDecoration: formData.bonifiedKeys.includes(option.key) ? 'line-through' : 'none' }}>${new Intl.NumberFormat('es-AR').format(option.price)}/mes</div>
                      </div>
                      
                      {formData.selectedPricingKeys.includes(option.key) && (
                        <div onClick={(e) => e.preventDefault()} style={{ 
                          display: 'flex', alignItems: 'center', gap: '6px', 
                          background: formData.bonifiedKeys.includes(option.key) ? '#fff7ed' : '#f8fafc', 
                          padding: '4px 8px', borderRadius: '6px', 
                          border: formData.bonifiedKeys.includes(option.key) ? '1.5px solid #ea580c' : '1px solid #e2e8f0',
                          transition: 'all 0.2s'
                        }}>
                          <input 
                            type="checkbox" 
                            checked={formData.bonifiedKeys.includes(option.key)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, bonifiedKeys: [...prev.bonifiedKeys, option.key] }));
                              } else {
                                setFormData(prev => ({ ...prev, bonifiedKeys: prev.bonifiedKeys.filter(k => k !== option.key) }));
                              }
                            }}
                            style={{ width: '16px', height: '16px', accentColor: '#ea580c', cursor: 'pointer' }}
                          />
                          <span style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: 700, 
                            color: formData.bonifiedKeys.includes(option.key) ? '#ea580c' : '#64748b' 
                          }}>Bonificado</span>
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>

                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.9rem', color: '#b45309', fontWeight: 600 }}>Importe a Bonificar</span>
                    <span style={{ fontSize: '0.75rem', color: '#d97706' }}>Descuento extra fijo sobre el total</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#b45309', fontWeight: 600 }}>$</span>
                    <input 
                      type="number"
                      value={formData.discountAmount || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, discountAmount: Number(e.target.value) }))}
                      style={{ width: '100px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #fcd34d', outline: 'none', textAlign: 'right', fontWeight: 600 }}
                      min="0"
                    />
                  </div>
                </div>

                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px', padding: '12px 16px', background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Total Mensual:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f766e' }}>
                    ${new Intl.NumberFormat('es-AR').format(
                      Math.max(0, (formData.selectedPricingKeys.reduce((sum, key) => {
                        if (formData.bonifiedKeys.includes(key)) return sum;
                        return sum + (pricingOptions.find(p => p.key === key)?.price || 0);
                      }, 0) * (formData.selectedPricingKeys.includes('plan_comercio_completo') ? Math.max(1, formData.linkedSections.length) : 1)) - (formData.discountAmount || 0))
                    )}
                  </span>
                </div>

                {/* Selección de Secciones Adicionales (Exclusivo Comercio Completo) */}
                {formData.selectedPricingKeys.includes('plan_comercio_completo') && (
                  <div style={{ marginTop: '16px', padding: '16px', background: '#e0f2fe', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: '#0369a1', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building2 size={16} /> Aparecer en otras secciones
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: '#0c4a6e', marginBottom: '16px' }}>
                      Como tiene el plan Comercio Completo, puede elegir en qué otras secciones de la página aparecerá automáticamente.
                    </p>
                    
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {[
                        { id: 'gastronomia', label: '🍽️ Gastronomía' },
                        { id: 'alojamiento', label: '🛏️ Alojamiento' },
                        { id: 'aventuras', label: '⛰️ Aventuras' },
                        { id: 'comercios', label: '🛍️ Comercios' },
                        { id: 'guia-local', label: '📖 Guía Local' },
                        { id: 'novedades', label: '📰 Novedades' }
                      ].map(section => (
                        <label key={section.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'white', padding: '8px 12px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                          <input 
                            type="checkbox"
                            checked={formData.linkedSections.includes(section.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, linkedSections: [...prev.linkedSections, section.id] }));
                              } else {
                                setFormData(prev => ({ ...prev, linkedSections: prev.linkedSections.filter(s => s !== section.id) }));
                              }
                            }}
                            style={{ width: '16px', height: '16px', accentColor: '#0284c7' }}
                          />
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{section.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
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

      {generatedCredentials && (
        <div className="modal-overlay" onClick={() => setGeneratedCredentials(null)}>
          <div className="modal-content" style={{ maxWidth: '500px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ backgroundColor: '#dcfce7', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#166534' }}>
              <Check size={30} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#166534' }}>¡Servicio y Portal Actualizados!</h2>
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
              <Key size={28} />
            </div>
            
            <h2 style={{ fontSize: '1.4rem', marginBottom: '8px', color: '#0f766e' }}>
              Clave de Acceso al Portal
            </h2>
            <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '20px' }}>
              Comercio: <strong>{resetModalData.serviceName}</strong>
            </p>

            {resetModalData.loading ? (
              <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <Loader2 size={32} className="animate-spin" color="#0d9488" />
                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Generando nueva clave segura...</p>
              </div>
            ) : resetModalData.credentials ? (
              <div>
                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px', textAlign: 'left' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>Usuario / Email:</span>
                    <strong style={{ fontSize: '1rem', color: '#1e293b' }}>{resetModalData.credentials.email}</strong>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Nueva Contraseña Asignada:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                      <input 
                        type={resetModalData.showPassword ? "text" : "password"} 
                        value={resetModalData.credentials.newPassword} 
                        readOnly
                        style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontWeight: 700, fontSize: '1.1rem', color: '#0f766e' }}
                      />
                      <button
                        type="button"
                        onClick={() => setResetModalData(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                        title={resetModalData.showPassword ? "Ocultar" : "Mostrar"}
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
                        style={{ background: 'none', border: 'none', color: resetModalData.copied ? '#16a34a' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                        title="Copiar contraseña"
                      >
                        {resetModalData.copied ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <a 
                  href={`https://wa.me/${(resetModalData.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Tu nueva contraseña de acceso a PehueniaGO es: ${resetModalData.credentials.newPassword}\n\nPuedes ingresar a tu panel de control desde https://pehueniago.ar/portal-comercial/login con tu email: ${resetModalData.credentials.email}\n\nTe sugerimos cambiarla al ingresar en la sección Editar Perfil.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ width: '100%', padding: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '1rem', textDecoration: 'none', backgroundColor: '#25D366', color: 'white', borderRadius: '10px', fontWeight: 'bold', marginBottom: '12px' }}
                >
                  <MessageCircle size={20} /> Enviar Nueva Clave por WhatsApp
                </a>

                <button 
                  onClick={() => setResetModalData(prev => ({ ...prev, isOpen: false }))}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
                >
                  Cerrar
                </button>
              </div>
            ) : null}
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
        
        .table-container { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; position: relative; padding-bottom: 10px; }
        .admin-table { width: 100%; border-collapse: collapse; min-width: 800px; }
        .admin-table th { padding: 15px 20px; text-align: left; background: #f8fafc; font-size: 0.8rem; color: #64748b; text-transform: uppercase; }
        .admin-table td { padding: 15px 20px; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }
        .admin-table th:last-child, .admin-table td:last-child { position: sticky; right: 0; background: white; z-index: 1; border-left: 1px solid #f1f5f9; box-shadow: -4px 0 6px -4px rgba(0,0,0,0.1); }
        .admin-table th:last-child { background: #f8fafc; z-index: 2; }
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
