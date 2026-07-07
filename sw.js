// Service Worker - V-Shape Treinos PWA
// Estrategia: cache-first pros assets locais, network-first pro resto

const CACHE_NAME = 'vshape-v5';
const CORE_ASSETS = [
  './',
  './index.html',
  './fase2.html',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

// Instala: pre-cache dos assets principais
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Ativa: limpa caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: cache-first pro mesmo origin, network c/ fallback pra YouTube
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Mesmo origin (HTML, manifest, icones): cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(req, clone));
          }
          return res;
        }).catch(() => caches.match('./index.html'));
      })
    );
    return;
  }

  // YouTube (embed + thumbs): network-first, fallback pro cache do browser
  if (url.hostname.includes('youtube.com') || url.hostname.includes('ytimg.com') || url.hostname.includes('youtu.be')) {
    event.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
    return;
  }

  // Outros (default): network com fallback pro cache
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});
