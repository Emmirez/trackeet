const CACHE_NAME = "trackeet-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Network-first strategy — always try network, no offline caching for now
  event.respondWith(fetch(event.request));
});
