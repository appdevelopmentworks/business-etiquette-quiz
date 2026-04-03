const VERSION = "beq-pwa-v1";
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;
const ASSET_CACHE = `${VERSION}-assets`;

const PRECACHE_URLS = [
  "/",
  "/quiz",
  "/review",
  "/progress",
  "/topics",
  "/offline",
  "/manifest.webmanifest",
  "/pwa/icon-192x192.png",
  "/pwa/icon-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(VERSION))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (
    url.pathname.startsWith("/_next/static/") ||
    /\.(?:css|js|png|jpg|jpeg|svg|webp|ico|json|webmanifest)$/u.test(url.pathname)
  ) {
    event.respondWith(staleWhileRevalidateAsset(request));
  }
});

async function networkFirstPage(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(PAGE_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    return (
      (await caches.match("/offline")) ||
      (await caches.match("/")) ||
      Response.error()
    );
  }
}

async function staleWhileRevalidateAsset(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || networkPromise;
}
