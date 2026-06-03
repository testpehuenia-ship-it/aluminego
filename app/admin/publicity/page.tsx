'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Edit, Save, X, Image as ImageIcon, Calendar, Power, PowerOff } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

const PAGES = ['Inicio', 'QueComer', 'Dormir', 'GuiaLocal', 'Aventuras'];
const SIZES = ['grande', 'chico'];
const SECTIONS = [1, 2, 3, 4];
const ORDERS = [1, 2, 3];

function PublicityAdminContent() {
  const searchParams = useSearchParams();
  const prefillName = searchParams.get('businessName');

  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [linkType, setLinkType] = useState<'none' | 'web' | 'whatsapp'>('none');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  
  const [formData, setFormData] = useState<any>({
    title: '',
    page: 'Inicio',
    section: 1,
    order: 1,
    image: '',
    link: '',
    size: 'grande',
    startDate: '',
    endDate: '',
    isHeavy: false,
    isActive: true
  });

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/publicity?all=true');
      const data = await res.json();
      setBanners(data);
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
    if (prefillName) {
      setFormData((prev: any) => ({ ...prev, title: prefillName }));
      setIsEditing(true);
    }
  }, [prefillName]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formDataObj = new FormData();
    formDataObj.append('file', file);
    formDataObj.append('isBanner', 'true');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataObj,
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        setFormData({ ...formData, image: data.url, isHeavy: data.isHeavy || false });
      } else {
        alert('Error al subir: ' + (data.error || 'Desconocido'));
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Hubo un error de red al subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image) {
      alert('Debes subir una imagen para el banner');
      return;
    }

    let finalLink = formData.link;
    if (linkType === 'whatsapp' && whatsappPhone) {
      const cleanPhone = whatsappPhone.replace(/\D/g, '');
      finalLink = `https://wa.me/${cleanPhone}?text=Hola,%20los%20vi%20en%20la%20App%20AlumineGo%20y%20quiero%20hacer%20una%20consulta.`;
    } else if (linkType === 'none') {
      finalLink = '';
    }

    const dataToSubmit = { ...formData, link: finalLink };

    try {
      const url = formData.id ? `/api/publicity/${formData.id}` : '/api/publicity';
      const method = formData.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al guardar');
      }

      alert('Banner guardado correctamente');
      setIsEditing(false);
      resetForm();
      fetchBanners();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este banner?')) return;
    
    try {
      await fetch(`/api/publicity/${id}`, { method: 'DELETE' });
      fetchBanners();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  const toggleActive = async (banner: any) => {
    try {
      const res = await fetch(`/api/publicity/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...banner, isActive: !banner.isActive }),
      });
      if (res.ok) {
        fetchBanners();
      }
    } catch (e) {
      alert('Error al cambiar estado');
    }
  };

  const resetForm = () => {
    setLinkType('none');
    setWhatsappPhone('');
    setFormData({
      title: '',
      page: 'Inicio',
      section: 1,
      order: 1,
      image: '',
      link: '',
      size: 'grande',
      startDate: '',
      endDate: '',
      isHeavy: false,
      isActive: true
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Siempre activo';
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  const isLocationOccupied = banners.some(
    b => b.page === formData.page && 
         b.section === formData.section && 
         b.order === formData.order && 
         b.id !== formData.id &&
         b.isActive
  );

  const editBanner = (banner: any) => {
    setFormData(banner);
    if (banner.link) {
      if (banner.link.includes('wa.me')) {
        setLinkType('whatsapp');
        const match = banner.link.match(/wa\.me\/(\d+)/);
        if (match) setWhatsappPhone(match[1]);
      } else {
        setLinkType('web');
      }
    } else {
      setLinkType('none');
    }
    setIsEditing(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Publicidad</h1>
        {!isEditing && (
          <button
            onClick={() => { resetForm(); setIsEditing(true); }}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
          >
            <Plus size={20} /> Nuevo Banner
          </button>
        )}
      </div>

      {!isEditing && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8 overflow-x-auto">
          <h2 className="text-lg font-bold mb-4">Plano de Publicidades</h2>
          <div className="flex gap-4 mb-4">
            <span className="flex items-center gap-2 text-sm"><div className="w-3 h-3 bg-green-500 rounded-full"></div> Libre</span>
            <span className="flex items-center gap-2 text-sm"><div className="w-3 h-3 bg-red-500 rounded-full"></div> Ocupado</span>
            <span className="flex items-center gap-2 text-sm"><div className="w-3 h-3 bg-yellow-500 rounded-full"></div> Suspendido</span>
          </div>
          <div className="flex gap-6 min-w-max">
            {PAGES.map(page => (
              <div key={page} className="border rounded-lg p-4 bg-gray-50 flex-1 min-w-[200px]">
                <h3 className="font-bold text-center mb-4 pb-2 border-b">{page}</h3>
                <div className="space-y-4">
                  {SECTIONS.map(section => (
                    <div key={section} className="space-y-1">
                      <div className="text-xs font-semibold text-gray-500">Sección {section}</div>
                      <div className="flex gap-1">
                        {ORDERS.map(order => {
                          const banner = banners.find(b => b.page === page && b.section === section && b.order === order);
                          let colorClass = "bg-green-500 hover:bg-green-600";
                          if (banner) {
                            colorClass = banner.isActive ? "bg-red-500 hover:bg-red-600" : "bg-yellow-500 hover:bg-yellow-600";
                          }
                          return (
                            <div 
                              key={order} 
                              onClick={() => {
                                if (banner) editBanner(banner);
                                else {
                                  resetForm();
                                  setFormData((prev: any) => ({ ...prev, page, section, order }));
                                  setIsEditing(true);
                                }
                              }}
                              className={`flex-1 h-8 rounded-sm ${colorClass} cursor-pointer flex items-center justify-center text-[10px] text-white font-bold transition-transform hover:scale-105`}
                              title={banner ? `${banner.title || 'Sin Título'} (${banner.size})` : 'Espacio Libre'}
                            >
                              {order}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isEditing ? (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-xl font-bold">{formData.id ? 'Editar Banner' : 'Crear Nuevo Banner'}</h2>
            <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Comercio (Título)</label>
                <input 
                  type="text"
                  className="w-full border rounded-lg p-2"
                  placeholder="Ej: La Pizzería"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Página Destino</label>
                <select 
                  className="w-full border rounded-lg p-2"
                  value={formData.page}
                  onChange={(e) => setFormData({...formData, page: e.target.value})}
                >
                  {PAGES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sección</label>
                  <select 
                    className="w-full border rounded-lg p-2"
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: Number(e.target.value)})}
                  >
                    {SECTIONS.map(s => <option key={s} value={s}>Sección {s}</option>)}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Ubicación en la página (1=Arriba)</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Orden (Ej: {formData.section}.{formData.order})</label>
                  <select 
                    className="w-full border rounded-lg p-2"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: Number(e.target.value)})}
                  >
                    {ORDERS.map(o => <option key={o} value={o}>Posición {o}</option>)}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">1 es el principal, 2 y 3 van debajo</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tamaño del Banner</label>
                  <select 
                    className="w-full border rounded-lg p-2"
                    value={formData.size}
                    onChange={(e) => setFormData({...formData, size: e.target.value})}
                  >
                    {SIZES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="checkbox" 
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="w-5 h-5 accent-orange-600"
                    />
                    <label htmlFor="isActive" className="font-medium text-gray-700 cursor-pointer">
                      {formData.isActive ? 'Activo (Visible)' : 'Suspendido (Oculto)'}
                    </label>
                  </div>
                </div>
              </div>
              
              {isLocationOccupied && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm flex items-start gap-2">
                  <span className="font-bold">âš ï¸ Atención:</span> 
                  <span>Esta ubicación ({formData.section}.{formData.order} en {formData.page}) ya está ocupada por otro banner. Si no cambias la ubicación, no podrás guardar.</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Acción al hacer click</label>
                <select 
                  className="w-full border rounded-lg p-2 mb-2"
                  value={linkType}
                  onChange={(e) => setLinkType(e.target.value as any)}
                >
                  <option value="none">Sin Enlace (Solo imagen)</option>
                  <option value="web">Abrir Página Web / Link externo</option>
                  <option value="whatsapp">Enviar Mensaje de WhatsApp</option>
                </select>

                {linkType === 'web' && (
                  <input 
                    type="url"
                    className="w-full border rounded-lg p-2"
                    placeholder="Ej: https://instagram.com/comercio"
                    value={formData.link || ''}
                    onChange={(e) => setFormData({...formData, link: e.target.value})}
                    required
                  />
                )}

                {linkType === 'whatsapp' && (
                  <div>
                    <input 
                      type="tel"
                      className="w-full border rounded-lg p-2"
                      placeholder="Ej: 5492942123456 (Incluir código de país)"
                      value={whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                      required
                    />
                    <p className="text-xs text-green-600 mt-1 font-medium">El usuario enviará: "Hola, los vi en la App AlumineGo y quiero hacer una consulta."</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio (Opcional)</label>
                  <input 
                    type="date"
                    className="w-full border rounded-lg p-2"
                    value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin (Opcional)</label>
                  <input 
                    type="date"
                    className="w-full border rounded-lg p-2"
                    value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagen del Banner <span className="text-xs text-gray-500 font-normal ml-2">(Recomendado: Top 1200x400px, Medio 800x400px, Chico 400x400px. Máx: 2MB)</span></label>
              
              {formData.image ? (
                <div className="relative border rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center p-4">
                  {formData.image.toLowerCase().endsWith('.mp4') || formData.image.includes('/video/upload/') ? (
                    <video src={formData.image} autoPlay loop muted playsInline style={{ maxHeight: '200px', objectFit: 'contain' }} />
                  ) : (
                    <img src={formData.image} alt="Banner Preview" style={{ maxHeight: '200px', objectFit: 'contain' }} />
                  )}
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, image: ''})}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 h-full min-h-[250px]">
                  <ImageIcon size={48} className="text-gray-400 mb-4" />
                  <label className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors text-center">
                    {uploading ? 'Subiendo...' : 'Seleccionar Imagen o Video'}
                    <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp, image/gif, video/mp4" onChange={handleFileUpload} disabled={uploading} />
                  </label>
                  <p className="text-xs text-gray-500 mt-4 text-center">
                    PNG, JPG, WEBP (Máx 250kb)<br />GIF, MP4 (Máx 10MB)
                  </p>
                </div>
              )}
            </div>

            <div className="col-span-full pt-4 border-t flex justify-end gap-4 mt-4">
              <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 border rounded-lg hover:bg-gray-50 font-medium">
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isLocationOccupied}
                className={`px-6 py-2 text-white rounded-lg flex items-center gap-2 font-medium transition-colors ${isLocationOccupied ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
              >
                <Save size={20} /> Guardar Banner
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-8">
          {PAGES.map(page => {
            const pageBanners = banners.filter(b => b.page === page);
            if (pageBanners.length === 0) return null;

            return (
              <div key={page} className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold mb-4 border-b pb-2 text-orange-600">Página: {page}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pageBanners.map(banner => (
                    <div key={banner.id} className={`border rounded-xl p-4 flex flex-col ${!banner.isActive ? 'bg-gray-50 border-gray-200' : ''}`}>
                      <div className="flex justify-between items-start mb-3">
                        <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-1 rounded">
                          Ubicación {banner.section}.{banner.order}
                        </span>
                        <div className="flex gap-2">
                          {!banner.isActive && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">
                              SUSPENDIDO
                            </span>
                          )}
                          <span className={`text-xs font-bold px-2 py-1 rounded ${banner.size === 'grande' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                            {banner.size.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      {banner.title && (
                        <h3 className="font-bold text-gray-800 mb-2 truncate" title={banner.title}>{banner.title}</h3>
                      )}
                      
                      <div className={`h-24 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden mb-4 border relative ${!banner.isActive ? 'opacity-50' : ''}`}>
                        {banner.image.toLowerCase().endsWith('.mp4') || banner.image.includes('/video/upload/') ? (
                          <video src={banner.image} autoPlay loop muted playsInline className="h-full object-contain pointer-events-none" />
                        ) : (
                          <img src={banner.image} alt="banner" className="h-full object-contain" />
                        )}
                        {banner.isHeavy && (
                          <div className="absolute top-1 right-1 bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1 border border-orange-200">
                            âš ï¸ Pesado
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                        <Calendar size={14} />
                        <span>{formatDate(banner.startDate)} - {formatDate(banner.endDate)}</span>
                      </div>
                      
                      <div className="mt-auto flex justify-end gap-2 pt-3 border-t">
                        <button 
                          onClick={() => toggleActive(banner)}
                          className={`p-2 rounded ${banner.isActive ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'}`}
                          title={banner.isActive ? "Suspender banner" : "Activar banner"}
                        >
                          {banner.isActive ? <PowerOff size={18} /> : <Power size={18} />}
                        </button>
                        <button 
                          onClick={() => editBanner(banner)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Editar banner"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(banner.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Eliminar banner"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          
          {banners.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No hay banners publicitarios cargados. Haz clic en "Nuevo Banner" para comenzar.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PublicityAdmin() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Cargando gestión de publicidad...</div>}>
      <PublicityAdminContent />
    </Suspense>
  );
}
