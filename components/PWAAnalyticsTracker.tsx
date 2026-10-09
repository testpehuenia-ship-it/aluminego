'use client';

import { useEffect } from 'react';

function getDeviceId(): string {
  const STORAGE_KEY = 'pehueniago_device_id';
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        id = crypto.randomUUID();
      } else {
        id = 'dev_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      }
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch (e) {
    return 'anon_' + Math.random().toString(36).substring(2, 10);
  }
}

function detectPlatform(): { platform: string; browser: string } {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  let platform = 'Otro';
  let browser = 'Desconocido';

  if (/android/i.test(ua)) {
    platform = 'Android';
  } else if (/ipad|iphone|ipod/i.test(ua)) {
    platform = 'iOS';
  } else if (/windows/i.test(ua)) {
    platform = 'Windows';
  } else if (/macintosh|mac os x/i.test(ua)) {
    platform = 'macOS';
  } else if (/linux/i.test(ua)) {
    platform = 'Linux';
  }

  if (/chrome|crios/i.test(ua) && !/edge|edg|opr|opera/i.test(ua)) {
    browser = 'Chrome';
  } else if (/safari/i.test(ua) && !/chrome|crios|android/i.test(ua)) {
    browser = 'Safari';
  } else if (/firefox|fxios/i.test(ua)) {
    browser = 'Firefox';
  } else if (/edg/i.test(ua)) {
    browser = 'Edge';
  } else if (/samsungbrowser/i.test(ua)) {
    browser = 'Samsung Internet';
  }

  return { platform, browser };
}

function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
  const isFullscreenMedia = window.matchMedia('(display-mode: fullscreen)').matches;
  const isMinimalUiMedia = window.matchMedia('(display-mode: minimal-ui)').matches;
  const isNavStandalone = Boolean((window.navigator as any)?.standalone);
  const isAndroidApp = typeof document !== 'undefined' && document.referrer?.startsWith('android-app://');
  return isStandaloneMedia || isFullscreenMedia || isMinimalUiMedia || isNavStandalone || isAndroidApp;
}

export default function PWAAnalyticsTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const trackAppSession = async (forceStandalone = false) => {
      try {
        const isStandalone = forceStandalone || isStandaloneMode();
        
        // Control de frecuencia: enviar 1 vez por sesión de navegación salvo que sea standalone
        const sessionKey = 'pehueniago_tracked_session';
        const alreadyTrackedInSession = sessionStorage.getItem(sessionKey);

        if (alreadyTrackedInSession && !isStandalone) {
          return;
        }

        const deviceId = getDeviceId();
        const { platform, browser } = detectPlatform();
        const hasPush = typeof Notification !== 'undefined' && Notification.permission === 'granted';
        const language = navigator.language || 'es';
        const screenSize = `${window.screen?.width || 0}x${window.screen?.height || 0}`;

        await fetch('/api/app-analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceId,
            platform,
            browser,
            isStandalone,
            hasPush,
            language,
            screenSize,
          }),
        });

        sessionStorage.setItem(sessionKey, '1');
      } catch (e) {
        // Silencioso para no interferir en UX
      }
    };

    // 1. Ejecutar al cargar la página
    trackAppSession();

    // 2. Escuchar evento oficial de instalación de PWA en Chrome / Android
    const handleAppInstalled = () => {
      trackAppSession(true);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return null;
}
