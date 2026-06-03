'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="container header-container">
        
        {/* Left: Logo */}
        <Link href="/" className="logo-link" style={{ fontSize: '2.2rem', gap: '8px' }}>
          <Image src="/images/logo.png" alt="Logo AlumineGo" width={40} height={40} style={{ objectFit: 'contain' }} />
          <div>
            <span style={{ color: 'var(--color-green)' }}>Aluminé</span>
            <span style={{ color: 'var(--color-orange)' }}>GO</span>
          </div>
        </Link>
        
        {/* Center: Desktop Nav */}
        <nav className="main-nav">
          <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>Inicio</Link>
          <Link href="/comer" className={`nav-link ${pathname === '/comer' ? 'active' : ''}`}>Qué Comer</Link>
          <Link href="/alojarse" className={`nav-link ${pathname === '/alojarse' ? 'active' : ''}`}>Dormir</Link>
          <Link href="/aventuras" className={`nav-link ${pathname === '/aventuras' ? 'active' : ''}`}>Aventuras</Link>
          <Link href="/comercios" className={`nav-link ${pathname === '/comercios' ? 'active' : ''}`}>Guía Local</Link>
          <Link href="/mapa" className={`nav-link ${pathname === '/mapa' ? 'active' : ''}`}>Mapa y Rutas</Link>
        </nav>
        
      </div>
    </header>
  );
}
