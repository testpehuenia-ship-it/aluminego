'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, Save, Loader2, Info } from 'lucide-react';
import { getPricingConfigs, updatePricingConfig } from './actions';

export default function PricingPage() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, number>>({});

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    const data = await getPricingConfigs();
    setConfigs(data);
    
    // Initialize edit state
    const initialValues: Record<string, number> = {};
    data.forEach((c: any) => {
      initialValues[c.key] = c.price;
    });
    setEditValues(initialValues);
    setLoading(false);
  };

  const handlePriceChange = (key: string, val: string) => {
    const num = parseInt(val.replace(/\D/g, ''), 10);
    setEditValues(prev => ({
      ...prev,
      [key]: isNaN(num) ? 0 : num
    }));
  };

  const handleUpdate = async (key: string) => {
    setSaving(key);
    await updatePricingConfig(key, editValues[key]);
    
    // Update local state config
    setConfigs(prev => prev.map(c => 
      c.key === key ? { ...c, price: editValues[key] } : c
    ));
    
    setSaving(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-teal-600" size={32} />
      </div>
    );
  }

  return (
    <div className="pricing-view">
      <div className="view-header">
        <div>
          <h1>Configuración de Precios</h1>
          <p>Administra los valores mensuales de cada plan y banner publicitario.</p>
        </div>
      </div>

      <div className="content-card info-card">
        <Info size={20} />
        <div>
          <h3>Acerca del tarifario</h3>
          <p>Los precios modificados aquí aplicarán para las nuevas suscripciones o al momento de registrar un nuevo mes. No afectarán a los pagos ya registrados históricamente.</p>
        </div>
      </div>

      <div className="pricing-grid">
        {configs.map(config => (
          <div key={config.key} className="price-card">
            <div className="price-header">
              <div className="price-icon">
                <DollarSign size={20} />
              </div>
              <h3 className="price-name">{config.name}</h3>
            </div>
            
            <div className="price-input-group">
              <label>Valor Mensual (ARS)</label>
              <div className="input-wrapper">
                <span className="currency-symbol">$</span>
                <input 
                  type="text" 
                  value={editValues[config.key]?.toLocaleString('es-AR') || '0'}
                  onChange={(e) => handlePriceChange(config.key, e.target.value)}
                />
              </div>
            </div>

            <button 
              className="save-btn" 
              onClick={() => handleUpdate(config.key)}
              disabled={saving === config.key || editValues[config.key] === config.price}
            >
              {saving === config.key ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <><Save size={18} /> Guardar</>
              )}
            </button>
          </div>
        ))}
      </div>

      <style jsx>{`
        .pricing-view {
          padding-bottom: 40px;
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

        .view-header {
          margin-bottom: 24px;
        }

        .info-card {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          background: #f0fdfa;
          border-color: #ccfbf1;
          margin-bottom: 32px;
          padding: 16px 20px;
        }

        .info-card svg {
          color: #0d9488;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .info-card h3 {
          color: #115e59;
          font-size: 0.95rem;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .info-card p {
          color: #0f766e;
          font-size: 0.85rem;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .price-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .price-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .price-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #f1f5f9;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .price-name {
          font-size: 1.05rem;
          font-weight: 600;
          color: #1e293b;
          line-height: 1.3;
        }

        .price-input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .price-input-group label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .currency-symbol {
          position: absolute;
          left: 14px;
          color: #94a3b8;
          font-weight: 500;
        }

        input {
          width: 100%;
          padding: 12px 12px 12px 32px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 1.1rem;
          font-weight: 600;
          color: #0f172a;
          transition: all 0.2s;
          outline: none;
        }

        input:focus {
          border-color: #0d9488;
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
        }

        .save-btn {
          margin-top: auto;
          background: #0d9488;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .save-btn:hover:not(:disabled) {
          background: #0f766e;
        }

        .save-btn:disabled {
          background: #e2e8f0;
          color: #94a3b8;
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
