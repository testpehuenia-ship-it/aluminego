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

export interface BusinessStatus {
  isOpen: boolean;
  statusText: string;
  colorClass: string; // 'open' | 'closed' | 'warning'
  todayScheduleText: string;
  weeklySchedule: DaySchedule[] | null;
}

// Convert current time to Argentina timezone (Buenos Aires, UTC-3)
export function getArgentinaDate(): Date {
  const now = new Date();
  const tzString = now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' });
  return new Date(tzString);
}

// Convert "HH:MM" to minutes from midnight
export function toMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// Check business status in real-time
export function checkBusinessStatus(openingHoursJson: string | null | undefined): BusinessStatus {
  const defaultStatus: BusinessStatus = {
    isOpen: false,
    statusText: '',
    colorClass: 'closed',
    todayScheduleText: 'Sin horario cargado',
    weeklySchedule: null
  };

  if (!openingHoursJson) return defaultStatus;

  try {
    const weeklySchedule: DaySchedule[] = JSON.parse(openingHoursJson);
    if (!Array.isArray(weeklySchedule) || weeklySchedule.length === 0) {
      return defaultStatus;
    }

    const now = getArgentinaDate();
    const currentDay = now.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const yesterdayDay = (currentDay + 6) % 7;
    const tomorrowDay = (currentDay + 1) % 7;

    const todaySchedule = weeklySchedule.find(d => d.day === currentDay);
    const yesterdaySchedule = weeklySchedule.find(d => d.day === yesterdayDay);
    const tomorrowSchedule = weeklySchedule.find(d => d.day === tomorrowDay);

    // Format today's schedule text for display
    let todayScheduleText = 'Cerrado hoy';
    if (todaySchedule && !todaySchedule.closed && todaySchedule.periods.length > 0) {
      todayScheduleText = todaySchedule.periods
        .map(p => `${p.open} a ${p.close}`)
        .join(' y ');
    }

    let isOpen = false;
    let minutesToClose = Infinity;
    let minutesToOpen = Infinity;

    // 1. Check if open due to TODAY's periods
    if (todaySchedule && !todaySchedule.closed) {
      for (const p of todaySchedule.periods) {
        const openMin = toMinutes(p.open);
        const closeMin = toMinutes(p.close);

        if (closeMin > openMin) {
          // Standard period (e.g. 09:00 - 13:00)
          if (currentMinutes >= openMin && currentMinutes < closeMin) {
            isOpen = true;
            minutesToClose = Math.min(minutesToClose, closeMin - currentMinutes);
          } else if (currentMinutes < openMin) {
            minutesToOpen = Math.min(minutesToOpen, openMin - currentMinutes);
          }
        } else {
          // Period crossing midnight (e.g. 20:00 - 02:00)
          if (currentMinutes >= openMin || currentMinutes < closeMin) {
            isOpen = true;
            if (currentMinutes >= openMin) {
              // Before midnight: time until midnight + time after midnight
              minutesToClose = Math.min(minutesToClose, (1440 - currentMinutes) + closeMin);
            } else {
              // After midnight: time until close today
              minutesToClose = Math.min(minutesToClose, closeMin - currentMinutes);
            }
          } else {
            // Closed: between closeMin (e.g. 02:00) and openMin (e.g. 20:00)
            minutesToOpen = Math.min(minutesToOpen, openMin - currentMinutes);
          }
        }
      }
    }

    // 2. Check if open due to YESTERDAY's period crossing midnight
    if (!isOpen && yesterdaySchedule && !yesterdaySchedule.closed) {
      for (const p of yesterdaySchedule.periods) {
        const openMin = toMinutes(p.open);
        const closeMin = toMinutes(p.close);

        if (closeMin < openMin) {
          // Crossed midnight yesterday, so it ends at closeMin today
          if (currentMinutes < closeMin) {
            isOpen = true;
            minutesToClose = Math.min(minutesToClose, closeMin - currentMinutes);
          }
        }
      }
    }

    // 3. Check if we open TOMORROW within 30 minutes
    if (!isOpen && tomorrowSchedule && !tomorrowSchedule.closed && tomorrowSchedule.periods.length > 0) {
      const firstPeriodTomorrow = tomorrowSchedule.periods[0];
      const openMinTomorrow = toMinutes(firstPeriodTomorrow.open);
      const timeToTomorrowOpen = (1440 - currentMinutes) + openMinTomorrow;
      minutesToOpen = Math.min(minutesToOpen, timeToTomorrowOpen);
    }

    // Determine status text and colors
    let statusText = isOpen ? 'Abierto' : 'Cerrado';
    let colorClass: 'open' | 'closed' | 'warning' = isOpen ? 'open' : 'closed';

    if (isOpen && minutesToClose <= 30) {
      statusText = `Cierra en ${minutesToClose} min`;
      colorClass = 'warning';
    } else if (!isOpen && minutesToOpen <= 30) {
      statusText = `Abre en ${minutesToOpen} min`;
      colorClass = 'warning';
    }

    return {
      isOpen,
      statusText,
      colorClass,
      todayScheduleText,
      weeklySchedule
    };

  } catch (e) {
    console.error('Error calculating business schedule status:', e);
    return defaultStatus;
  }
}
