'use client';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--color-dark-green)',
      color: 'white',
      padding: '24px 0',
      marginTop: 'auto'
    }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
          <span style={{ color: 'var(--color-green)' }}>Aluminé</span>
          <span style={{ color: 'var(--color-orange)' }}>GO</span>
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1rem' }}>La guía digital y comercial de Aluminé - Patagonia Argentina</p>
        
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
            📱 Descargar App
          </button>
        </div>
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '0.9rem' }}>
          <a href="/novedades" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none' }}>Novedades y Blog</a>
          <a href="/mapa" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none' }}>Mapa</a>
          <a href="/privacidad" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none' }}>Privacidad</a>
          <a href="/terminos" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none' }}>Términos</a>
        </div>

        <div style={{ marginTop: '16px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
          © {new Date().getFullYear()} AluminéGO. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
