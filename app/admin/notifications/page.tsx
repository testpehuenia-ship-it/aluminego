'use client';

import React, { useState, useEffect } from 'react';
import { Send, Bell, Loader2, AlertCircle, CheckCircle2, Users, History, Copy, Trash2 } from 'lucide-react';

interface PushHistoryItem {
  id: string;
  title: string;
  message: string;
  url: string | null;
  sentCount: number;
  errorCount: number;
  createdAt: string;
}

export default function NotificationsAdminPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('');
  const [segment, setSegment] = useState('all');
  
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{type: string, text: string} | null>(null);

  const [history, setHistory] = useState<PushHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/push/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (error) {
      console.error("Error fetching history", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleRepublish = (item: PushHistoryItem) => {
    setTitle(item.title);
    setMessage(item.message);
    if (item.url) setUrl(item.url);
    else setUrl('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta notificación del historial?')) {
      return;
    }

    try {
      const res = await fetch(`/api/push/history?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setResult({ type: 'success', text: 'Notificación eliminada del historial con éxito.' });
        fetchHistory();
      } else {
        const data = await res.json();
        setResult({ type: 'error', text: data.error || 'Error al eliminar la notificación' });
      }
    } catch (error) {
      setResult({ type: 'error', text: 'Error de conexión con el servidor' });
    }
  };

  // Opcional: Podríamos obtener el total de suscriptores con un GET a una API, 
  // pero por ahora podemos simplemente mostrar el formulario.

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      setResult({ type: 'error', text: 'El título y el mensaje son obligatorios' });
      return;
    }

    const segmentNames: Record<string, string> = {
      'all': 'TODOS los usuarios',
      'recent': 'Usuarios NUEVOS (Áºltimos 14 días)',
      'old': 'Usuarios ANTIGUOS (más de 14 días)'
    };

    if (!confirm(`¿Estás seguro de enviar esta notificación a ${segmentNames[segment]}?`)) {
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const res = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, url, segment })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setResult({ 
          type: 'success', 
          text: `¡Enviado con éxito! Llegó a ${data.sent} usuarios (Fallaron: ${data.errors}).` 
        });
        setTitle('');
        setMessage('');
        setUrl('');
        // Refrescar historial
        fetchHistory();
      } else {
        setResult({ type: 'error', text: data.error || 'Error al enviar' });
      }
    } catch (error) {
      setResult({ type: 'error', text: 'Error de conexión con el servidor' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="notifications-page">
      <div className="page-header">
        <h1><Bell className="inline-icon" size={28} /> Notificaciones Push</h1>
        <p>Enviá avisos, descuentos y promociones directamente al celular de los usuarios.</p>
      </div>

      <div className="content-grid">
        <div className="card compose-card">
          <h2>Redactar Notificación</h2>
          
          {result && (
            <div className={`alert ${result.type}`}>
              {result.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              {result.text}
            </div>
          )}

          <form onSubmit={handleSend} className="compose-form">
            <div className="form-group">
              <label>Título (Atractivo y corto)</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="Ej: ¡20% OFF en Cabañas del Lago!"
                maxLength={50}
                required
              />
              <span className="char-count">{title.length}/50</span>
            </div>

            <div className="form-group">
              <label>Mensaje descriptivo</label>
              <textarea 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                placeholder="Ej: Reservá hoy y obtené un descuento exclusivo mostrando esta notificación."
                rows={3}
                maxLength={120}
                required
              />
              <span className="char-count">{message.length}/120</span>
            </div>

            <div className="form-group">
              <label>Link / URL al tocar (Opcional)</label>
              <input 
                type="text" 
                value={url} 
                onChange={e => setUrl(e.target.value)} 
                placeholder="Ej: https://AluminéGO.ar/alojarse (Por defecto va al inicio)"
              />
            </div>

            <div className="form-group">
              <label>Segmento (A quiénes enviar)</label>
              <select value={segment} onChange={e => setSegment(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', backgroundColor: 'white' }}>
                <option value="all">Todos los usuarios suscritos</option>
                <option value="recent">Usuarios Nuevos (Suscritos hace menos de 14 días)</option>
                <option value="old">Usuarios Antiguos (Suscritos hace más de 14 días)</option>
              </select>
            </div>

            <div className="warning-box">
              <AlertCircle size={20} />
              <p>Al hacer clic en enviar, el mensaje llegará al instante a todos los celulares suscritos. <b>¡Revisá la ortografía!</b></p>
            </div>

            <button type="submit" disabled={sending} className="btn-send">
              {sending ? (
                <><Loader2 className="animate-spin" size={20} /> Enviando a todos...</>
              ) : (
                <><Send size={20} /> Enviar Notificación Masiva</>
              )}
            </button>
          </form>
        </div>

        <div className="card info-card">
          <h2><Users size={20} className="inline-icon" /> Sobre las Notificaciones</h2>
          <div className="info-content">
            <p>Las notificaciones Push te permiten llegar directamente a la pantalla de bloqueo de los usuarios que aceptaron recibir alertas.</p>
            <ul>
              <li><b>Tasa de apertura:</b> Mucho mayor que el email.</li>
              <li><b>Uso ideal:</b> Promociones de fin de semana, alertas de clima, nuevos comercios adheridos.</li>
              <li><b>Frecuencia:</b> Recomendamos enviar 1 o 2 por semana para no saturar al usuario.</li>
            </ul>
            
            <div className="preview-phone">
              <div className="preview-header">
                <img src="/icon.png" alt="icon" className="preview-icon" />
                <span>AluminéGO • Ahora</span>
              </div>
              <div className="preview-body">
                <strong>{title || 'Título de ejemplo'}</strong>
                <p>{message || 'Acá se verá el texto de tu mensaje cuando lo escribas.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="history-section mt-8">
        <h2 className="history-title"><History size={24} className="inline-icon" /> Historial de Envíos</h2>
        
        {loadingHistory ? (
          <div className="loading-state">
            <Loader2 className="animate-spin" size={24} /> Cargando historial...
          </div>
        ) : history.length === 0 ? (
          <div className="empty-state">
            No hay notificaciones enviadas todavía.
          </div>
        ) : (
          <div className="history-grid">
            {history.map(item => (
              <div key={item.id} className="history-card">
                <div className="history-card-header">
                  <span className="history-date">
                    {new Date(item.createdAt).toLocaleDateString('es-AR', {
                      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                  <div className="history-stats">
                    <span className="stat-success"><CheckCircle2 size={14} /> {item.sentCount}</span>
                    {item.errorCount > 0 && <span className="stat-error"><AlertCircle size={14} /> {item.errorCount}</span>}
                  </div>
                </div>
                <div className="history-card-body">
                  <h3 className="history-item-title">{item.title}</h3>
                  <p className="history-item-message">{item.message}</p>
                  {item.url && <p className="history-item-url">Link: {item.url}</p>}
                </div>
                <div className="history-card-footer">
                  <button onClick={() => handleRepublish(item)} className="btn-republish">
                    <Copy size={16} /> Usar como plantilla
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)} 
                    className="btn-delete-history"
                    title="Eliminar del historial/plantilla"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .notifications-page {
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
          color: #ea580c; /* Naranja para notificaciones */
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 24px;
        }

        .card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
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

        .compose-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          position: relative;
        }

        .form-group label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #475569;
        }

        .form-group input, .form-group textarea {
          padding: 12px;
          border: 1.5px solid #cbd5e1;
          border-radius: 10px;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s;
          font-family: inherit;
        }

        .form-group input:focus, .form-group textarea:focus {
          border-color: #ea580c;
          box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.1);
        }

        .char-count {
          position: absolute;
          right: 0;
          top: 0;
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .warning-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background-color: #fffbeb;
          border: 1px solid #fde68a;
          color: #92400e;
          padding: 16px;
          border-radius: 12px;
          font-size: 0.9rem;
        }

        .btn-send {
          background-color: #ea580c;
          color: white;
          border: none;
          padding: 16px;
          border-radius: 12px;
          font-size: 1.05rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s;
          margin-top: 8px;
        }

        .btn-send:hover:not(:disabled) {
          background-color: #c2410c;
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(234, 88, 12, 0.2);
        }

        .btn-send:disabled {
          background-color: #cbd5e1;
          cursor: not-allowed;
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

        .info-content p {
          color: #475569;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .info-content ul {
          color: #475569;
          padding-left: 20px;
          margin-bottom: 24px;
        }

        .info-content li {
          margin-bottom: 8px;
        }

        .preview-phone {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px;
          position: relative;
        }

        .preview-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          color: #64748b;
          margin-bottom: 8px;
        }

        .preview-icon {
          width: 16px;
          height: 16px;
          border-radius: 4px;
        }

        .preview-body strong {
          display: block;
          font-size: 0.95rem;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .preview-body p {
          font-size: 0.85rem;
          color: #475569;
          margin: 0;
        }

        @media (max-width: 992px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
        }

        .mt-8 { margin-top: 32px; }
        
        .history-title {
          font-size: 1.5rem;
          color: #1e293b;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .loading-state, .empty-state {
          padding: 32px;
          text-align: center;
          color: #64748b;
          background: white;
          border-radius: 16px;
          border: 1px dashed #cbd5e1;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
        }

        .history-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .history-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .history-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .history-card-header {
          padding: 12px 16px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .history-date {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 500;
        }

        .history-stats {
          display: flex;
          gap: 8px;
        }

        .stat-success {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: #166534;
          background: #dcfce7;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 600;
        }

        .stat-error {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: #991b1b;
          background: #fee2e2;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 600;
        }

        .history-card-body {
          padding: 16px;
          flex-grow: 1;
        }

        .history-item-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
        }

        .history-item-message {
          font-size: 0.9rem;
          color: #475569;
          line-height: 1.5;
          margin-bottom: 8px;
        }

        .history-item-url {
          font-size: 0.8rem;
          color: #0284c7;
          word-break: break-all;
        }

        .history-card-footer {
          padding: 12px 16px;
          border-top: 1px solid #e2e8f0;
          background: #fff;
          display: flex;
          gap: 8px;
        }

        .btn-republish {
          flex-grow: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          padding: 8px;
          background: #f1f5f9;
          color: #334155;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.2s;
          cursor: pointer;
        }

        .btn-republish:hover {
          background: #ea580c;
          color: white;
        }

        .btn-delete-history {
          padding: 8px 12px;
          background: #fee2e2;
          color: #ef4444;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-delete-history:hover {
          background: #fca5a5;
          color: #b91c1c;
        }
      `}</style>
    </div>
  );
}


