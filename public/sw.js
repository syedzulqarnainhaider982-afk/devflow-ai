const CACHE_NAME = 'devflow-ai-cache-v1';

// Install event - cache nothing initially to avoid disturbing Next.js caching
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event - clean up old caches if any
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Fetch event - simple pass-through to avoid Next.js conflicts
self.addEventListener('fetch', (event) => {
  // We just pass through all requests. 
  // PWA installability only requires a fetch handler to exist.
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response('Offline content not available.');
    })
  );
});
