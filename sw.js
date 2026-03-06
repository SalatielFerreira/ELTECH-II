const CACHE_NAME = 'eltech-cache-v1';
const urlsToCache = [
  './',
  './pages/login.html',
  './pages/home.html',
  './pages/relatorio.html',
  './pages/rebanho.html',
  './pages/inseminacao.html',
  './pages/vacinacao.html',
  './pages/alimentacao.html',
  './styles/login.css',
  './styles/home.css',
  './styles/relatorio.css',
  './styles/rebanho.css',
  './styles/inseminacao.css',
  './styles/vacinacao.css',
  './styles/alimentacao.css',
  './scripts/login.js',
  './scripts/home.js',
  './scripts/relatorio.js',
  './scripts/rebanho.js',
  './scripts/inseminacao.js',
  './scripts/vacinacao.js',
  './scripts/global.js',
  './assets/images/favicon.png'
];

self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cacheando arquivos essenciais...');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Ativado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse; // offline
        }
        return fetch(event.request).then(networkResponse => {
          // opcional: atualizar cache dinamicamente
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }).catch(() => {
          // fallback offline (pode criar uma página de erro)
          return caches.match('./pages/login.html');
        });
      })
  );
});