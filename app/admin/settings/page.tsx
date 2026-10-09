'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Settings, UserPlus, Key, Trash2, Loader2, AlertCircle, CheckCircle2, Radio, Play, Pause, Volume2, Globe, Eye, EyeOff } from 'lucide-react';

type Admin = {
  id: string;
  username: string;
};

export default function SettingsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [creating, setCreating] = useState(false);

  const [updateId, setUpdateId] = useState('');
  const [updatePassword, setUpdatePassword] = useState('');
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Configuración de Radio FM Golfo Azul
  const [radioConfig, setRadioConfig] = useState({
    streamUrl: '',
    fallbackStreamUrl: '',
    name: 'FM Golfo Azul',
    frequency: '92.5 MHZ',
    slogan: 'Radio de Montaña, Capital de la música',
    city: 'Villa Pehuenia',
    isActive: true
  });
  const [savingRadio, setSavingRadio] = useState(false);
  const [testingRadio, setTestingRadio] = useState(false);
  const testAudioRef = useRef<HTMLAudioElement | null>(null);

  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAdmins();
    fetchRadioConfig();
  }, []);

  const fetchRadioConfig = async () => {
    try {
      const res = await fetch('/api/radio');
      const data = await res.json();
      if (data && data.streamUrl !== undefined) {
        setRadioConfig(data);
      }
    } catch (error) {
      console.error('Error al cargar configuración de radio:', error);
    }
  };

  const handleSaveRadio = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRadio(true);
    try {
      const res = await fetch('/api/radio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(radioConfig)
      });
      const data = await res.json();
      if (res.ok) {
        showMessage('success', 'Configuración de Radio guardada correctamente');
        if (data.config) setRadioConfig(data.config);
      } else {
        showMessage('error', data.error || 'Error al guardar la radio');
      }
    } catch (error) {
      showMessage('error', 'Error de conexión al guardar radio');
    } finally {
      setSavingRadio(false);
    }
  };

  const toggleTestRadio = () => {
    if (!testAudioRef.current) return;
    if (testingRadio) {
      testAudioRef.current.pause();
      setTestingRadio(false);
    } else {
      if (!radioConfig.streamUrl) {
        showMessage('error', 'Ingresá una URL de streaming para probar');
        return;
      }
      testAudioRef.current.src = radioConfig.streamUrl;
      testAudioRef.current.load();
      testAudioRef.current.play()
        .then(() => setTestingRadio(true))
        .catch((err) => {
          console.error('Error probando audio:', err);
          showMessage('error', 'No se pudo reproducir la transmisión. Verificá la URL.');
          setTestingRadio(false);
        });
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admins');
      const data = await res.json();
      if (Array.isArray(data)) {
        setAdmins(data);
      }
    } catch (error) {
      showMessage('error', 'Error al cargar administradores');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        showMessage('success', 'Administrador creado correctamente');
        setNewUsername('');
        setNewPassword('');
        fetchAdmins();
      } else {
        showMessage('error', data.error || 'Error al crear');
      }
    } catch (error) {
      showMessage('error', 'Error de conexión');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateId) return showMessage('error', 'Selecciona un usuario');
    setUpdating(true);
    try {
      const res = await fetch('/api/admins', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: updateId, password: updatePassword })
      });
      const data = await res.json();
      if (res.ok) {
        showMessage('success', 'Contraseña actualizada correctamente');
        setUpdateId('');
        setUpdatePassword('');
      } else {
        showMessage('error', data.error || 'Error al actualizar');
      }
    } catch (error) {
      showMessage('error', 'Error de conexión');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este administrador?')) return;
    try {
      const res = await fetch(`/api/admins?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showMessage('success', 'Administrador eliminado');
        fetchAdmins();
      } else {
        showMessage('error', data.error || 'Error al eliminar');
      }
    } catch (error) {
      showMessage('error', 'Error de conexión');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-teal-600" size={48} />
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1><Settings className="inline-icon" size={28} /> Configuración</h1>
        <p>Gestioná los accesos y credenciales del panel de administración</p>
      </div>

      {message.text && (
        <div className={`alert ${message.type}`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      <div className="settings-grid">
        {/* Configuración de Radio FM Golfo Azul */}
        <div className="card full-width-card" style={{ gridColumn: '1 / -1', borderLeft: '4px solid #0d9488' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ margin: 0, padding: 0, border: 'none' }}>
                <Radio size={22} className="inline-icon" style={{ color: '#0d9488' }} /> Transmisión de Radio FM Golfo Azul (92.5 MHz)
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px', margin: 0 }}>
                Controlá el link de streaming en vivo, frecuencias y el reproductor de la página principal
              </p>
            </div>
            
            {/* Audio de prueba oculto */}
            <audio 
              ref={testAudioRef} 
              onEnded={() => setTestingRadio(false)} 
              onError={() => { 
                setTestingRadio(false); 
                showMessage('error', 'Error al reproducir audio de prueba. Verificá la URL ingresada.'); 
              }} 
            />

            <button
              type="button"
              onClick={toggleTestRadio}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #0d9488',
                backgroundColor: testingRadio ? '#0d9488' : '#f0fdfa',
                color: testingRadio ? 'white' : '#0f766e',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {testingRadio ? <Pause size={18} /> : <Play size={18} />}
              {testingRadio ? 'Detener Prueba' : 'Probar Señal en Vivo'}
            </button>
          </div>

          <form onSubmit={handleSaveRadio} className="settings-form">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label>URL de Streaming Principal *</label>
                <input
                  type="url"
                  value={radioConfig.streamUrl}
                  onChange={e => setRadioConfig({ ...radioConfig, streamUrl: e.target.value })}
                  placeholder="https://streaming01.shockmedia.com.ar/9180/stream"
                  required
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Enlace de audio directo (HTTPS puerto 443 recomendado)
                </span>
              </div>

              <div className="form-group">
                <label>URL de Streaming Secundaria / Fallback (Opcional)</label>
                <input
                  type="url"
                  value={radioConfig.fallbackStreamUrl}
                  onChange={e => setRadioConfig({ ...radioConfig, fallbackStreamUrl: e.target.value })}
                  placeholder="https://streaming01.shockmedia.com.ar:10798/stream"
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Se utilizará automáticamente si la transmisión principal no responde
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '12px' }}>
              <div className="form-group">
                <label>Nombre de la Radio</label>
                <input
                  type="text"
                  value={radioConfig.name}
                  onChange={e => setRadioConfig({ ...radioConfig, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Frecuencia / Dial</label>
                <input
                  type="text"
                  value={radioConfig.frequency}
                  onChange={e => setRadioConfig({ ...radioConfig, frequency: e.target.value })}
                  placeholder="92.5 MHZ"
                  required
                />
              </div>

              <div className="form-group">
                <label>Slogan de la Emisora</label>
                <input
                  type="text"
                  value={radioConfig.slogan}
                  onChange={e => setRadioConfig({ ...radioConfig, slogan: e.target.value })}
                  placeholder="Radio de Montaña, Capital de la música"
                />
              </div>

              <div className="form-group">
                <label>Ciudad / Localidad</label>
                <input
                  type="text"
                  value={radioConfig.city}
                  onChange={e => setRadioConfig({ ...radioConfig, city: e.target.value })}
                  placeholder="Villa Pehuenia"
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
              <input
                type="checkbox"
                id="radioActive"
                checked={radioConfig.isActive}
                onChange={e => setRadioConfig({ ...radioConfig, isActive: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0d9488' }}
              />
              <label htmlFor="radioActive" style={{ cursor: 'pointer', fontWeight: 600, color: '#1e293b', margin: 0 }}>
                Habilitar reproductor de radio en la página principal (debajo del clima)
              </label>
            </div>

            <div style={{ marginTop: '20px' }}>
              <button type="submit" disabled={savingRadio} className="btn-primary" style={{ minWidth: '220px' }}>
                {savingRadio ? <Loader2 className="animate-spin" size={18} /> : 'Guardar Configuración de Radio'}
              </button>
            </div>
          </form>
        </div>

        {/* Lista de Admins */}
        <div className="card">
          <h2>Administradores Actuales</h2>
          <div className="admin-list">
            {admins.map(admin => (
              <div key={admin.id} className="admin-item">
                <span className="admin-name">{admin.username}</span>
                <button 
                  onClick={() => handleDeleteAdmin(admin.id)}
                  className="btn-icon btn-danger"
                  title="Eliminar administrador"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Crear Admin */}
        <div className="card">
          <h2><UserPlus size={20} className="inline-icon" /> Nuevo Administrador</h2>
          <form onSubmit={handleCreateAdmin} className="settings-form">
            <div className="form-group">
              <label>Usuario</label>
              <input 
                type="text" 
                value={newUsername} 
                onChange={e => setNewUsername(e.target.value)} 
                required 
                placeholder="Nombre de usuario"
              />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input 
                  type={showNewPassword ? "text" : "password"} 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  required 
                  placeholder="Contraseña"
                  style={{ width: '100%', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                  title={showNewPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={creating} className="btn-primary">
              {creating ? <Loader2 className="animate-spin" size={18} /> : 'Crear Administrador'}
            </button>
          </form>
        </div>

        {/* Cambiar Contraseña */}
        <div className="card">
          <h2><Key size={20} className="inline-icon" /> Cambiar Contraseña</h2>
          <form onSubmit={handleUpdatePassword} className="settings-form">
            <div className="form-group">
              <label>Seleccionar Usuario</label>
              <select 
                value={updateId} 
                onChange={e => setUpdateId(e.target.value)}
                required
              >
                <option value="">-- Selecciona un usuario --</option>
                {admins.map(admin => (
                  <option key={admin.id} value={admin.id}>{admin.username}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Nueva Contraseña</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input 
                  type={showUpdatePassword ? "text" : "password"} 
                  value={updatePassword} 
                  onChange={e => setUpdatePassword(e.target.value)} 
                  required 
                  placeholder="Nueva contraseña"
                  style={{ width: '100%', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowUpdatePassword(!showUpdatePassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                  title={showUpdatePassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showUpdatePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={updating} className="btn-primary">
              {updating ? <Loader2 className="animate-spin" size={18} /> : 'Actualizar Contraseña'}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .settings-page {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 32px;
        }

        .page-header h1 {
          font-size: 2rem;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .page-header p {
          color: #64748b;
        }

        .inline-icon {
          color: #0d9488;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 24px;
          font-weight: 500;
        }

        .alert.success {
          background-color: #f0fdf4;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .alert.error {
          background-color: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
        }

        .card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          border: 1px solid #f1f5f9;
        }

        .card h2 {
          font-size: 1.25rem;
          color: #1e293b;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f1f5f9;
        }

        .admin-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .admin-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background-color: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .admin-name {
          font-weight: 600;
          color: #334155;
        }

        .btn-icon {
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-danger {
          color: #ef4444;
        }

        .btn-danger:hover {
          background-color: #fee2e2;
        }

        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #475569;
        }

        .form-group input, .form-group select {
          padding: 10px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s;
        }

        .form-group input:focus, .form-group select:focus {
          border-color: #0d9488;
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
        }

        .btn-primary {
          background-color: #0d9488;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background-color 0.2s;
          margin-top: 8px;
        }

        .btn-primary:hover {
          background-color: #0f766e;
        }

        .btn-primary:disabled {
          background-color: #94a3b8;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
