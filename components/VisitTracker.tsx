'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const trackVisit = async () => {
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
