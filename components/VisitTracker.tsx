'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function VisitTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<{ path: string; time: number } | null>(null);

  useEffect(() => {
    const trackVisit = async () => {
      const now = Date.now();
      // Evitar registrar la misma ruta en un lapso menor a 2 segundos (de-duplicación)
      if (lastTracked.current && lastTracked.current.path === pathname && (now - lastTracked.current.time) < 2000) {
        return;
      }
      lastTracked.current = { path: pathname, time: now };

      try {
        await fetch('/api/track-visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ path: pathname }),
        });
      } catch (error) {
        console.error('Failed to track visit:', error);
      }
    };

    if (pathname && !pathname.startsWith('/admin')) {
      trackVisit();
    }
  }, [pathname]);

  return null;
}
