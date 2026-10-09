'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Loader2,
  LayoutDashboard, 
  Store, 
  Home, 
  Settings, 
  LogOut, 
  Menu as MenuIcon,
  ChevronRight,
  Tags,
  Mountain,
  MapPin,
  Map,
  CreditCard,
  DollarSign,
  Bell,
  BookOpen,
  MessageSquare,
  Utensils
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  // No mostramos el sidebar en la página de login
  const isLoginPage = pathname === '/admin/login' || pathname === '/admin';
  const [authChecking, setAuthChecking] = React.useState(!isLoginPage);
  const [adminUser, setAdminUser] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isLoginPage) {
      setAuthChecking(false);
      return;
    }

    fetch('/api/auth')
      .then(res => {
        if (!res.ok) {
          router.replace('/admin');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data?.authenticated) {
          setAdminUser(data.user?.username || 'Administrador');
          setAuthChecking(false);
        } else {
          router.replace('/admin');
        }
      })
      .catch(() => {
        router.replace('/admin');
      });
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
    } catch (e) {}
    router.replace('/admin');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: Tags, label: 'Categorías', href: '/admin/categories' },
    { icon: Utensils, label: 'Gastronomía', href: '/admin/businesses' },
    { icon: Store, label: 'Comercios', href: '/admin/commerces' },
    { icon: Home, label: 'Alojamientos', href: '/admin/accommodations' },
    { icon: Mountain, label: 'Aventuras', href: '/admin/adventures' },
    { icon: MapPin, label: 'Guía Local', href: '/admin/local-services' },
    { icon: Map, label: 'Mapas y Rutas', href: '/admin/map' },
    { icon: BookOpen, label: 'Novedades / Blog', href: '/admin/blog' },
    { icon: Bell, label: 'Notificaciones', href: '/admin/notifications' },
    { icon: MessageSquare, label: 'Reseñas', href: '/admin/reviews' },
    { icon: Store, label: 'Publicidad', href: '/admin/publicity' },
    { icon: CreditCard, label: 'Pagos', href: '/admin/billing' },
    { icon: DollarSign, label: 'Tarifario', href: '/admin/pricing' },
    { icon: Settings, label: 'Configuración', href: '/admin/settings' },
  ];

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (authChecking) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc', gap: '12px' }}>
        <Loader2 className="animate-spin text-teal-600" size={36} />
        <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Verificando credenciales de administrador...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <span className="logo-text">Pehuenia<span>GO</span></span>
            <span className="admin-badge">Admin</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="sidebar-toggle">
            <MenuIcon size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span className="nav-label">{item.label}</span>
                {isActive && <ChevronRight size={16} className="active-indicator" />}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button 
            type="button"
            onClick={handleLogout} 
            className="nav-item logout" 
            style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            <LogOut size={20} />
            <span className="nav-label">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Overlay para móviles */}
      {isSidebarOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <button 
              className="mobile-menu-btn" 
              onClick={() => setIsSidebarOpen(true)}
            >
              <MenuIcon size={24} />
            </button>
            <div className="header-search">
              {/* Aquí podría ir un buscador global */}
            </div>
          </div>
          <div className="header-user">
            <div className="user-info">
              <span className="user-name">{adminUser || 'Súper Admin'}</span>
              <span className="user-role">Administrador Principal</span>
            </div>
            <div className="user-avatar">{adminUser ? adminUser.slice(0, 2).toUpperCase() : 'AD'}</div>
          </div>
        </header>

        <div className="admin-content">
          {children}
        </div>
      </main>

      <style jsx>{`
        .admin-container {
          display: flex;
          min-height: 100vh;
          background-color: #f8fafc;
          color: #1e293b;
          font-family: 'Inter', sans-serif;
        }

        .admin-sidebar {
          width: 260px;
          background-color: #ffffff;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          position: sticky;
          top: 0;
          height: 100vh;
        }

        .admin-sidebar.closed {
          width: 80px;
        }

        .sidebar-header {
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #f1f5f9;
        }

        .logo-text {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0d9488;
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .logo-text span {
          color: #ea580c;
        }

        .admin-badge {
          font-size: 0.65rem;
          background: #f1f5f9;
          padding: 2px 6px;
          border-radius: 4px;
          margin-left: 8px;
          text-transform: uppercase;
          font-weight: 600;
          color: #64748b;
        }

        .sidebar-toggle {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
        }

        .sidebar-toggle:hover {
          background: #f1f5f9;
        }

        .sidebar-nav {
          flex: 1;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          color: #64748b;
          text-decoration: none;
          transition: all 0.2s ease;
          position: relative;
        }

        .nav-item:hover {
          background-color: #f1f5f9;
          color: #1e293b;
        }

        .nav-item.active {
          background-color: #f0fdfa;
          color: #0d9488;
          font-weight: 600;
        }

        .active-indicator {
          margin-left: auto;
        }

        .nav-label {
          white-space: nowrap;
          overflow: hidden;
          opacity: 1;
          transition: opacity 0.2s ease;
        }

        .closed .nav-label, 
        .closed .admin-badge,
        .closed .logo-text {
          display: none;
        }

        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid #f1f5f9;
        }

        .logout {
          color: #ef4444;
        }

        .logout:hover {
          background-color: #fef2f2;
          color: #dc2626;
        }

        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          max-width: 100%;
        }

        .admin-header {
          height: 70px;
          background-color: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-user {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .user-name {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .user-role {
          font-size: 0.75rem;
          color: #64748b;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .admin-content {
          padding: 32px;
          flex: 1;
          overflow-y: auto;
        }

        .mobile-overlay {
          display: none;
        }

        .header-left {
          display: flex;
          align-items: center;
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 8px;
          margin-right: 8px;
          border-radius: 6px;
        }

        .mobile-menu-btn:hover {
          background-color: #f1f5f9;
          color: #1e293b;
        }

        @media (max-width: 768px) {
          .admin-sidebar {
            position: fixed;
            z-index: 50;
            left: -260px;
          }
          .admin-sidebar.open {
            left: 0;
          }
          .admin-header {
            padding: 0 16px;
          }
          .mobile-menu-btn {
            display: flex;
          }
          .mobile-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background-color: rgba(0, 0, 0, 0.4);
            z-index: 40;
            backdrop-filter: blur(2px);
          }
        }
      `}</style>
    </div>
  );
}
