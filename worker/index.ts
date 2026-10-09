/// <reference lib="webworker" />
export {};

const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options: NotificationOptions = {
      body: data.body,
      icon: data.icon || '/icon-192x192.png',
      badge: data.badge || '/icon-192x192.png',
      data: {
        url: data.url || '/'
      }
    };

    event.waitUntil(
      sw.registration.showNotification(data.title, options)
    );
  } catch (err) {
    console.error('Error parseando push data:', err);
    // Fallback si es texto plano
    const text = event.data.text();
    event.waitUntil(
      sw.registration.showNotification('Alerta de PehueniaGO', {
        body: text,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png'
      })
    );
  }
});

sw.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    sw.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients: readonly WindowClient[]) => {
      // Si ya hay una pestaña abierta con esa URL, enfocarla
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no, abrir una nueva ventana
      if (sw.clients.openWindow) {
        return sw.clients.openWindow(urlToOpen);
      }
    })
  );
});
