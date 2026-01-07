const CACHE_NAME = 'divine-words-v3';
const BASE_URL = "https://nahom9180.github.io/divinewords"
const INITIAL_ASSETS = [
  BASE_URL,
  `${BASE_URL}/index.html`,
  `${BASE_URL}/assets/manifest-QkRYPAAr.json`,
  `${BASE_URL}/assets/index-CqOucdIa.js`,
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&family=Montserrat:wght@300;400;600&family=Roboto+Slab:wght@400;700&display=swap',
  'https://esm.sh/react@^19.2.3',
  'https://esm.sh/react-dom@^19.2.3',
  'https://esm.sh/react-dom@^19.2.3/client',
  'https://placehold.co/192x192/DC143C/ffffff?text=DW',
  'https://placehold.co/512x512/DC143C/ffffff?text=DW'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use addAll for atomic all-or-nothing caching
      return cache.addAll(INITIAL_ASSETS);
    })
  );
  self.skipWaiting();
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
      // Return cached response if available
      if (cachedResponse) {
        return cachedResponse;
      }

      // Clone the request for the fetch
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest).then((response) => {
        // Check if we received a valid response.
        // We permit opaque responses (status 0) which happen with no-cors requests to CDNs.
        if (!response || (response.status !== 200 && response.type !== 'opaque')) {
          return response;
        }

        // Clone the response because it's a stream and can only be consumed once
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          try {
             cache.put(event.request, responseToCache);
          } catch (err) {
             console.warn('Failed to cache response', err);
          }
        });

        return response;
      }).catch((error) => {
          console.error('Fetch failed:', error);
          // Optional: Return a custom offline page or placeholder here
          // For now, we rely on the cache or fail if totally offline and uncached
          throw error;
      });
    })
  );
});