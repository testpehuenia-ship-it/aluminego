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
  LineChart as LineChartIcon
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

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    categories: 0,
    businesses: 0,
    accommodations: 0,
  });
  
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    today: 0,
    month: 0,
    year: 0,
    pageVisits: [],
    chartData: []
  });

  const [chartType, setChartType] = useState<'line' | 'bar' | 'area' | 'pie'>('area');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [catRes, bizRes, accRes, analyticsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/businesses'),
          fetch('/api/accommodations'),
          fetch('/api/analytics')
        ]);
        
        if (catRes.ok) {
          const cats = await catRes.json();
          setStats(s => ({ ...s, categories: cats.length }));
        }
        if (bizRes.ok) {
          const bizs = await bizRes.json();
          setStats(s => ({ ...s, businesses: bizs.length }));
        }
        if (accRes.ok) {
          const accs = await accRes.json();
          setStats(s => ({ ...s, accommodations: accs.length }));
        }
        if (analyticsRes.ok) {
          const data = await analyticsRes.json();
          setAnalytics(data);
        }
      } catch (e) {
        console.error('Error loading stats');
      }
    };
    
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Categorías', value: stats.categories, icon: TrendingUp, color: '#0d9488' },
    { label: 'Comercios', value: stats.businesses, icon: Store, color: '#ea580c' },
    { label: 'Alojamientos', value: stats.accommodations, icon: Home, color: '#06b6d4' },
    { label: 'Visitas Hoy', value: analytics.today, icon: Users, color: '#8b5cf6' },
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
          <p>Bienvenido al centro de administración de AlumineGo</p>
        </div>
        <div className="date-badge">
          <Calendar size={16} />
          {new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="analytics-overview">
        <div className="analytics-header">
          <h2>Análisis de Tráfico</h2>
          <div className="chart-controls">
            <button className={`chart-btn ${chartType === 'area' ? 'active' : ''}`} onClick={() => setChartType('area')} title="Gráfico de Ãrea"><Activity size={18} /></button>
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
      `}</style>
    </div>
  );
}
