'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePortal } from '@/components/PortalContext';
import { Loader2, Plus, Trash2, Upload, ArrowLeft, ShoppingBag, Utensils } from 'lucide-react';
import Link from 'next/link';

export default function PortalMenuPage() {
  const router = useRouter();
  const { user: session, loading } = usePortal();
  
  const [entities, setEntities] = useState<any[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  
  const [items, setItems] = useState<any[]>([]);
  const [fetchingItems, setFetchingItems] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', description: '', price: '', image: '' });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  
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
            const availableEntities = data.services.filter((s: any) => 
              s.type === 'business' || s.type === 'commerce' || s.type === 'localservice'
            );
            setEntities(availableEntities);
            if (availableEntities.length > 0) {
              handleSelectEntity(availableEntities[0]);
            }
          }
        });
    }
  }, [session]);

  const handleSelectEntity = (entity: any) => {
    setSelectedEntity(entity);
    setFetchingItems(true);
    fetch(`/api/portal/menu?serviceId=${entity.id}&serviceType=${entity.type}`)
      .then(res => res.json())
      .then(data => {
        if (data.items) setItems(data.items);
        setFetchingItems(false);
      })
      .catch(() => setFetchingItems(false));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setMessage(null);

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('isBanner', 'true');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });
      const data = await res.json();
      
      if (data.success) {
        setFormData(prev => ({ ...prev, image: data.url }));
        setMessage({ type: 'success', text: 'Foto subida correctamente.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al subir la imagen' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión al subir' });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntity) return;
    if (items.length >= 5) {
      setMessage({ type: 'error', text: 'Has alcanzado el límite de 5 productos u ofertas permitidas.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/portal/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedEntity.id,
          serviceType: selectedEntity.type,
          name: formData.name,
          description: formData.description,
          price: formData.price ? formData.price : '',
          image: formData.image
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setItems([data.item, ...items]);
        setFormData({ name: '', description: '', price: '', image: '' });
        setMessage({ type: 'success', text: isGastronomy ? 'Plato agregado al menú.' : 'Producto u oferta agregada exitosamente.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al guardar.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de red.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const itemTypeLabel = isGastronomy ? 'plato' : 'producto';
    if (!confirm(`¿Seguro que deseas borrar este ${itemTypeLabel}?`)) return;

    try {
      const res = await fetch('/api/portal/menu', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedEntity.id,
          serviceType: selectedEntity.type,
          itemId
        })
      });
      const data = await res.json();
      if (data.success) {
        setItems(items.filter(i => i.id !== itemId));
        setMessage({ type: 'success', text: isGastronomy ? 'Plato eliminado.' : 'Producto eliminado.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al borrar.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de red.' });
    }
  };

  const isGastronomy = selectedEntity?.type === 'business';

  if (loading) return <div style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Loader2 className="animate-spin" size={40} color="var(--color-orange)" /></div>;
  if (!session) return null;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Link href="/portal-comercial" style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', color: 'var(--color-text-main)', border: '1px solid #e2e8f0' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>
            {isGastronomy ? 'Gestión de Menú' : 'Productos y Ofertas a la Venta'}
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Carga hasta 5 productos u ofertas destacadas para que tus clientes las vean en la app.
          </p>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        {entities.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b' }}>No tienes comercios o servicios asignados.</p>
        ) : (
          <>
            {entities.length > 1 && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Seleccionar Negocio / Comercio:</label>
                <select 
                  value={selectedEntity?.id || ''} 
                  onChange={e => {
                    const s = entities.find(x => x.id === e.target.value);
                    if (s) handleSelectEntity(s);
                  }}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', backgroundColor: '#f8fafc' }}
                >
                  {entities.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.type === 'business' ? 'Gastronomía' : e.type === 'commerce' ? 'Comercio' : 'Guía Local'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {message && (
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2', color: message.type === 'success' ? '#166534' : '#991b1b', fontWeight: 500, marginBottom: '20px' }}>
                {message.text}
              </div>
            )}

            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isGastronomy ? <Utensils size={20} color="var(--color-orange)" /> : <ShoppingBag size={20} color="#0d9488" />}
                  {isGastronomy ? 'Mis Platos Destacados' : 'Mis Productos u Ofertas'}
                </h2>
                <span style={{ backgroundColor: items.length >= 5 ? '#fee2e2' : '#e0f2fe', color: items.length >= 5 ? '#991b1b' : '#0369a1', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  {items.length} / 5
                </span>
              </div>

              {fetchingItems ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><Loader2 className="animate-spin" /></div>
              ) : items.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  {isGastronomy ? 'No hay platos en tu menú. Agrega tu primer plato destacado abajo.' : 'Aún no has cargado productos u ofertas a la venta. Agrega hasta 5 ítems abajo.'}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {items.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: '16px', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#f8fafc', alignItems: 'center' }}>
                      {item.image ? (
                        <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                      ) : (
                        <div style={{ width: '80px', height: '80px', backgroundColor: '#e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '1.5rem' }}>
                          {isGastronomy ? '🍔' : '🛍️'}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{item.name}</h3>
                        {item.description && (
                          <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '0.88rem', lineHeight: 1.3 }}>{item.description}</p>
                        )}
                        {item.price && !isNaN(parseFloat(String(item.price))) && parseFloat(String(item.price)) > 0 ? (
                          <strong style={{ color: '#16a34a', fontSize: '1rem' }}>
                            ${parseFloat(String(item.price)).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </strong>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>Sin precio publicado</span>
                        )}
                      </div>
                      <button onClick={() => handleDeleteItem(item.id)} style={{ padding: '8px', color: '#ef4444', backgroundColor: '#fee2e2', border: 'none', borderRadius: '8px', cursor: 'pointer' }} title="Eliminar">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length < 5 && (
              <div style={{ border: '2px dashed #cbd5e1', borderRadius: '16px', padding: '24px', backgroundColor: '#f8fafc' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
                  <Plus size={20} /> {isGastronomy ? 'Añadir Nuevo Plato' : 'Añadir Producto u Oferta'}
                </h3>
                <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
                        {isGastronomy ? 'Nombre del Plato *' : 'Título / Nombre del Producto *'}
                      </label>
                      <input 
                        required 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                        placeholder={isGastronomy ? 'Ej: Trucha al Limón' : 'Ej: Mate de Alpaca / Poncho'} 
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
                        {isGastronomy ? 'Precio ($) *' : 'Precio ($) (Opcional)'}
                      </label>
                      <input 
                        required={isGastronomy}
                        type="number" 
                        value={formData.price} 
                        onChange={e => setFormData({...formData, price: e.target.value})} 
                        placeholder="0.00" 
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>Descripción (Opcional)</label>
                    <input 
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                      placeholder={isGastronomy ? 'Ej: Acompañada con papas rústicas y ensalada' : 'Ej: Cincelado a mano, incluye bombilla de alpaca...'} 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
                      {isGastronomy ? 'Foto del Plato (Opcional)' : 'Foto del Producto (Opcional)'}
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {formData.image && <img src={formData.image} alt="Preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />}
                      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
                      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} style={{ padding: '8px 16px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {uploadingImage ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                        {formData.image ? 'Cambiar Foto' : 'Subir Foto'}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={saving} style={{ marginTop: '8px', padding: '12px', backgroundColor: 'var(--color-orange)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
                    {saving ? 'Guardando...' : (isGastronomy ? 'Guardar Plato' : 'Guardar Producto')}
                  </button>
                </form>
              </div>
            )}
            {items.length >= 5 && (
              <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f1f5f9', borderRadius: '8px', color: '#475569', fontWeight: 500 }}>
                Has alcanzado el límite máximo de 5 productos u ofertas destacadas.<br/>
                Para añadir uno nuevo, elimina alguno de los existentes.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
