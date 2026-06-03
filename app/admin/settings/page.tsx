'use client';

import React, { useState, useEffect } from 'react';
import { Settings, UserPlus, Key, Trash2, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

type Admin = {
  id: string;
  username: string;
};

export default function SettingsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [creating, setCreating] = useState(false);

  const [updateId, setUpdateId] = useState('');
  const [updatePassword, setUpdatePassword] = useState('');
  const [updating, setUpdating] = useState(false);

  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAdmins();
  }, []);

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
              <input 
                type="password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                required 
                placeholder="Contraseña"
              />
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
              <input 
                type="password" 
                value={updatePassword} 
                onChange={e => setUpdatePassword(e.target.value)} 
                required 
                placeholder="Nueva contraseña"
              />
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
