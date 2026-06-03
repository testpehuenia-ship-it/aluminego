'use client';
import { Smartphone } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--color-dark-green)',
      color: 'white',
      padding: '24px 0', /* Reducido de 40px 0 100px 0 a 24px 0 */
      marginTop: 'auto'
    }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
          <span style={{ color: 'var(--color-green)' }}>Aluminé</span>
          <span style={{ color: 'var(--color-orange)' }}>GO</span>
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1rem' }}>La guía Oficial de Aluminé - Patagonia Argentina</p>
        
        <div style={{ margin: '16px 0' }}>
          <button 
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).triggerInstallPrompt) {
                (window as any).triggerInstallPrompt();
              }
            }}
            style={{
              backgroundColor: 'var(--color-orange)',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 20px',
              fontSize: '0.95rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Smartphone size={18} color="var(--color-dark-green)" /> Descargar App
          </button>
        </div>

        <div style={{ marginTop: '8px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
          © {new Date().getFullYear()} AlumineGo. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
