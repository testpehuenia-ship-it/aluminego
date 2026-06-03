'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, AlertCircle, TrendingUp, CheckCircle, Clock, Loader2, DollarSign } from 'lucide-react';
import { getSubscriptions, getBillingStats, registerPayment } from './actions';

export default function BillingPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [subsData, statsData] = await Promise.all([
      getSubscriptions(),
      getBillingStats()
    ]);
    setSubscriptions(subsData);
    setStats(statsData);
    setLoading(false);
  };

  const handlePayment = async (id: string) => {
    if (!confirm('¿Confirmar que el cliente abonó el mes? Esto adelantará su vencimiento 30 días.')) return;
    
    setProcessingId(id);
    const res = await registerPayment(id);
    if (res.success) {
      await loadData();
    } else {
      alert(res.error || 'Ocurrió un error');
    }
    setProcessingId(null);
  };

  const getStatus = (dueDateStr: string) => {
    const due = new Date(dueDateStr);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 0) {
      return { label: 'Al día', type: 'success', icon: CheckCircle };
    } else if (diffDays >= -7) {
      return { label: `En gracia (${Math.abs(diffDays)}d)`, type: 'warning', icon: Clock };
    } else {
      return { label: 'Vencido/Oculto', type: 'error', icon: AlertCircle };
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-teal-600" size={32} />
      </div>
    );
  }

  return (
    <div className="billing-view">
      <div className="view-header">
        <div>
          <h1>Control de Pagos de Publicidad</h1>
          <p>Gestiona las suscripciones, registra los abonos y revisa el estado de cuenta de los clientes.</p>
        </div>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon bg-teal-50 text-teal-600">
              <TrendingUp size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Anuncios</span>
              <span className="stat-value">{stats.totalAds}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-blue-50 text-blue-600">
              <DollarSign size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Ingreso Mensual Est.</span>
              <span className="stat-value">${stats.estimatedMonthlyIncome.toLocaleString('es-AR')}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-red-50 text-red-600">
              <AlertCircle size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Cuentas Atrasadas</span>
              <span className="stat-value text-red-600">{stats.overdueCount}</span>
            </div>
          </div>
        </div>
      )}

      {stats && stats.categoryStats && stats.categoryStats.length > 0 && (
         <div className="content-card mb-8">
           <h2 className="text-lg font-bold text-slate-800 mb-4">Desglose por Categoría</h2>
           <div className="category-breakdown">
             {stats.categoryStats.map((c: any) => (
               <div key={c.name} className="cat-item">
                 <span className="cat-name">{c.name}</span>
                 <span className="cat-count">{c.count} anuncios</span>
                 <span className="cat-income">${c.income.toLocaleString('es-AR')} / mes</span>
               </div>
             ))}
           </div>
         </div>
      )}

      <div className="content-card">
        <div className="card-header">
          <h2>Listado de Suscripciones</h2>
        </div>
        
        <div className="table-responsive">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Plan</th>
                <th>Valor Mensual</th>
                <th>Vencimiento</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">No hay suscripciones registradas aún.</td>
                </tr>
              ) : subscriptions.map(sub => {
                const status = getStatus(sub.dueDate);
                const StatusIcon = status.icon;
                
                return (
                  <tr key={sub.id}>
                    <td className="font-medium text-slate-800">{sub.clientName}</td>
                    <td>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{sub.planType}</span>
                        {(sub.hasBannerTop || sub.hasBannerMiddle || sub.hasBannerBottom || sub.hasBannerPortada) && (
                          <span className="text-xs text-slate-500 mt-1">Con banners adicionales</span>
                        )}
                      </div>
                    </td>
                    <td className="font-semibold text-slate-700">${sub.price.toLocaleString('es-AR')}</td>
                    <td>
                      <span className="text-sm">{new Date(sub.dueDate).toLocaleDateString('es-AR')}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${status.type}`}>
                        <StatusIcon size={14} />
                        {status.label}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-pay" 
                        onClick={() => handlePayment(sub.id)}
                        disabled={processingId === sub.id}
                      >
                        {processingId === sub.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <><CreditCard size={16} /> Tildar Pago</>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .billing-view {
          padding-bottom: 40px;
        }

        .view-header {
          margin-bottom: 32px;
        }

        h1 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 4px;
        }

        p {
          color: #64748b;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
        
        .bg-teal-50 { background-color: #f0fdfa; }
        .text-teal-600 { color: #0d9488; }
        .bg-blue-50 { background-color: #eff6ff; }
        .text-blue-600 { color: #2563eb; }
        .bg-red-50 { background-color: #fef2f2; }
        .text-red-600 { color: #dc2626; }

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
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
        }

        .category-breakdown {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .cat-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 12px 16px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 180px;
        }

        .cat-name {
          font-weight: 600;
          color: #334155;
          font-size: 0.9rem;
        }

        .cat-count {
          color: #64748b;
          font-size: 0.85rem;
        }

        .cat-income {
          color: #0d9488;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .table-responsive {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          padding: 12px 16px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #e2e8f0;
        }

        td {
          padding: 16px;
          border-bottom: 1px dashed #e2e8f0;
          vertical-align: middle;
        }

        tr:last-child td {
          border-bottom: none;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status-badge.success {
          background: #dcfce7;
          color: #166534;
        }

        .status-badge.warning {
          background: #fef9c3;
          color: #854d0e;
        }

        .status-badge.error {
          background: #fee2e2;
          color: #991b1b;
        }

        .btn-pay {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          color: #334155;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-pay:hover:not(:disabled) {
          background: #0d9488;
          color: white;
          border-color: #0d9488;
        }

        .btn-pay:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
