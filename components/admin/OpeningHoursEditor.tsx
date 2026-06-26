'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, Check, X } from 'lucide-react';

interface Period {
  open: string;
  close: string;
}

interface DaySchedule {
  day: number;
  dayName: string;
  closed: boolean;
  periods: Period[];
}

interface OpeningHoursEditorProps {
  value: string; // Serialized JSON string
  onChange: (val: string) => void;
}

const DAYS_OF_WEEK = [
  { day: 1, name: 'Lunes' },
  { day: 2, name: 'Martes' },
  { day: 3, name: 'Miércoles' },
  { day: 4, name: 'Jueves' },
  { day: 5, name: 'Viernes' },
  { day: 6, name: 'Sábado' },
  { day: 0, name: 'Domingo' } // Let's place Sunday at the end for standard Argentine visual flow
];

export const DEFAULT_SCHEDULE: DaySchedule[] = [
  { day: 1, dayName: 'Lunes', closed: false, periods: [{ open: '09:00', close: '13:00' }, { open: '17:00', close: '21:00' }] },
  { day: 2, dayName: 'Martes', closed: false, periods: [{ open: '09:00', close: '13:00' }, { open: '17:00', close: '21:00' }] },
  { day: 3, dayName: 'Miércoles', closed: false, periods: [{ open: '09:00', close: '13:00' }, { open: '17:00', close: '21:00' }] },
  { day: 4, dayName: 'Jueves', closed: false, periods: [{ open: '09:00', close: '13:00' }, { open: '17:00', close: '21:00' }] },
  { day: 5, dayName: 'Viernes', closed: false, periods: [{ open: '09:00', close: '13:00' }, { open: '17:00', close: '21:00' }] },
  { day: 6, dayName: 'Sábado', closed: false, periods: [{ open: '09:00', close: '13:00' }, { open: '17:00', close: '21:00' }] },
  { day: 0, dayName: 'Domingo', closed: true, periods: [] }
];

export const DEFAULT_SCHEDULE_STRING = JSON.stringify(DEFAULT_SCHEDULE);

