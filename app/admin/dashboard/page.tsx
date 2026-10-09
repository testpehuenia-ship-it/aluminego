'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Store, 
  Home, 
  TrendingUp, 
  Plus, 
  Calendar,
  AlertCircle,
  Map,
  Activity,
  BarChart2,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Utensils,
  Mountain,
  Smartphone,
  Download,
  Bell,
  CheckCircle2,
  X
} from 'lucide-react';
import { 
  LineChart, Line, 
  BarChart, Bar, 
  AreaChart, Area, 
  PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

type AnalyticsData = {
  today: number;
  month: number;
  year: number;
  pageVisits: { path: string; count: number }[];
  chartData: { date: string; visits: number }[];
};

type AppStatsData = {
  totalInstalled: number;
  totalDevices: number;
  activeToday: number;
  active7Days: number;
  active30Days: number;
  totalSessions: number;
  pushCount: number;
  pushPercentage: number;
  platforms: {
    Android: number;
    iOS: number;
    Windows: number;
    macOS: number;
    Otro: number;
  };
  recentInstallations: {
    id: string;
    platform: string;
    browser: string | null;
    hasPush: boolean;
    installedAt: string;
    lastActiveAt: string;
    sessionCount: number;
    language: string | null;
    screenSize: string | null;
  }[];
};

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    categories: 0,
    businesses: [] as any[],
    accommodations: [] as any[],
    adventures: [] as any[],
    commerces: [] as any[],
  });
  
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    today: 0,
    month: 0,
    year: 0,
    pageVisits: [],
    chartData: []
  });

  const [appStats, setAppStats] = useState<AppStatsData>({
    totalInstalled: 0,
    totalDevices: 0,
    activeToday: 0,
    active7Days: 0,
    active30Days: 0,
    totalSessions: 0,
    pushCount: 0,
    pushPercentage: 0,
    platforms: { Android: 0, iOS: 0, Windows: 0, macOS: 0, Otro: 0 },
    recentInstallations: []
  });

  const [chartType, setChartType] = useState<'line' | 'bar' | 'area' | 'pie'>('area');
  const [modalData, setModalData] = useState<{ isOpen: boolean; title: string; items: any[]; key: string }>({
    isOpen: false,
    title: '',
    items: [],
    key: ''
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [catRes, bizRes, accRes, advRes, commRes, analyticsRes, appStatsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/businesses'),
          fetch('/api/accommodations'),
          fetch('/api/adventures'),
          fetch('/api/commerces'),
          fetch('/api/analytics'),
          fetch('/api/app-analytics')
        ]);
        
        if (catRes.ok) {
          const cats = await catRes.json();
          setStats(s => ({ ...s, categories: cats.length }));
        }
        if (bizRes.ok) {
          const bizs = await bizRes.json();
          setStats(s => ({ ...s, businesses: bizs }));
        }
        if (accRes.ok) {
          const accs = await accRes.json();
          setStats(s => ({ ...s, accommodations: accs }));
        }
        if (advRes.ok) {
          const advs = await advRes.json();
          setStats(s => ({ ...s, adventures: advs }));
        }
        if (commRes.ok) {
          const comms = await commRes.json();
          setStats(s => ({ ...s, commerces: comms }));
        }
        if (analyticsRes.ok) {
          const data = await analyticsRes.json();
          setAnalytics(data);
        }
        if (appStatsRes.ok) {
          const appData = await appStatsRes.json();
          setAppStats(appData);
        }
      } catch (e) {
        console.error('Error loading stats');
      }
    };
    
    fetchStats();
  }, []);

  const handleCardClick = (key: string, label: string) => {
    if (key === 'app') {
      const el = document.querySelector('.pwa-analytics-card');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    let list: any[] = [];
    if (key === 'businesses') list = stats.businesses;
    else if (key === 'commerces') list = stats.commerces;
    else if (key === 'accommodations') list = stats.accommodations;
    else if (key === 'adventures') list = stats.adventures;

    // Lógica para saber si la suscripción está activa (due date posterior a hoy - 7 días de gracia)
    const graceDate = new Date();
    graceDate.setDate(graceDate.getDate() - 7);

    const activeList = list.filter((item: any) => {
      if (!item.subscription) return false;
      return new Date(item.subscription.dueDate) >= graceDate;
    });

    setModalData({
      isOpen: true,
      title: `Comercios contratados activos en ${label}`,
      items: activeList,
      key
    });
  };

  const statCards = [
    { label: 'Qué Comer (Comidas)', value: stats.businesses.length, icon: Utensils, color: '#ea580c', key: 'businesses' },
    { label: 'Comercios (Tiendas)', value: stats.commerces.length, icon: Store, color: '#10b981', key: 'commerces' },
    { label: 'Alojamientos', value: stats.accommodations.length, icon: Home, color: '#06b6d4', key: 'accommodations' },
    { label: 'Aventuras', value: stats.adventures.length, icon: Mountain, color: '#f59e0b', key: 'adventures' },
    { label: 'App Instaladas', value: appStats.totalInstalled, icon: Smartphone, color: '#0284c7', key: 'app' },
    { label: 'Visitas Hoy', value: analytics.today, icon: Users, color: '#8b5cf6', key: 'visits' },
  ];

  const COLORS = ['#0d9488', '#ea580c', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981'];

  const renderChart = () => {
    if (analytics.chartData.length === 0) {
      return <div className="no-data">No hay datos de visitas suficientes.</div>;
    }

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(v) => v.split('-').slice(1).join('/')} />
              <YAxis tick={{fontSize: 12, fill: '#64748b'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                labelStyle={{ color: '#64748b', fontWeight: 600, marginBottom: '4px' }}
              />
              <Line type="monotone" dataKey="visits" name="Visitas" stroke="#0d9488" strokeWidth={3} dot={{r: 4, fill: '#0d9488'}} activeDot={{r: 6}} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(v) => v.split('-').slice(1).join('/')} />
              <YAxis tick={{fontSize: 12, fill: '#64748b'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                cursor={{fill: '#f1f5f9'}}
              />
              <Bar dataKey="visits" name="Visitas" fill="#ea580c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(v) => v.split('-').slice(1).join('/')} />
              <YAxis tick={{fontSize: 12, fill: '#64748b'}} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
              <Area type="monotone" dataKey="visits" name="Visitas" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'pie':
        // Agrupar los datos en semanas para que el pie chart tenga sentido (o simplemente usar los totales)
        const pieData = analytics.pageVisits.slice(0, 5).map(pv => ({ name: pv.path, value: pv.count }));
        if(pieData.length === 0) pieData.push({name: 'Sin datos', value: 1});

        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
                label={({name, percent}) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="dashboard-view">
      <div className="view-header">
        <div>
          <h1>Panel de Control</h1>
          <p>Bienvenido al centro de administración de PehueniaGO</p>
        </div>
        <div className="date-badge">
          <Calendar size={16} />
          {new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, i) => {
          const isClickable = stat.key !== 'visits';
          return (
            <div 
              key={i} 
              className={`stat-card ${isClickable ? 'clickable' : ''}`}
              onClick={() => isClickable && handleCardClick(stat.key, stat.label)}
              style={isClickable ? { cursor: 'pointer' } : undefined}
            >
              <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                <stat.icon size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-label">{stat.label}</span>
                <span className="stat-value">{stat.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="analytics-overview">
        <div className="analytics-header">
          <h2>Análisis de Tráfico</h2>
          <div className="chart-controls">
            <button className={`chart-btn ${chartType === 'area' ? 'active' : ''}`} onClick={() => setChartType('area')} title="Gráfico de Área"><Activity size={18} /></button>
            <button className={`chart-btn ${chartType === 'line' ? 'active' : ''}`} onClick={() => setChartType('line')} title="Gráfico de Líneas"><LineChartIcon size={18} /></button>
            <button className={`chart-btn ${chartType === 'bar' ? 'active' : ''}`} onClick={() => setChartType('bar')} title="Gráfico de Barras"><BarChart2 size={18} /></button>
            <button className={`chart-btn ${chartType === 'pie' ? 'active' : ''}`} onClick={() => setChartType('pie')} title="Gráfico Circular (Top Páginas)"><PieChartIcon size={18} /></button>
          </div>
        </div>

        <div className="analytics-body">
          <div className="chart-container">
            {renderChart()}
          </div>
          
          <div className="traffic-summary">
            <div className="summary-item">
              <span className="summary-label">Visitas del Mes</span>
              <span className="summary-value text-teal">{analytics.month}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Visitas Anuales</span>
              <span className="summary-value text-purple">{analytics.year}</span>
            </div>
            
            <div className="page-visits-list">
              <h3>Top Páginas</h3>
              {analytics.pageVisits.slice(0, 5).map((pv, i) => (
                <div key={i} className="page-visit-row">
                  <span className="page-path">{pv.path}</span>
                  <span className="page-count">{pv.count}</span>
                </div>
              ))}
              {analytics.pageVisits.length === 0 && (
                <div className="no-data-small">No hay visitas registradas aún.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE MÉTRICAS DE LA APLICACIÓN PWA */}
      <div className="pwa-analytics-card">
        <div className="pwa-header">
          <div className="pwa-title-wrap">
            <div className="pwa-icon-badge">
              <Smartphone size={22} />
            </div>
            <div>
              <h2>Métricas de la Aplicación (PWA)</h2>
              <p>Seguimiento de descargas en celulares, dispositivos activos y suscripciones push</p>
            </div>
          </div>
          <div className="pwa-header-badges">
            <span className="pwa-badge live">
              <span className="live-dot"></span> En Vivo
            </span>
          </div>
        </div>

        <div className="pwa-metrics-grid">
          <div className="pwa-metric-box">
            <div className="metric-icon-wrap blue">
              <Download size={20} />
            </div>
            <div className="metric-details">
              <span className="metric-num">{appStats.totalInstalled}</span>
              <span className="metric-desc">Apps Instaladas</span>
              <span className="metric-sub">{appStats.activeToday} activas hoy</span>
            </div>
          </div>

          <div className="pwa-metric-box">
            <div className="metric-icon-wrap purple">
              <Smartphone size={20} />
            </div>
            <div className="metric-details">
              <span className="metric-num">{appStats.active30Days}</span>
              <span className="metric-desc">Celulares Activos (30d)</span>
              <span className="metric-sub">{appStats.active7Days} en los últimos 7 días</span>
            </div>
          </div>

          <div className="pwa-metric-box">
            <div className="metric-icon-wrap green">
              <Bell size={20} />
            </div>
            <div className="metric-details">
              <span className="metric-num">{appStats.pushPercentage}%</span>
              <span className="metric-desc">Con Notificaciones Push</span>
              <span className="metric-sub">{appStats.pushCount} de {appStats.totalInstalled || 0} instaladas</span>
            </div>
          </div>

          <div className="pwa-metric-box">
            <div className="metric-icon-wrap amber">
              <Activity size={20} />
            </div>
            <div className="metric-details">
              <span className="metric-num">{appStats.totalSessions}</span>
              <span className="metric-desc">Aperturas de la App</span>
              <span className="metric-sub">Sesiones registradas en standalone</span>
            </div>
          </div>
        </div>

        <div className="pwa-bottom-row">
          {/* Desglose Plataformas */}
          <div className="pwa-platform-card">
            <h3>Distribución por Sistema Operativo</h3>
            <div className="platform-bars">
              <div className="platform-row">
                <div className="plat-info">
                  <span className="plat-icon">🤖</span>
                  <span className="plat-name">Android</span>
                  <span className="plat-count">{appStats.platforms.Android}</span>
                </div>
                <div className="bar-track">
                  <div 
                    className="bar-fill android" 
                    style={{ width: `${appStats.totalInstalled > 0 ? Math.round((appStats.platforms.Android / appStats.totalInstalled) * 100) : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="platform-row">
                <div className="plat-info">
                  <span className="plat-icon">🍏</span>
                  <span className="plat-name">iOS (iPhone / iPad)</span>
                  <span className="plat-count">{appStats.platforms.iOS}</span>
                </div>
                <div className="bar-track">
                  <div 
                    className="bar-fill ios" 
                    style={{ width: `${appStats.totalInstalled > 0 ? Math.round((appStats.platforms.iOS / appStats.totalInstalled) * 100) : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="platform-row">
                <div className="plat-info">
                  <span className="plat-icon">💻</span>
                  <span className="plat-name">Computadoras / Otros</span>
                  <span className="plat-count">{(appStats.platforms.Windows || 0) + (appStats.platforms.macOS || 0) + (appStats.platforms.Otro || 0)}</span>
                </div>
                <div className="bar-track">
                  <div 
                    className="bar-fill other" 
                    style={{ width: `${appStats.totalInstalled > 0 ? Math.round((((appStats.platforms.Windows || 0) + (appStats.platforms.macOS || 0) + (appStats.platforms.Otro || 0)) / appStats.totalInstalled) * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Últimos Dispositivos Registrados */}
          <div className="pwa-recent-card">
            <h3>Últimas Apps Activas / Instaladas</h3>
            {appStats.recentInstallations.length === 0 ? (
              <div className="no-data-small">Esperando las primeras aperturas desde celulares...</div>
            ) : (
              <div className="recent-devices-list">
                {appStats.recentInstallations.slice(0, 5).map((device) => {
                  const isIos = device.platform.toLowerCase().includes('ios');
                  const isAndroid = device.platform.toLowerCase().includes('android');
                  return (
                    <div key={device.id} className="device-item">
                      <div className="device-icon">
                        {isAndroid ? '🤖' : isIos ? '🍏' : '💻'}
                      </div>
                      <div className="device-info">
                        <span className="device-name">{device.platform} {device.browser ? `(${device.browser})` : ''}</span>
                        <span className="device-time">
                          Última vez: {new Date(device.lastActiveAt).toLocaleDateString('es-AR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })} • {device.sessionCount} {device.sessionCount === 1 ? 'sesión' : 'sesiones'}
                        </span>
                      </div>
                      <div className="device-tags">
                        {device.hasPush ? (
                          <span className="tag push-on" title="Notificaciones Push Habilitadas">
                            <Bell size={12} /> Push
                          </span>
                        ) : (
                          <span className="tag push-off" title="Notificaciones Push No Habilitadas">
                            Sin Push
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="grid-main">
          <div className="content-card">
            <div className="card-header">
              <h2>Acciones Rápidas</h2>
            </div>
            <div className="quick-actions">
              <button className="action-btn primary" onClick={() => router.push('/admin/businesses')}>
                <Plus size={20} /> Nuevo Comercio
              </button>
              <button className="action-btn secondary" onClick={() => router.push('/admin/accommodations')}>
                <Plus size={20} /> Nuevo Alojamiento
              </button>
              <button className="action-btn secondary" onClick={() => router.push('/admin/map')}>
                <Map size={20} /> Mapas y Rutas
              </button>
            </div>
          </div>
        </div>

        <div className="grid-sidebar">
          <div className="content-card alert-card">
            <div className="alert-header">
              <AlertCircle size={20} />
              <h3>Recordatorio</h3>
            </div>
            <p>Recuerda que todas las imágenes deben tener una relación de aspecto adecuada para mobile.</p>
          </div>
        </div>
      </div>

      {modalData.isOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{modalData.title}</h3>
              <button className="close-btn" onClick={() => setModalData(prev => ({ ...prev, isOpen: false }))}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {modalData.items.length === 0 ? (
                <p className="no-data-modal">No hay comercios con plan activo contratado en esta sección.</p>
              ) : (
                <div className="contracted-list">
                  {modalData.items.map((item, idx) => {
                    const plan = item.subscription?.planType || 'Básico';
                    const isPremium = plan.toLowerCase().includes('completo') || plan.toLowerCase().includes('premium');
                    return (
                      <div key={item.id || idx} className="contracted-row">
                        <div className="row-info">
                          <span className="entity-name">{item.name}</span>
                          <span className="entity-extra">
                            {item.type || item.category || (modalData.key === 'businesses' ? 'Gastronomía' : '')}
                          </span>
                        </div>
                        <span className={`plan-badge ${isPremium ? 'premium' : 'basic'}`}>
                          {isPremium ? 'Completo' : 'Básico'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        h1 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 4px;
        }

        p {
          color: #64748b;
        }

        .view-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
        }

        .date-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: white;
          padding: 8px 16px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          font-size: 0.85rem;
          color: #64748b;
          font-weight: 500;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          padding: 24px;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #64748b;
          font-weight: 500;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          line-height: 1.2;
        }

        .analytics-overview {
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          padding: 24px;
          margin-bottom: 32px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .analytics-header h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
        }

        .chart-controls {
          display: flex;
          gap: 8px;
          background: #f8fafc;
          padding: 4px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .chart-btn {
          background: transparent;
          border: none;
          padding: 8px;
          border-radius: 8px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chart-btn:hover {
          color: #0f172a;
          background: #f1f5f9;
        }

        .chart-btn.active {
          background: white;
          color: #0d9488;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .analytics-body {
          display: grid;
          grid-template-columns: 3fr 1fr;
          gap: 32px;
        }

        .chart-container {
          min-height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .no-data {
          color: #94a3b8;
          font-size: 0.95rem;
          text-align: center;
          padding: 40px;
        }

        .traffic-summary {
          display: flex;
          flex-direction: column;
          gap: 20px;
          border-left: 1px solid #f1f5f9;
          padding-left: 32px;
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .summary-label {
          font-size: 0.85rem;
          color: #64748b;
          font-weight: 500;
        }

        .summary-value {
          font-size: 1.75rem;
          font-weight: 700;
        }

        .text-teal { color: #0d9488; }
        .text-purple { color: #8b5cf6; }

        .page-visits-list {
          margin-top: auto;
        }

        .page-visits-list h3 {
          font-size: 0.9rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .page-visit-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px dashed #e2e8f0;
          font-size: 0.9rem;
        }

        .page-visit-row:last-child {
          border-bottom: none;
        }

        .page-path {
          color: #475569;
          font-weight: 500;
          max-width: 150px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .page-count {
          color: #0f172a;
          font-weight: 700;
          background: #f1f5f9;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 0.8rem;
        }
          
        .no-data-small {
          font-size: 0.85rem;
          color: #94a3b8;
          padding: 8px 0;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .grid-main {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .content-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        .card-header {
          margin-bottom: 20px;
        }

        .card-header h2 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1e293b;
        }

        .quick-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .action-btn {
          padding: 12px 20px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn.primary {
          background: #0d9488;
          color: white;
          border: none;
        }

        .action-btn.primary:hover {
          background: #0f766e;
        }

        .action-btn.secondary {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        }

        .action-btn.secondary:hover {
          background: #e2e8f0;
        }

        .alert-card {
          background: #fffbeb;
          border-color: #fde68a;
        }

        .alert-header {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #b45309;
          margin-bottom: 12px;
        }

        .alert-header h3 {
          font-size: 1rem;
          font-weight: 700;
        }

        .alert-card p {
          font-size: 0.9rem;
          color: #92400e;
          line-height: 1.5;
        }
          
        @media (max-width: 1024px) {
          .analytics-body {
            grid-template-columns: 1fr;
          }
          .traffic-summary {
            border-left: none;
            padding-left: 0;
            border-top: 1px solid #f1f5f9;
            padding-top: 24px;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: space-between;
          }
          .page-visits-list {
            width: 100%;
            margin-top: 16px;
          }
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
        .stat-card.clickable:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border-color: #cbd5e1;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }

        .modal-card {
          background: white;
          border-radius: 20px;
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: scaleUp 0.2s ease-out;
        }

        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
        }

        .close-btn {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }

        .close-btn:hover {
          background-color: #f1f5f9;
          color: #0f172a;
        }

        .modal-body {
          padding: 24px;
          overflow-y: auto;
          flex-grow: 1;
        }

        .no-data-modal {
          color: #64748b;
          text-align: center;
          padding: 20px 0;
          font-size: 0.95rem;
        }

        .contracted-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .contracted-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #f1f5f9;
        }

        .row-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .entity-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: #0f172a;
        }

        .entity-extra {
          font-size: 0.75rem;
          color: #64748b;
        }

        .plan-badge {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
        }

        .plan-badge.premium {
          background-color: rgba(234, 88, 12, 0.1);
          color: #ea580c;
        }

        .plan-badge.basic {
          background-color: rgba(15, 23, 42, 0.1);
          color: #0f172a;
        }

        /* ESTILOS PWA ANALYTICS */
        .pwa-analytics-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          padding: 24px;
          margin-bottom: 32px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        .pwa-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .pwa-title-wrap {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .pwa-icon-badge {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #eff6ff;
          color: #0284c7;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pwa-title-wrap h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 2px 0;
        }

        .pwa-title-wrap p {
          font-size: 0.85rem;
          color: #64748b;
          margin: 0;
        }

        .pwa-badge.live {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          background: #ecfdf5;
          color: #059669;
          font-size: 0.75rem;
          font-weight: 700;
          border: 1px solid #a7f3d0;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }

        .pwa-metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .pwa-metric-box {
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .metric-icon-wrap {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .metric-icon-wrap.blue { background: #e0f2fe; color: #0284c7; }
        .metric-icon-wrap.purple { background: #f3e8ff; color: #8b5cf6; }
        .metric-icon-wrap.green { background: #dcfce7; color: #16a34a; }
        .metric-icon-wrap.amber { background: #fef3c7; color: #d97706; }

        .metric-details {
          display: flex;
          flex-direction: column;
        }

        .metric-num {
          font-size: 1.35rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.2;
        }

        .metric-desc {
          font-size: 0.8rem;
          font-weight: 600;
          color: #475569;
        }

        .metric-sub {
          font-size: 0.72rem;
          color: #94a3b8;
          margin-top: 2px;
        }

        .pwa-bottom-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 900px) {
          .pwa-bottom-row {
            grid-template-columns: 1fr;
          }
        }

        .pwa-platform-card, .pwa-recent-card {
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 16px;
          padding: 20px;
        }

        .pwa-platform-card h3, .pwa-recent-card h3 {
          margin: 0 0 16px 0;
          font-size: 0.95rem;
          font-weight: 700;
          color: #1e293b;
        }

        .platform-bars {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .platform-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .plat-info {
          display: flex;
          align-items: center;
          font-size: 0.82rem;
          font-weight: 600;
          color: #334155;
        }

        .plat-icon { margin-right: 6px; font-size: 1rem; }
        .plat-name { flex-grow: 1; }
        .plat-count { color: #64748b; font-weight: 700; }

        .bar-track {
          width: 100%;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.4s ease;
        }

        .bar-fill.android { background: #10b981; }
        .bar-fill.ios { background: #3b82f6; }
        .bar-fill.other { background: #94a3b8; }

        .recent-devices-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .device-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .device-icon {
          font-size: 1.25rem;
        }

        .device-info {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .device-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: #1e293b;
        }

        .device-time {
          font-size: 0.72rem;
          color: #64748b;
        }

        .device-tags {
          display: flex;
          align-items: center;
        }

        .tag {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .tag.push-on {
          background: #ecfdf5;
          color: #059669;
          border: 1px solid #a7f3d0;
        }

        .tag.push-off {
          background: #f1f5f9;
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}
