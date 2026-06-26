'use client';

import React, { useState, useEffect } from 'react';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { checkBusinessStatus, type BusinessStatus } from '@/lib/schedule';

interface OpeningStatusBadgeProps {
  openingHours: string | null | undefined;
  showWeeklySchedule?: boolean;
}

const DAYS_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function OpeningStatusBadge({ openingHours, showWeeklySchedule = false }: OpeningStatusBadgeProps) {
  const [status, setStatus] = useState<BusinessStatus | null>(null);
  const [isOpenAccordion, setIsOpenAccordion] = useState(false);

  useEffect(() => {
    if (!openingHours) return;

    const updateStatus = () => {
      setStatus(checkBusinessStatus(openingHours));
    };

    updateStatus();
    // Update every 30 seconds
    const interval = setInterval(updateStatus, 30000);
    return () => clearInterval(interval);
  }, [openingHours]);

  if (!status || !status.weeklySchedule) {
    return null;
  }

  const { isOpen, statusText, colorClass, todayScheduleText, weeklySchedule } = status;

  // Style definitions based on status
  const badgeStyles = {
    open: {
      backgroundColor: '#ecfdf5',
      color: '#047857',
      border: '1px solid #10b981'
    },
    closed: {
      backgroundColor: '#fef2f2',
      color: '#b91c1c',
      border: '1px solid #f87171'
    },
    warning: {
      backgroundColor: '#fffbeb',
      color: '#b45309',
      border: '1px solid #f59e0b'
    }
  };

  const activeStyle = badgeStyles[colorClass] || badgeStyles.closed;
  const currentDayOfWeek = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' })).getDay();

  return (
    <div className="opening-status-container" style={{ margin: '8px 0' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {/* Status Pill Badge */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            ...activeStyle
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: colorClass === 'open' ? '#10b981' : colorClass === 'warning' ? '#f59e0b' : '#ef4444'
            }}
          />
          {statusText}
        </span>

        {/* Today's Schedule Text for quick read */}
        {!showWeeklySchedule && (
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} />
            {isOpen ? `Cierra hoy: ${todayScheduleText}` : `Hoy: ${todayScheduleText}`}
          </span>
        )}
      </div>

      {/* Accordion view for details page */}
      {showWeeklySchedule && (
        <div style={{ marginTop: '12px' }}>
          <button
            type="button"
            onClick={() => setIsOpenAccordion(!isOpenAccordion)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '6px 0',
              outline: 'none'
            }}
          >
            <Clock size={14} color="var(--color-orange)" />
            <span>Ver horarios semanales</span>
            {isOpenAccordion ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {isOpenAccordion && (
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px',
                marginTop: '6px',
                maxWidth: '300px',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
                animation: 'fadeIn 0.2s ease-out'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {/* Re-order weeklySchedule to show standard Argentine flow (Lunes first) */}
                {[1, 2, 3, 4, 5, 6, 0].map(dayNum => {
                  const dayData = weeklySchedule.find(d => d.day === dayNum);
                  if (!dayData) return null;

                  const isToday = dayNum === currentDayOfWeek;
                  const dayName = DAYS_NAMES[dayNum];

                  return (
                    <div
                      key={dayNum}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.8rem',
                        padding: '3px 6px',
                        borderRadius: '4px',
                        backgroundColor: isToday ? '#f0fdf4' : 'transparent',
                        fontWeight: isToday ? 700 : 400,
                        color: isToday ? '#15803d' : '#475569'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isToday && <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#16a34a' }} />}
                        {dayName}
                      </span>
                      <span>
                        {dayData.closed || dayData.periods.length === 0
                          ? 'Cerrado'
                          : dayData.periods.map(p => `${p.open} - ${p.close}`).join(', ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
