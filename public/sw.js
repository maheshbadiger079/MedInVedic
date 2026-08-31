const CACHE_NAME = 'medinvedic-v19';
const ASSETS = [
  '/',
  '/index.html',
  '/pages/categories.html',
  '/pages/consult.html',
  '/pages/healing-hub.html',
  '/css/style.css',
  '/js/app.js',
  '/js/api.js',
  '/js/i18n.js',
  '/pages/login.html',
  '/pages/register.html'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
