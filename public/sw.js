// Service Worker Básico para PWA
// Requisito técnico obligatorio de Google Chrome para mostrar el cartel de "Instalar"

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Pass-through: No hacemos caché offline complejo para no interferir con la DB
});
