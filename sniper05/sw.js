// Sniper 0,5: serve solo a rendere la pagina un'app installabile. Prende sempre i file nuovi dalla rete; senza rete usa
// l'ultima copia. Non tocca la pagina del foglio (script.google.com), che passa sempre dalla rete.
const CASSA = 'sniper05-v1';
const FILE = ['./', 'index.html', 'manifest.webmanifest', 'icona-192.png', 'icona-512.png', 'icona-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CASSA).then(c => c.addAll(FILE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(k => Promise.all(k.filter(n => n !== CASSA).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(fetch(r).then(risp => {
    if (risp.ok) { const copia = risp.clone(); caches.open(CASSA).then(c => c.put(r, copia)); }
    return risp;
  }).catch(() => caches.match(r, { ignoreSearch: true }).then(c => c || caches.match('./'))));
});
