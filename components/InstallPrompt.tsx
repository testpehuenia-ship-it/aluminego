'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    // 1. Verificar si ya está instalada
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    const hasInstalled = localStorage.getItem('installPromptAccepted') === 'true';

    if (isStandalone || hasInstalled) {
      return; // Ya está instalada, no hacer nada nunca.
    }

    // 2. Detectar si es iOS (iPhone/iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 3. Capturar el evento nativo de instalación (Android/Chrome) y guardarlo
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // Evita que Chrome muestre su mini-cartel nativo automático
      (window as any).deferredPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('deferredPromptReady' as any, handleBeforeInstallPrompt);

    // 4. Temporizador de 2 minutos (120,000 ms)
    let timer: NodeJS.Timeout;
    if (!hasDismissed) {
      timer = setTimeout(() => {
        setShowPrompt(true);
      }, 120000); // 2 minutos exactos
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('deferredPromptReady' as any, handleBeforeInstallPrompt);
      if (timer) clearTimeout(timer);
    };
  }, [hasDismissed]);

  const handleAccept = async () => {
    if (isIOS) {
      // Mostrar instrucciones visuales para iOS
      setShowIOSInstructions(true);
      return;
    }

    const deferredPrompt = (window as any).deferredPrompt;

    if (!deferredPrompt) {
      // Fallback
      alert('Para instalar la app, toca el botón de Opciones/Compartir en tu navegador y selecciona "Agregar a la pantalla principal".');
      return;
    }

    // Mostrar el cartel nativo de instalación
    setIsInstalling(true);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      localStorage.setItem('installPromptAccepted', 'true');
      setShowPrompt(false);
    } else {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    // Guardar en el estado del componente para que no moleste en esta navegación, 
    // pero si vuelve a ingresar (se recarga o abre una nueva pestaña) aparecerá nuevamente tras 2 minutos.
    setHasDismissed(true);
    setShowPrompt(false);
  };

  // Exponer una función global para el botón del Footer
  useEffect(() => {
    (window as any).triggerInstallPrompt = () => {
      setShowPrompt(true);
    };
  }, []);

  if (!showPrompt) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '0',
      left: '0',
      width: '100%',
      backgroundColor: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 99999,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      height: '100vh',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        backgroundColor: 'white',
        width: '100%',
        maxWidth: '500px',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        padding: '24px',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
        position: 'relative',
        animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Botón Cerrar X */}
        <button 
          onClick={handleDismiss}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#666' }}
        >
          <X size={24} />
        </button>

        {!showIOSInstructions ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '70px', height: '70px', marginBottom: '16px' }}>
              {/* Imagen base en blanco y negro o tenue (usamos el ícono subido con la araucaria) */}
              <img src="/icon-192x192.png" alt="AlumineGo Icon" width="70" height="70" style={{ borderRadius: '16px', filter: isInstalling ? 'grayscale(100%) opacity(0.3)' : 'none', transition: 'filter 0.3s', objectFit: 'contain' }} />
              
              {/* Imagen a color que se "llena" de abajo hacia arriba */}
              {isInstalling && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                  animation: 'fillUp 3s ease-in-out forwards',
                  borderRadius: '16px',
                }}>
                  <img src="/icon-192x192.png" alt="AlumineGo Icon" width="70" height="70" style={{ position: 'absolute', bottom: 0, left: 0, objectFit: 'contain' }} />
                </div>
              )}
            </div>
            
            {/* Corregido a Aluminé (solo P mayúscula) */}
            <h2 style={{ fontFamily: 'var(--font-oswald), sans-serif', fontSize: '1.8rem', margin: '0 0 8px 0' }}>
              <span style={{ color: 'var(--color-green)', fontWeight: 700 }}>Aluminé</span>
              <span style={{ color: 'var(--color-orange)', fontWeight: 700 }}>GO</span>
            </h2>
            
            <p style={{ color: '#444', fontSize: '1.1rem', margin: '0 0 24px 0', lineHeight: 1.4 }}>
              {isInstalling 
                ? 'Preparando tu app... ¡Ya casi listo!' 
                : <>¡Lleva AlumineGo siempre contigo!<br/>Instala la aplicación para disfrutar de Aluminé estés donde estés.</>}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              <button 
                onClick={handleAccept}
                disabled={isInstalling}
                style={{
                  backgroundColor: isInstalling ? '#ccc' : 'var(--color-green)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: isInstalling ? 'wait' : 'pointer',
                  width: '100%',
                  boxShadow: isInstalling ? 'none' : '0 4px 10px rgba(39, 174, 96, 0.3)',
                  transition: 'background-color 0.3s'
                }}
              >
                {isInstalling ? 'Instalando...' : 'Instalar Aplicación'}
              </button>
              <button 
                onClick={handleDismiss}
                style={{
                  backgroundColor: 'transparent',
                  color: '#666',
                  border: '1px solid #ccc',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                En otro momento
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ background: '#f8f9fa', borderRadius: '16px', padding: '20px', marginBottom: '20px', width: '100%' }}>
              <h3 style={{ margin: '0 0 12px 0', color: 'var(--color-green)' }}>Para instalar en iPhone:</h3>
              <ol style={{ textAlign: 'left', margin: 0, paddingLeft: '20px', color: '#444', lineHeight: 1.6 }}>
                <li>Toca el botón <b>Compartir</b> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign: 'text-bottom'}}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg> en la barra inferior.</li>
                <li>Desliza hacia abajo y selecciona <b>"Agregar a Inicio"</b>.</li>
                <li>Toca <b>"Agregar"</b> en la esquina superior derecha.</li>
              </ol>
            </div>
            <button 
              onClick={handleDismiss}
              style={{
                backgroundColor: 'var(--color-orange)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              ¡Entendido!
            </button>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fillUp { 0% { height: 0%; } 100% { height: 100%; } }
      `}} />
    </div>
  );
}
