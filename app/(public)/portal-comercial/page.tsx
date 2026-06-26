"use client";

import React, { useEffect, useState } from 'react';
import { usePortal } from '@/components/PortalContext';
import { useRouter } from 'next/navigation';
import { LogOut, BarChart3, Store, Calendar, TrendingUp, User } from 'lucide-react';
import Link from 'next/link';

export default function PortalDashboard() {
  const { user, loading, logout } = usePortal();
  const router = useRouter();
  
  const [data, setData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/portal-comercial/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetch('/api/portal/dashboard')
        .then(res => res.json())
        .then(res => {
          if (res.success) setData(res.data);
          setDataLoading(false);
        })
        .catch(() => setDataLoading(false));
    }
  }, [user]);

  if (loading || dataLoading || !user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p>Cargando portal...</p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const totalServices = (data?.businesses?.length || 0) + 
                        (data?.accommodations?.length || 0) + 
                        (data?.adventures?.length || 0) + 
                        (data?.localServices?.length || 0);

  let totalClicks = 0;
  if (data?.stats) {
    Object.values(data.stats).forEach((stat: any) => {
      totalClicks += stat.WHATSAPP_CLICK || 0;
    });
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #cbd5e1', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Store size={24} color="var(--color-green)" />
          <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
            Portal Comercial <span style={{ color: 'var(--color-orange)' }}>AluminéGO</span>
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>Hola, {user.name || user.email}</span>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}>
            <LogOut size={18} /> Salir
          </button>
        </div>
      </header>

      {/* Navegación rápida */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #cbd5e1', padding: '12px 24px', display: 'flex', gap: '16px', overflowX: 'auto' }}>
        <Link href="/portal-comercial/perfil" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', textDecoration: 'none', color: '#1e293b', fontWeight: 600, border: '1px solid #e2e8f0' }}>
          <User size={18} /> Editar Perfil
        </Link>
        {data?.businesses && data.businesses.length > 0 && (
          <Link href="/portal-comercial/menu" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', textDecoration: 'none', color: '#1e293b', fontWeight: 600, border: '1px solid #e2e8f0' }}>
            <span>🍔</span> Gestionar Menú
          </Link>
        )}
      </div>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        
        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ backgroundColor: '#e0f2fe', padding: '16px', borderRadius: '12px', color: '#0ea5e9' }}>
              <Store size={32} />
            </div>
            <div>
              <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Tus Comercios/Servicios</p>
              <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-main)' }}>{totalServices}</h2>
            </div>
          </div>

          {/* Ocultado hasta que haya más tráfico 
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ backgroundColor: '#dcfce7', padding: '16px', borderRadius: '12px', color: '#22c55e' }}>
              <BarChart3 size={32} />
            </div>
            <div>
              <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Clics en WhatsApp</p>
              <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-main)' }}>{totalClicks}</h2>
            </div>
          </div>
          */}
        </div>

        {/* List of Services - Ocultado hasta que haya más tráfico
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '20px' }}>Detalle de Clics por Servicio</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          
          {['businesses', 'accommodations', 'adventures', 'localServices'].map(type => {
            if (!data || !data[type]) return null;
            return data[type].map((item: any) => {
              const itemStats = data.stats[item.id] || { WHATSAPP_CLICK: 0 };
              return (
                <div key={item.id} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #cbd5e1' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-green)' }}>{item.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      <TrendingUp size={18} /> Clics a WhatsApp
                    </div>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-orange)' }}>
                      {itemStats.WHATSAPP_CLICK}
                    </span>
                  </div>
                </div>
              );
            });
          })}
          
        </div>
        */}
      </main>
    </div>
  );
}


