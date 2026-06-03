'use client';

import { Store } from 'lucide-react';

export default function AdhereBanner() {
  return (
    <section className="container" style={{ padding: '40px 20px' }}>
      <a 
        href="https://wa.me/5492942661000?text=Hola!%20Quiero%20sumar%20mi%20comercio%20a%20AlumineGo" 
        target="_blank" 
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
          borderRadius: '24px',
          padding: '32px 24px',
          textAlign: 'center',
          textDecoration: 'none',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          border: '2px solid var(--color-green)',
          transition: 'transform 0.3s ease'
        }}
        className="adhere-banner"
      >
        <div style={{
          backgroundColor: 'var(--color-green)',
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 8px 20px rgba(74, 168, 64, 0.3)'
        }}>
          <Store size={32} color="white" />
        </div>
        
        <h2 style={{ 
          fontSize: '1.8rem', 
          fontWeight: 900, 
          color: 'var(--color-dark-green)',
          marginBottom: '12px',
          fontFamily: 'var(--font-oswald), sans-serif'
        }}>
          ¿TU COMERCIO AÚN NO ESTÁ AQUÍ?
        </h2>
        
        <p style={{ 
          fontSize: '1.1rem', 
          color: 'var(--color-text-muted)',
          maxWidth: '500px',
          lineHeight: '1.5',
          marginBottom: '24px'
        }}>
          ¡No te quedes afuera! Sumate a la guía más completa y empezá a recibir pedidos hoy mismo.
        </p>
        
        <div style={{
          backgroundColor: 'var(--color-orange)',
          color: 'white',
          padding: '12px 32px',
          borderRadius: '12px',
          fontWeight: 800,
          fontSize: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          ADHERITE: 02942 661000
        </div>
      </a>

      <style jsx>{`
        .adhere-banner:hover {
          transform: translateY(-5px);
        }
      `}</style>
    </section>
  );
}
