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

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
