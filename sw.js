/* Service worker — offline access + installable PWA.
   Deliberately conservative: HTML/JS are NETWORK-FIRST so content is never stale
   (a stale cache is worse than no cache), falling back to cache only when offline.
   Big downloads (pdf/zip/stl/3mf/media) are never cached — they'd blow the quota. */
const VERSION = 'isaac-v1';
const SHELL = ['/', '/portfolio/', '/manifest.json'];

const CACHEABLE = /\.(html|css|js|json|png|jpg|jpeg|gif|svg|webp|ico|woff2?)$/i;
const NEVER = /\.(pdf|zip|stl|3mf|step|stp|obj|dxf|mp4|mov|webm|mp3|wav|gcode|nc|exe|pkg|dmg|g3a|lbrn2|clb|lbart|ezd|cdr|eps|psd|ai|ppt|pptx|docx|xlsx)$/i;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).catch(() => {}).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;          // leave cross-origin alone
  if (NEVER.test(url.pathname)) return;                      // never cache downloads

  // HTML navigations: network first, cache as offline fallback
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    e.respondWith(
      fetch(req)
        .then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)).catch(() => {}); return res; })
        .catch(() => caches.match(req).then(hit => hit || caches.match('/')))
    );
    return;
  }

  // small static assets: serve from cache, refresh in background
  if (CACHEABLE.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then(hit => {
        const net = fetch(req).then(res => {
          if (res && res.status === 200) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)).catch(() => {}); }
          return res;
        }).catch(() => hit);
        return hit || net;
      })
    );
  }
});
