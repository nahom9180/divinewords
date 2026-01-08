const CACHE_NAME = 'divine-words-v4'; // Incremented version
const INITIAL_ASSETS = [
  './',
  './index.html',
  './assets/manifest-QkRYPAAr.json',
  './assets/index-DZmkXoMT.jss',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&family=Montserrat:wght@300;400;600&family=Roboto+Slab:wght@400;700&display=swap',
  'https://esm.sh/react@^19.2.3',
  'https://esm.sh/react-dom@^19.2.3',
  'https://esm.sh/react-dom@^19.2.3/client',
  'https://placehold.co/192x192/DC143C/ffffff?text=DW',
  'https://placehold.co/512x512/DC143C/ffffff?text=DW'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // We use a loop to catch specific errors for debugging
      // If one file fails, the whole cache fails.
      for (const url of INITIAL_ASSETS) {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Status: ${response.status}`);
          }
          await cache.put(url, response);
        } catch (error) {
          console.error(`❌ FAILED to cache: ${url}`, error);
          // If you see this error in your console, THAT is why the cache is empty.
        }
      }
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle http/https requests
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (!response || (response.status !== 200 && response.type !== 'opaque')) {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch((error) => {
         // console.error('Fetch failed:', error);
         // You can return a custom offline page here if needed
      });
    })
  );
});