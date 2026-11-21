const CACHE_PREFIX = 'banana-boss-app-';
const CACHE_NAME = CACHE_PREFIX + 'v2';
const SHELL = '/index.html';

function immutable(url) {
  return url.origin === self.location.origin &&
    /^\/(?:assets\/|_expo\/static\/)/.test(url.pathname) &&
    /[.-][a-f0-9]{32}(?:@[\d.]+x)?\.\w+$/i.test(url.pathname);
}

function valid(response) {
  return response.status === 200 && response.type === 'basic' && !response.redirected &&
    new URL(response.url).origin === self.location.origin &&
    !/\b(?:private|no-store)\b/i.test(response.headers.get('Cache-Control') || '');
}

function html(response) {
  return /^text\/html\b/i.test(response.headers.get('Content-Type') || '');
}

const metadata = new Map([
  ['/manifest.json', /^application\/(?:manifest\+)?json\b/i],
  ['/logo.png', /^image\/png\b/i],
]);

async function cacheShell(response) {
  const cache = await caches.open(CACHE_NAME);
  if (!valid(response) || !html(response)) throw new Error('Invalid app shell');
  const markup = await response.clone().text();
  const entries = Array.from(markup.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/gi),
    ([, src]) => new URL(src, response.url));
  if (!entries.some(immutable)) throw new Error('Missing Expo entry script');
  await Promise.all(entries.filter(immutable).map(async url => {
    if (await cache.match(url.href)) return;
    const script = await fetch(url, { cache: 'force-cache' });
    if (!valid(script) || !/javascript/i.test(script.headers.get('Content-Type') || '')) {
      throw new Error('Invalid Expo entry script');
    }
    await cache.put(url.href, script);
  }));
  await cache.put(SHELL, response);
}

async function installShell() {
  await cacheShell(await fetch(SHELL, { cache: 'reload' }));
  const cache = await caches.open(CACHE_NAME);
  await Promise.all(Array.from(metadata, async ([path, mime]) => {
    const resource = await fetch(path, { cache: 'no-cache' });
    if (!valid(resource) || !mime.test(resource.headers.get('Content-Type') || '')) {
      throw new Error('Invalid PWA metadata: ' + path);
    }
    await cache.put(path, resource);
  }));
  // Carry forward boot fonts and the app icon from controlled v1 sessions. The open page
  // already loaded them before this worker could observe its requests.
  const previous = CACHE_PREFIX + 'v1';
  if (await caches.has(previous)) {
    const old = await caches.open(previous);
    await Promise.all((await old.keys()).map(async request => {
      const url = new URL(request.url);
      const bootAsset = /\.(?:ttf|woff2?)$/i.test(url.pathname) || /\/icon\.[a-f0-9]{32}\.png$/i.test(url.pathname);
      if (!immutable(url) || !bootAsset) return;
      const asset = await old.match(request);
      if (asset && valid(asset) && !html(asset)) await cache.put(request, asset);
    }));
  }
  await self.skipWaiting();
}

self.addEventListener('install', event => event.waitUntil(installShell()));

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

// waitUntil is attached while respondWith is pending. A storage failure must
// never discard an otherwise successful online response.
function remember(event, key, response) {
  const copy = response.clone();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(key, copy)).catch(() => {}));
}

function match(key) {
  return caches.match(key, { cacheName: CACHE_NAME }).catch(() => undefined);
}

async function asset(event) {
  const cached = await match(event.request);
  if (cached) return cached;
  const response = await fetch(event.request);
  if (valid(response) && !html(response)) remember(event, event.request, response);
  return response;
}

async function navigation(event) {
  try {
    const response = await fetch(event.request, { cache: 'no-cache' });
    if (valid(response) && html(response)) {
      // Publish the offline shell only once its matching entry script is available.
      event.waitUntil(cacheShell(response.clone()).catch(() => {}));
    }
    return response;
  } catch (error) {
    const cached = await match(SHELL);
    if (cached) return cached;
    throw error;
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin ||
      /^\/api(?:\/|$)/i.test(url.pathname) || request.headers.has('Authorization') ||
      request.headers.has('Range')) return;

  if (immutable(url)) {
    event.respondWith(asset(event));
  } else if (request.mode === 'navigate' && request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(navigation(event));
  } else if (metadata.has(url.pathname)) {
    const refresh = fetch(request).then(response => {
      if (valid(response) && metadata.get(url.pathname).test(response.headers.get('Content-Type') || '')) {
        remember(event, request, response);
      }
      return response;
    });
    event.waitUntil(refresh.catch(() => {}));
    event.respondWith(match(request).then(cached => cached || refresh));
  }
});

// Requests started before the first worker took control bypass its fetch
// handler. Copy just those immutable resources from the browser HTTP cache.
self.addEventListener('message', event => {
  if (event.data?.type !== 'warm-assets' || !Array.isArray(event.data.urls)) return;
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.allSettled(event.data.urls.map(async href => {
      const url = new URL(href);
      if (!immutable(url) || await cache.match(url.href)) return;
      const response = await fetch(url, { cache: 'force-cache' });
      if (valid(response) && !html(response)) await cache.put(url.href, response);
    }));
  })());
});
