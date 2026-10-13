// Trust Lesson PWA Service Worker
const CACHE_NAME = "trust-lesson-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/logo.webp",
  "/logo-full.webp"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || event.request.url.startsWith("chrome-extension")) return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
