'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePortal } from '@/components/PortalContext';
import { Loader2, Plus, Trash2, Upload, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PortalMenuPage() {
  const router = useRouter();
  const { user: session, loading } = usePortal();
  
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  
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
            const onlyBusinesses = data.services.filter((s: any) => s.type === 'business');
            setBusinesses(onlyBusinesses);
            if (onlyBusinesses.length > 0) {
              handleSelectBusiness(onlyBusinesses[0]);
            }
          }
        });
    }
  }, [session]);

  const handleSelectBusiness = (business: any) => {
    setSelectedBusiness(business);
    setFetchingItems(true);
    fetch(`/api/portal/menu?businessId=${business.id}`)
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
        if (data.isHeavy) {
          setMessage({ type: 'success', text: 'Imagen subida (optimizada).' });
        } else {
          setMessage({ type: 'success', text: 'Imagen subida correctamente.' });
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al subir la imagen' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión al subir' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusiness) return;
    if (items.length >= 5) {
      setMessage({ type: 'error', text: 'Has alcanzado el límite de 5 ítems de menú permitidos.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/portal/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: selectedBusiness.id,
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          image: formData.image
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setItems([data.item, ...items]);
        setFormData({ name: '', description: '', price: '', image: '' });
        setMessage({ type: 'success', text: 'Plato agregado al menú.' });
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
    if (!confirm('¿Seguro que deseas borrar este plato?')) return;

    try {
      const res = await fetch('/api/portal/menu', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: selectedBusiness.id, itemId })
      });
      const data = await res.json();
      if (data.success) {
        setItems(items.filter(i => i.id !== itemId));
        setMessage({ type: 'success', text: 'Plato eliminado.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al borrar.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de red.' });
    }
  };

  if (loading) return <div style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Loader2 className="animate-spin" size={40} color="var(--color-orange)" /></div>;
  if (!session) return null;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Link href="/portal-comercial" style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', color: 'var(--color-text-main)', border: '1px solid #e2e8f0' }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>Gestión de Menú</h1>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        {businesses.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b' }}>No tienes locales comerciales (gastronomía) asignados.</p>
        ) : (
          <>
            {businesses.length > 1 && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Seleccionar Negocio:</label>
                <select 
                  value={selectedBusiness?.id || ''} 
                  onChange={e => {
                    const s = businesses.find(x => x.id === e.target.value);
                    if (s) handleSelectBusiness(s);
                  }}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', backgroundColor: '#f8fafc' }}
                >
                  {businesses.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
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
                <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700 }}>Mis Platos Destacados</h2>
                <span style={{ backgroundColor: items.length >= 5 ? '#fee2e2' : '#e0f2fe', color: items.length >= 5 ? '#991b1b' : '#0369a1', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  {items.length} / 5
                </span>
              </div>

              {fetchingItems ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><Loader2 className="animate-spin" /></div>
              ) : items.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>No hay platos en tu menú. Agrega tu primer plato destacado abajo.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {items.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: '16px', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#f8fafc', alignItems: 'center' }}>
                      {item.image ? (
                        <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                      ) : (
                        <div style={{ width: '80px', height: '80px', backgroundColor: '#e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>Sin foto</div>
                      )}
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 700 }}>{item.name}</h3>
                        <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '0.9rem' }}>{item.description}</p>
                        <strong style={{ color: 'var(--color-orange)' }}>${item.price.toLocaleString('es-AR')}</strong>
                      </div>
                      <button onClick={() => handleDeleteItem(item.id)} style={{ padding: '8px', color: '#ef4444', backgroundColor: '#fee2e2', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length < 5 && (
              <div style={{ border: '2px dashed #cbd5e1', borderRadius: '16px', padding: '24px', backgroundColor: '#f8fafc' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={20} /> Añadir Nuevo Plato</h3>
                <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>Nombre del Plato *</label>
                      <input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} placeholder="Ej: Trucha al Limón" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>Precio ($) *</label>
                      <input required type="number" value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})} placeholder="Ej: 8500" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>Descripción (Opcional)</label>
                    <input value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} placeholder="Ej: Acompañada con papas rústicas" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>Foto del Plato (Opcional)</label>
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
                    {saving ? 'Guardando...' : 'Guardar Plato'}
                  </button>
                </form>
              </div>
            )}
            {items.length >= 5 && (
              <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f1f5f9', borderRadius: '8px', color: '#475569', fontWeight: 500 }}>
                Has alcanzado el límite máximo de 5 platos destacados.<br/>
                Para añadir uno nuevo, elimina alguno de los existentes.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
