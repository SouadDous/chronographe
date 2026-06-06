/* Le Chronographe LÀ — © 2026 Souad Dous / Éditions LÀ
   Service worker : permet de garder l'objet hors connexion. */
const CACHE = 'chronographe-la-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-512.png', './icon-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        const url = new URL(req.url);
        // Met en cache l'objet lui-même et la police (pour le hors-connexion)
        if (url.origin === location.origin ||
            url.host.includes('fonts.googleapis.com') ||
            url.host.includes('fonts.gstatic.com')) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
