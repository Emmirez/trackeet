const CACHE_NAME = "trackeet-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Only handle same-origin requests — let cross-origin API calls pass through
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  event.respondWith(fetch(event.request));
});