export default function OpeningHoursEditor({ value, onChange }: OpeningHoursEditorProps) {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);

  // Initialize schedule from value prop
  useEffect(() => {
    try {
      if (value) {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize schedule array to ensure it contains all 7 days in order
          const normalized = [1, 2, 3, 4, 5, 6, 0].map(dayNum => {
            const found = parsed.find((d: any) => d.day === dayNum);
            const dayName = DAYS_OF_WEEK.find(d => d.day === dayNum)?.name || '';
            if (found) {
              return {
                day: dayNum,
                dayName: found.dayName || dayName,
                closed: found.closed ?? false,
                periods: found.periods || []
              };
            }
            return {
              day: dayNum,
              dayName,
              closed: true,
              periods: []
            };
          });
          setSchedule(normalized);
          return;
        }
      }
    } catch (e) {
      console.error('Error parsing openingHours JSON, loading default schedule', e);
    }
    // Load default if empty or error
    setSchedule(JSON.parse(JSON.stringify(DEFAULT_SCHEDULE)));
  }, [value]);

  const updateParent = (newSchedule: DaySchedule[]) => {
    onChange(JSON.stringify(newSchedule));
  };

  const handleToggleClosed = (dayNum: number) => {
    const updated = schedule.map(d => {
      if (d.day === dayNum) {
        const nextClosed = !d.closed;
        return {
          ...d,
          closed: nextClosed,
          periods: nextClosed ? [] : [{ open: '09:00', close: '13:00' }]
        };
      }
      return d;
    });
    setSchedule(updated);
    updateParent(updated);
  };

  const handleAddPeriod = (dayNum: number) => {
    const updated = schedule.map(d => {
      if (d.day === dayNum) {
        // Limit to maximum 3 periods per day for sanity
        if (d.periods.length >= 3) return d;
        const lastPeriod = d.periods[d.periods.length - 1];
        const newOpen = lastPeriod ? lastPeriod.close : '17:00';
        const newClose = lastPeriod ? '22:00' : '21:00';
        return {
          ...d,
          periods: [...d.periods, { open: newOpen, close: newClose }]
        };
      }
      return d;
    });
    setSchedule(updated);
    updateParent(updated);
  };

  const handleRemovePeriod = (dayNum: number, index: number) => {
    const updated = schedule.map(d => {
      if (d.day === dayNum) {
        const nextPeriods = d.periods.filter((_, idx) => idx !== index);
        return {
          ...d,
          closed: nextPeriods.length === 0 ? true : d.closed,
          periods: nextPeriods
        };
      }
      return d;
    });
    setSchedule(updated);
    updateParent(updated);
  };

  const handlePeriodChange = (dayNum: number, index: number, field: 'open' | 'close', val: string) => {
    const updated = schedule.map(d => {
      if (d.day === dayNum) {
        const nextPeriods = d.periods.map((p, idx) => {
          if (idx === index) {
            return { ...p, [field]: val };
          }
          return p;
        });
        return { ...d, periods: nextPeriods };
      }
      return d;
    });
    setSchedule(updated);
    updateParent(updated);
  };

  const handleCopyMondayToWeekdays = () => {
    const monday = schedule.find(d => d.day === 1);
    if (!monday) return;
    const updated = schedule.map(d => {
      // Copy to Lunes, Martes, Miércoles, Jueves, Viernes (days 1, 2, 3, 4, 5)
      if ([2, 3, 4, 5].includes(d.day)) {
        return {
          ...d,
          closed: monday.closed,
          periods: JSON.parse(JSON.stringify(monday.periods))
        };
      }
      return d;
    });
    setSchedule(updated);
    updateParent(updated);
  };

  return (
    <div className="opening-hours-editor" style={{
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: '#f8fafc',
      marginTop: '12px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} color="#0d9488" />
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>
            Horarios de Atención Semanales
          </h4>
        </div>
        <button
          type="button"
          onClick={handleCopyMondayToWeekdays}
          style={{
            fontSize: '0.75rem',
            backgroundColor: '#0d9488',
            color: 'white',
            border: 'none',
            padding: '4px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'background 0.2s'
          }}
          title="Copia la configuración del Lunes de Martes a Viernes"
        >
          Copiar Lunes a Lun-Vie
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {DAYS_OF_WEEK.map(dayInfo => {
          const dayData = schedule.find(d => d.day === dayInfo.day);
          if (!dayData) return null;

          return (
            <div
              key={dayInfo.day}
              style={{
                display: 'grid',
                gridTemplateColumns: '110px 100px 1fr',
                alignItems: 'start',
                padding: '8px 0',
                borderBottom: dayInfo.day === 0 ? 'none' : '1px solid #f1f5f9'
              }}
            >
              {/* Day Name */}
              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#475569', paddingTop: '6px' }}>
                {dayInfo.name}
              </span>

              {/* Closed status toggle */}
              <button
                type="button"
                onClick={() => handleToggleClosed(dayInfo.day)}
                style={{
                  backgroundColor: dayData.closed ? '#fee2e2' : '#d1fae5',
                  color: dayData.closed ? '#991b1b' : '#065f46',
                  border: 'none',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '85px',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  height: '28px',
                  marginTop: '2px'
                }}
              >
                {dayData.closed ? (
                  <>
                    <X size={12} /> Cerrado
                  </>
                ) : (
                  <>
                    <Check size={12} /> Abierto
                  </>
                )}
              </button>

              {/* Shifts list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {!dayData.closed && (
                  <>
                    {dayData.periods.map((p, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="time"
                          value={p.open}
                          onChange={(e) => handlePeriodChange(dayInfo.day, idx, 'open', e.target.value)}
                          required
                          style={{
                            padding: '4px 8px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            color: '#334155',
                            backgroundColor: '#ffffff'
                          }}
                        />
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>a</span>
                        <input
                          type="time"
                          value={p.close}
                          onChange={(e) => handlePeriodChange(dayInfo.day, idx, 'close', e.target.value)}
                          required
                          style={{
                            padding: '4px 8px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            color: '#334155',
                            backgroundColor: '#ffffff'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePeriod(dayInfo.day, idx)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Eliminar este turno"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {dayData.periods.length < 3 && (
                      <button
                        type="button"
                        onClick={() => handleAddPeriod(dayInfo.day)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#0d9488',
                          background: 'none',
                          border: 'none',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: 500,
                          padding: '4px 0',
                          width: 'max-content'
                        }}
                      >
                        <Plus size={12} /> Agregar turno
                      </button>
                    )}
                  </>
                )}
                {dayData.closed && (
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', paddingTop: '6px' }}>
                    No abre este día
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
