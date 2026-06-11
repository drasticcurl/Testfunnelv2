/// Service Worker for Protocolo Anti-Hinchazón PWA
/// Scope: /pwa/
/// Strategy: cache-first for static assets, network-first for API calls

const CACHE_NAME = 'pwa-cache-v1';
const STATIC_CACHE = 'pwa-static-v1';
const DYNAMIC_CACHE = 'pwa-dynamic-v1';

// Static assets to precache on install
const PRECACHE_URLS = [
  '/pwa/dashboard',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Patterns to NEVER cache (auth, webhooks)
const NO_CACHE_PATTERNS = [
  /\/api\/pwa\/auth\//,
  /\/api\/pwa\/webhook\//,
  /\/api\/auth\//,
  /supabase\.co/,
  /_next\/webpack-hmr/,
];

// Static asset patterns (cache-first)
const STATIC_PATTERNS = [
  /\/_next\/static\//,
  /\/icons\//,
  /\/recetas\//,
  /\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|eot)$/,
];

// Install: precache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[SW] Precache partial failure:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: route requests by strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle requests within /pwa/ scope or static assets
  const isInScope =
    url.pathname.startsWith('/pwa') ||
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/icons') ||
    STATIC_PATTERNS.some((p) => p.test(url.pathname));

  if (!isInScope) return;

  // Never cache auth or webhook requests
  if (NO_CACHE_PATTERNS.some((p) => p.test(url.href))) return;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Static assets: cache-first
  if (STATIC_PATTERNS.some((p) => p.test(url.pathname))) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // API requests within /pwa/: network-first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    return;
  }

  // Pages within /pwa/: network-first with cache fallback
  if (url.pathname.startsWith('/pwa')) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    return;
  }
});

// Cache-first strategy
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    // Return offline fallback if available
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Network-first strategy
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}
