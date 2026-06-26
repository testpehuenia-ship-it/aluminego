'use client';

import React, { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';

// Utilidad para convertir la VAPID public key de base64 a Uint8Array
const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export default function PushPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isReminder, setIsReminder] = useState(false);

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      return; // No soportado
    }

    if (Notification.permission === 'granted' || Notification.permission === 'denied') {
      return; // Ya se decidió
    }

    const lastInteractionStr = localStorage.getItem('push_prompt_last_interaction');
    
    if (lastInteractionStr) {
      const lastInteraction = parseInt(lastInteractionStr, 10);
      const daysSince = (Date.now() - lastInteraction) / (1000 * 60 * 60 * 24);
      
      if (daysSince < 1) {
        // Menos de 1 día desde la Áºltima vez que dijo "Ahora no"
        return;
      } else {
        // Pasaron más de 2 días, mostramos en modo recordatorio
        setIsReminder(true);
      }
    }

    // Mostramos el prompt personalizado después de 3 segundos
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('push_prompt_last_interaction', Date.now().toString());
  };

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      // 1. Solicitar permiso nativo
      const permission = await Notification.requestPermission();
      
      localStorage.setItem('push_prompt_last_interaction', Date.now().toString());
      setShowPrompt(false);

      if (permission !== 'granted') {
        console.log('Permiso de notificaciones denegado');
        return;
      }
      


      // 2. Obtener registro del service worker
      const registration = await navigator.serviceWorker.ready;

      // 3. Suscribirse al Push Service del navegador
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicVapidKey) {
        console.error('No se encontró NEXT_PUBLIC_VAPID_PUBLIC_KEY');
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });

      // 4. Enviar suscripción a nuestro backend
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      console.log('Suscripción exitosa');

    } catch (error) {
      console.error('Error al suscribirse a push:', error);
      setShowPrompt(false);
    } finally {
      setIsSubscribing(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="push-prompt-overlay">
      <div className="push-prompt-card">
        <button className="close-btn" onClick={handleDismiss}>
          <X size={20} />
        </button>
        
        <div className="icon-container">
          <Bell size={32} className="bell-icon" />
        </div>
        
        <h3>{isReminder ? '¡Vas a perderte los descuentos!' : '¡No te pierdas de nada!'}</h3>
        <p>
          {isReminder 
            ? 'Aprovechalos activando las alertas. AluminéGO quiere enviarte notificaciones para promociones exclusivas en Aluminé.'
            : 'AluminéGO quiere enviarte notificaciones para descuentos, promociones y alertas del clima en Aluminé.'}
        </p>
        
        <div className="prompt-actions">
          <button 
            className="btn-cancel" 
            onClick={handleDismiss}
            disabled={isSubscribing}
          >
            Ahora no
          </button>
          <button 
            className="btn-accept" 
            onClick={handleSubscribe}
            disabled={isSubscribing}
          >
            {isSubscribing ? 'Activando...' : 'Permitir'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .push-prompt-overlay {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          width: 90%;
          max-width: 400px;
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from {
            transform: translate(-50%, 150%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }

        .push-prompt-card {
          background: white;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.3);
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .close-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }

        .close-btn:hover {
          background-color: #f1f5f9;
          color: #475569;
        }

        .icon-container {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          box-shadow: 0 8px 16px rgba(13, 148, 136, 0.3);
        }

        .bell-icon {
          color: white;
        }

        h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
        }

        p {
          font-size: 0.95rem;
          color: #64748b;
          margin-bottom: 24px;
          line-height: 1.5;
        }

        .prompt-actions {
          display: flex;
          gap: 12px;
          width: 100%;
        }

        button {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-cancel {
          background-color: #f1f5f9;
          color: #64748b;
          border: none;
        }

        .btn-cancel:hover {
          background-color: #e2e8f0;
          color: #475569;
        }

        .btn-accept {
          background-color: #0d9488;
          color: white;
          border: none;
          box-shadow: 0 4px 6px rgba(13, 148, 136, 0.2);
        }

        .btn-accept:hover {
          background-color: #0f766e;
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(13, 148, 136, 0.3);
        }

        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>
    </div>
  );
}


