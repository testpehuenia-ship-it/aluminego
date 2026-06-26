'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  Loader2, 
  Star,
  MessageSquare
} from 'lucide-react';

interface FormattedReview {
  id: string;
  rating: number;
  comment: string;
  author: string;
  email?: string | null;
  approved: boolean;
  createdAt: string;
  entityName: string;
  entityType: string;
}

export default function ReviewsAdminPage() {
  const [reviews, setReviews] = useState<FormattedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (e) {
      console.error('Error fetching reviews:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de que desea eliminar esta opinión? Esta acción no se puede deshacer.')) {
      return;
    }

    setDeletingId(id);

    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Remover de la lista local
        setReviews(reviews.filter((r) => r.id !== id));
      } else {
        const data = await res.json();
        alert('Error al eliminar reseña: ' + (data.error || 'error desconocido'));
      }
    } catch (err) {
      alert('Error de conexión al eliminar');
    } finally {
      setDeletingId(null);
    }
  };

  // Filtrado de búsquedas
  const filteredReviews = reviews.filter((r) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      r.author.toLowerCase().includes(searchLower) ||
      r.comment.toLowerCase().includes(searchLower) ||
      r.entityName.toLowerCase().includes(searchLower) ||
      r.entityType.toLowerCase().includes(searchLower) ||
      (r.email && r.email.toLowerCase().includes(searchLower))
    );
  });

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-view">
      <div className="view-header">
        <div>
          <h1>Reseñas y Calificaciones</h1>
          <p>Modera y gestiona las opiniones de los turistas en el portal</p>
        </div>
      </div>

      <div className="content-card">
        <div className="toolbar">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar por autor, comentario o comercio..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="count-badge">{filteredReviews.length} opiniones</div>
        </div>

        {loading ? (
          <div className="loading-state">
            <Loader2 size={40} className="animate-spin" />
            <p>Cargando opiniones...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
            color: 'var(--color-text-muted)',
            textAlign: 'center'
          }}>
            <MessageSquare size={48} style={{ marginBottom: '16px', color: '#cbd5e1' }} />
            <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>No se encontraron reseñas</p>
            <p style={{ fontSize: '0.9rem' }}>{searchTerm ? 'Intenta buscando con otros términos.' : 'Aún no se han recibido opiniones en el portal.'}</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '15%' }}>Establecimiento / Tipo</th>
                  <th style={{ width: '15%' }}>Autor / Contacto</th>
                  <th style={{ width: '10%' }}>Calificación</th>
                  <th style={{ width: '40%' }}>Comentario</th>
                  <th style={{ width: '12%' }}>Fecha</th>
                  <th style={{ width: '8%', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((rev) => (
                  <tr key={rev.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--color-text-main)' }}>{rev.entityName}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginTop: '2px', fontWeight: 600 }}>
                          {rev.entityType}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="bold">{rev.author}</span>
                        {rev.email && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                            {rev.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold', marginRight: '4px', color: 'var(--color-text-main)' }}>{rev.rating}</span>
                        <Star size={16} color="#fbbf24" fill="#fbbf24" />
                      </div>
                    </td>
                    <td>
                      <div style={{ 
                        maxHeight: '100px', 
                        overflowY: 'auto', 
                        fontSize: '0.9rem', 
                        lineHeight: '1.4',
                        whiteSpace: 'pre-line',
                        color: 'var(--color-text-main)'
                      }}>
                        {rev.comment}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      {formatDate(rev.createdAt)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="actions-cell" style={{ justifyContent: 'center' }}>
                        <button 
                          className="icon-btn delete" 
                          title="Eliminar Opinión" 
                          onClick={() => handleDelete(rev.id)}
                          disabled={deletingId === rev.id}
                        >
                          {deletingId === rev.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
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
    </div>
  );
}
