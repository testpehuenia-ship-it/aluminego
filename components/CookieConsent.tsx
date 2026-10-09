'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, X } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const accepted = localStorage.getItem('pehueniago_cookie_consent_accepted');
      if (!accepted) {
        // Mostrar después de un pequeño retraso para no bloquear el render inicial
        const timer = setTimeout(() => setIsVisible(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // Ignorar en entornos sin acceso a localStorage
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('pehueniago_cookie_consent_accepted', 'true');
    } catch (e) {}
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        right: '20px',
        maxWidth: '520px',
        margin: '0 auto',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        color: '#f8fafc',
        borderRadius: '16px',
        padding: '16px 20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3), 0 0 1px rgba(255,255,255,0.2)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        fontSize: '0.85rem',
        lineHeight: 1.4,
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <div style={{ flexShrink: 0, color: 'var(--color-green)' }}>
        <Shield size={24} />
      </div>

      <div style={{ flex: 1 }}>
        <span>
          Utilizamos cookies esenciales y almacenamiento local para brindarte la mejor experiencia turística (guardar favoritos y analítica). Conocé nuestra{' '}
          <Link 
            href="/privacidad" 
            style={{ color: '#00f0ff', textDecoration: 'underline', fontWeight: 600 }}
          >
            Política de Privacidad
          </Link>.
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <button
          type="button"
          onClick={handleAccept}
          style={{
            backgroundColor: 'var(--color-orange)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            padding: '8px 14px',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            transition: 'transform 0.1s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Aceptar
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Cerrar aviso"
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={18} />
        </button>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
