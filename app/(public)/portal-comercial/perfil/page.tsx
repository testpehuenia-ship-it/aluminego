'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePortal } from '@/components/PortalContext';
import { Loader2, Save, Upload, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PortalPerfilPage() {
  const router = useRouter();
  const { user: session, loading } = usePortal();
  
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({ 
    name: '',
    description: '', 
    details: '', 
    whatsapp: '', 
    image: '', 
    newPassword: '', 
    latitude: '', 
    longitude: '',
    categoryId: '',
    accommodationType: '',
    category: '',
    subcategory: '',
    address: ''
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !session) {
      router.push('/portal-comercial/login');
    }
  }, [session, loading, router]);

  useEffect(() => {
    if (session) {
      fetch('/api/portal/dashboard')
        .then(res => res.json())
        .then(data => {
          if (data.services) {
            setServices(data.services);
            if (data.services.length > 0) {
              handleSelectService(data.services[0]);
            }
          }
          setFetching(false);
        });

      fetch('/api/categories')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setCategories(data);
        })
        .catch(() => {});
    }
  }, [session]);

  // El backend GET /api/portal/dashboard ya devuelve description/image/whatsapp/details/latitude/longitude
  // de las entidades. Así que ahora sí prellenamos la info real del DB.

  const handleSelectService = async (service: any) => {
    setSelectedService(service);
    setFormData({ 
      name: service.name || '',
      description: service.description || '', 
      details: service.details || '', 
      whatsapp: service.whatsapp || '', 
      image: service.image || '', 
      newPassword: '', 
      latitude: service.latitude ? service.latitude.toString() : '', 
      longitude: service.longitude ? service.longitude.toString() : '',
      categoryId: service.categoryId || '',
      accommodationType: service.accommodationType || '',
      category: service.category || '',
      subcategory: service.subcategory || '',
      address: service.address || ''
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        setFormData(prev => ({ ...prev, image: data.url }));
        if (data.isHeavy) {
          setMessage({ type: 'success', text: 'Imagen subida (y optimizada para pesar menos).' });
        } else {
          setMessage({ type: 'success', text: 'Imagen subida correctamente.' });
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al subir la imagen' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    setSaving(true);
    setMessage(null);

    const latStr = formData.latitude ? String(formData.latitude).replace(',', '.').trim() : '';
    const lngStr = formData.longitude ? String(formData.longitude).replace(',', '.').trim() : '';

    if (latStr !== '' && isNaN(parseFloat(latStr))) {
      setMessage({ type: 'error', text: 'La latitud debe ser un número válido.' });
      window.alert('❌ Error: La latitud debe ser un número válido. Por favor verifica que no tenga letras u otros caracteres.');
      setSaving(false);
      return;
    }
    if (lngStr !== '' && isNaN(parseFloat(lngStr))) {
      setMessage({ type: 'error', text: 'La longitud debe ser un número válido.' });
      window.alert('❌ Error: La longitud debe ser un número válido. Chrome puede estar autocompletando este campo por error.');
      setSaving(false);
      return;
    }

    const payload: any = { 
      entityId: selectedService.id, 
      entityType: selectedService.type,
      name: formData.name,
      description: formData.description,
      whatsapp: formData.whatsapp,
      details: formData.details,
      latitude: latStr,
      longitude: lngStr,
    };
    if (selectedService.type === 'business') payload.categoryId = formData.categoryId;
    if (selectedService.type === 'accommodation') payload.accommodationType = formData.accommodationType;
    if (selectedService.type === 'commerce') payload.accommodationType = formData.accommodationType;
    if (selectedService.type === 'adventure') payload.category = formData.category;
    if (selectedService.type === 'localservice') {
      payload.category = formData.category;
      payload.subcategory = formData.subcategory;
      payload.address = formData.address;
    }
    if (formData.image) payload.image = formData.image;
    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres.' });
        window.alert('❌ Error: La nueva contraseña debe tener al menos 6 caracteres.');
        setSaving(false);
        return;
      }
      payload.newPassword = formData.newPassword;
    }

    try {
      const res = await fetch('/api/portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Perfil actualizado correctamente.' });
        window.alert('✅ ¡Los cambios se guardaron con éxito!');
        
        // Refetch dashboard data so local state is updated with the new values
        try {
          const dashRes = await fetch('/api/portal/dashboard');
          const dashData = await dashRes.json();
          if (dashData.services) {
            setServices(dashData.services);
            const updatedService = dashData.services.find((s: any) => s.id === selectedService.id);
            if (updatedService) {
              setSelectedService(updatedService);
              // Do NOT reset formData here because the user might want to keep editing, 
              // but formData already contains their latest inputs anyway.
            }
          }
        } catch(e) {}
        
      } else {
        const errorMsg = data.error || 'Error al guardar.';
        setMessage({ type: 'error', text: errorMsg });
        window.alert('❌ Error: ' + errorMsg);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de red.' });
      window.alert('❌ Error de red al guardar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || fetching) {
    return <div style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Loader2 className="animate-spin" size={40} color="var(--color-orange)" /></div>;
  }

  if (!session) return null;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Link href="/portal-comercial" style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', color: 'var(--color-text-main)', border: '1px solid #e2e8f0' }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>Edición de Perfil</h1>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        {services.length > 1 && (
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Seleccionar Negocio a Editar:</label>
            <select 
              value={selectedService?.id || ''} 
              onChange={e => {
                const s = services.find(x => x.id === e.target.value);
                if (s) handleSelectService(s);
              }}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', backgroundColor: '#f8fafc' }}
            >
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
              ))}
            </select>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {message && (
            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2', color: message.type === 'success' ? '#166534' : '#991b1b', fontWeight: 500 }}>
              {message.text}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Nombre Comercial *</label>
            <input 
              type="text" 
              required
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Cabañas El Paraíso"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>

          {selectedService?.type === 'business' && (
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Categoría Gastronómica *</label>
              <select
                required
                value={formData.categoryId}
                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', backgroundColor: 'white' }}
              >
                <option value="">Selecciona una categoría</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          )}

          {selectedService?.type === 'accommodation' && (
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Tipo de Alojamiento *</label>
              <input 
                type="text" 
                required
                value={formData.accommodationType} 
                onChange={e => setFormData({ ...formData, accommodationType: e.target.value })}
                placeholder="Ej: Cabaña, Hotel, Hostería, Habilitado"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
              />
            </div>
          )}

          {selectedService?.type === 'commerce' && (
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Tipo de Comercio *</label>
              <input 
                type="text" 
                required
                value={formData.accommodationType} 
                onChange={e => setFormData({ ...formData, accommodationType: e.target.value })}
                placeholder="Ej: Supermercado, Kiosco, Farmacia, Regalería"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
              />
            </div>
          )}

          {selectedService?.type === 'adventure' && (
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Categoría de Aventura *</label>
              <input 
                type="text" 
                required
                value={formData.category} 
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ej: Trekking, Kayac, Pesca, Excursión"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
              />
            </div>
          )}

          {selectedService?.type === 'localservice' && (
            <>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Categoría de Servicio *</label>
                <input 
                  type="text" 
                  required
                  value={formData.category} 
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ej: Salud, Comercios, Transporte"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Subcategoría (Opcional)</label>
                <input 
                  type="text" 
                  value={formData.subcategory} 
                  onChange={e => setFormData({ ...formData, subcategory: e.target.value })}
                  placeholder="Ej: Farmacia, Cerrajería, Regalería"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Dirección / Ubicación (Opcional)</label>
                <input 
                  type="text" 
                  value={formData.address} 
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ej: Av. Los Pehuenes s/n"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                />
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Foto de Portada</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {formData.image ? (
                <img src={formData.image} alt="Preview" style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              ) : (
                <div style={{ width: '120px', height: '80px', backgroundColor: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #cbd5e1', color: '#94a3b8' }}>Sin imagen</div>
              )}
              <div>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {uploadingImage ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                  Subir Nueva Imagen
                </button>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Las imágenes grandes se comprimirán automáticamente.</p>
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Número de WhatsApp</label>
            <input 
              type="text" 
              value={formData.whatsapp} 
              onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
              placeholder="Ej: 5492942123456 (Solo si quieres cambiar el actual)"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Descripción Detallada</label>
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe tu negocio o alojamiento... (Dejar en blanco si no deseas cambiarla)"
              rows={5}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'inherit' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Detalles / Servicios (Características)</label>
            <textarea 
              value={formData.details} 
              onChange={e => setFormData({ ...formData, details: e.target.value })}
              placeholder="Ej: Acepta tarjetas, Wi-Fi, Estacionamiento... (Opcional)"
              rows={3}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ marginTop: '16px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#1e293b' }}>Ubicación en el Mapa</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '16px' }}>
              Los comercios con <strong>Plan Comercio Completo</strong> aparecerán automáticamente en el mapa interactivo. Para obtener tus coordenadas, busca tu local en Google Maps, haz clic derecho sobre el punto rojo y copia los números que aparecen (ej: -39.2372, -70.9314).
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Latitud</label>
                <input 
                  type="text" 
                  autoComplete="off"
                  value={formData.latitude} 
                  onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                  placeholder="Ej: -38.8951"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Longitud</label>
                <input 
                  type="text" 
                  autoComplete="off"
                  value={formData.longitude} 
                  onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                  placeholder="Ej: -70.9314"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#1e293b' }}>Seguridad</h3>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Nueva Contraseña de Acceso</label>
            {/* Campo oculto con opacity 0 para evitar que Chrome autocompleta el email en "Longitud". Display none es ignorado por Chrome. */}
            <input type="text" name="username" autoComplete="username" style={{ position: 'absolute', opacity: 0, height: '1px', width: '1px', zIndex: -1 }} defaultValue={session?.email || ''} tabIndex={-1} />
            <input 
              type="password" 
              name="password"
              autoComplete="new-password"
              value={formData.newPassword} 
              onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
              placeholder="Ingresa una nueva contraseña (mínimo 6 caracteres) o deja en blanco"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={saving}
            style={{ marginTop: '10px', padding: '14px', backgroundColor: 'var(--color-green)', color: 'white', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
}
