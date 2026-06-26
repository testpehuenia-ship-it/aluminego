'use client';

import React, { useState } from 'react';
import { Star, MessageSquare, Loader2 } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string;
  author: string;
  email?: string | null;
  approved: boolean;
  createdAt: string | Date;
}

interface ReviewSectionProps {
  entityId: string;
  entityType: 'business' | 'accommodation' | 'adventure' | 'localservice' | 'commerce';
  initialReviews?: Review[];
}

export default function ReviewSection({
  entityId,
  entityType,
  initialReviews = []
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [author, setAuthor] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);

  // Calcular promedio de estrellas
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  // Contadores para distribución
  const starCounts = [0, 0, 0, 0, 0]; // 1, 2, 3, 4, 5 estrellas
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) {
      starCounts[r.rating - 1]++;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!author.trim() || !comment.trim()) {
      setError('Por favor complete todos los campos obligatorios.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          comment,
          author,
          email: email.trim() || null,
          entityId,
          entityType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocurrió un error al enviar la reseña');
      }

      // Añadir la reseña creada al estado local
      const newReview: Review = {
        id: data.review.id,
        rating: data.review.rating,
        comment: data.review.comment,
        author: data.review.author,
        email: data.review.email,
        approved: data.review.approved,
        createdAt: new Date(data.review.createdAt),
      };

      setReviews([newReview, ...reviews]);
      setSuccess(true);
      setAuthor('');
      setEmail('');
      setComment('');
      setRating(5);
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || 'Error de red. Inténtelo más tarde.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateInput: string | Date) => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div style={{ marginTop: '32px' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <MessageSquare size={26} color="var(--color-green)" />
        Opiniones de los Visitantes
      </h2>

      {/* Caja de resumen de calificaciones */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        backgroundColor: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '24px',
        border: '1px solid var(--color-border)'
      }}>
        {/* Promedio General */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: totalReviews > 0 ? '1px solid var(--color-border)' : 'none', paddingRight: '12px' }}>
          <div style={{ fontSize: '3.5rem', fontWeight: 850, color: 'var(--color-text-main)', lineHeight: '1.1' }}>
            {averageRating}
          </div>
          <div style={{ display: 'flex', gap: '4px', margin: '8px 0' }}>
            {[1, 2, 3, 4, 5].map((star) => {
              const numVal = parseFloat(averageRating);
              const filled = star <= Math.round(numVal);
              return (
                <Star
                  key={star}
                  size={20}
                  color="#fbbf24"
                  fill={filled ? '#fbbf24' : 'none'}
                />
              );
            })}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 550 }}>
            {totalReviews === 0 ? 'Sin opiniones' : `${totalReviews} ${totalReviews === 1 ? 'opinión' : 'opiniones'}`}
          </div>
        </div>

        {/* Distribución de estrellas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
          {[5, 4, 3, 2, 1].map((starNum) => {
            const count = starCounts[starNum - 1];
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={starNum} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                <span style={{ width: '12px', fontWeight: 'bold', color: 'var(--color-text-main)' }}>{starNum}</span>
                <Star size={14} color="#fbbf24" fill="#fbbf24" />
                <div style={{ flex: 1, height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: 'var(--color-orange)', borderRadius: '4px' }} />
                </div>
                <span style={{ width: '30px', textAlign: 'right', color: 'var(--color-text-muted)' }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Botón para desplegar Formulario */}
      {!showForm && (
        <button
          onClick={() => {
            setShowForm(true);
            setSuccess(false);
          }}
          style={{
            backgroundColor: 'var(--color-green)',
            color: 'white',
            fontWeight: 'bold',
            padding: '12px 24px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px',
            boxShadow: 'var(--shadow-sm)',
            transition: 'transform 0.2s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Escribir una opinión
        </button>
      )}

      {/* Formulario de Calificación */}
      {showForm && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '24px',
          border: '1px solid var(--color-border)',
          animation: 'fadeIn 0.3s ease'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', color: 'var(--color-text-main)' }}>
            Nueva opinión
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                {error}
              </div>
            )}

            {/* Selector de Estrellas */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.95rem', color: 'var(--color-text-main)' }}>
                Calificación *
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = hoverRating !== null ? star <= hoverRating : star <= rating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      style={{ cursor: 'pointer', outline: 'none', transition: 'transform 0.1s' }}
                      onFocus={() => setHoverRating(star)}
                      onBlur={() => setHoverRating(null)}
                    >
                      <Star
                        size={28}
                        color="#fbbf24"
                        fill={active ? '#fbbf24' : 'none'}
                        style={{ transform: active ? 'scale(1.1)' : 'scale(1)' }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nombre y Email */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.95rem', color: 'var(--color-text-main)' }}>
                  Nombre *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    outline: 'none',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.95rem', color: 'var(--color-text-main)' }}>
                  Email <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 'normal' }}>(no se publicará)</span>
                </label>
                <input
                  type="email"
                  placeholder="juan@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    outline: 'none',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </div>

            {/* Comentario */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.95rem', color: 'var(--color-text-main)' }}>
                Comentario *
              </label>
              <textarea
                placeholder="Escribe tu opinión sobre tu experiencia aquí..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  outline: 'none',
                  fontSize: '0.95rem',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  backgroundColor: 'var(--color-orange)',
                  color: 'white',
                  fontWeight: 'bold',
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Publicar Opinión'
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-muted)',
                  fontWeight: 'bold',
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Success Banner */}
      {success && (
        <div style={{
          backgroundColor: '#d1fae5',
          color: '#065f46',
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '24px',
          fontWeight: 'bold',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div>¡Gracias por tu opinión!</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 'normal' }}>Tu calificación y comentario se han registrado y ya están visibles.</div>
        </div>
      )}

      {/* Listado de Opiniones */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {totalReviews === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-muted)'
          }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>Aún no hay opiniones</p>
            <p style={{ fontSize: '0.9rem' }}>Sé el primero en calificar tu experiencia.</p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              style={{
                backgroundColor: 'white',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                    {rev.author}
                  </h4>
                  <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        color="#fbbf24"
                        fill={star <= rev.rating ? '#fbbf24' : 'none'}
                      />
                    ))}
                  </div>
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  {formatDate(rev.createdAt)}
                </span>
              </div>
              <p style={{ margin: 0, color: '#374151', fontSize: '0.98rem', whiteSpace: 'pre-line' }}>
                {rev.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
