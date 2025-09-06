const CACHE_NAME = 'povesti-creative-v2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Instalarea service worker-ului
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache deschis');
        return cache.addAll(urlsToCache);
      })
  );
});

// Interceptarea cererilor de rețea
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Returnează resursa din cache dacă există
        if (response) {
          return response;
        }
        
        // Altfel, încearcă să obții resursa din rețea
        return fetch(event.request).then(
          response => {
            // Verifică dacă răspunsul este valid
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clonează răspunsul
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
      .catch(() => {
        // Dacă nu există conexiune la internet și resursa nu este în cache
        // returnează o pagină de fallback pentru HTML
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      })
  );
});

// Actualizarea service worker-ului
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Mesaje de la aplicația principală
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Notificări push (opțional pentru viitor)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Ai o nouă aventură de scriere creativă care te așteaptă!',
    icon: './icon-192.png',
    badge: './icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explorează acum',
        icon: './icon-192.png'
      },
      {
        action: 'close',
        title: 'Închide'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Povești Creative', options)
  );
});

// Gestionarea click-urilor pe notificări
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('./')
    );
  }
});

