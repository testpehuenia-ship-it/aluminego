import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      gap: '24px'
    }}>
      <h1 style={{ fontSize: '4rem', color: 'var(--color-primary-winter)', margin: 0 }}>404</h1>
      <h2 style={{ fontSize: '2rem', margin: 0 }}>Página no encontrada</h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem' }}>
        Lo sentimos, no pudimos encontrar la página que estás buscando en AlumineGo.
      </p>
      <Link href="/" className="btn-primary" style={{ marginTop: '16px' }}>
        Volver al Inicio
      </Link>
    </div>
  );
}
