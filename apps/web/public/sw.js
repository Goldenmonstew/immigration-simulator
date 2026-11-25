/* global self, caches, fetch, URL, Response */

const CACHE_PREFIX = 'uk-immigration-pwa-';
const CACHE_NAME = `${CACHE_PREFIX}2026-11-25-jpgame`;
// The site may live under a base path (GitHub Pages): take it from the scope.
const BASE = new URL(self.registration.scope).pathname.replace(/\/$/, '');
const at = (path) => `${BASE}${path}`;
const legacyDestinations = new Map(
  ['simulate', 'result', 'whatif', 'policy', 'about', 'game'].map((page) => [
    at(`/${page}`),
    at(`/uk/${page}`),
  ]),
);

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const response = await fetch(at('/offline-pages.json'), {
        cache: 'reload',
      });
      if (!response.ok)
        throw new Error(`Offline page list: ${response.status}`);
      const pages = await response.json();
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(
        [
          ...pages,
          '/manifest.webmanifest',
          '/icon-192.png',
          '/icon-512.png',
        ].map(at),
      );
      // Initial page assets load before the worker controls the tab.
      // Inlined CSS lists several paths in one data-href; skip those.
      const assets = new Set();
      for (const page of pages) {
        const html = await (await cache.match(at(page))).text();
        for (const match of html.matchAll(
          /(?:src|href)="([^"\s]*\/_next\/static\/[^"\s]+)"/g,
        ))
          if (match[1].startsWith(`${BASE}/_next/`)) assets.add(match[1]);
      }
      await cache.addAll([...assets]);
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter(
            (name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME,
          )
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const fallback = async () =>
        (await cache.match(request)) ??
        (request.mode === 'navigate'
          ? await cache.match(url.pathname)
          : undefined);
      try {
        const response = await fetch(request);
        if (response.ok) {
          event.waitUntil(
            cache.put(request, response.clone()).catch(() => {
              // A full cache must not prevent the online response from loading.
            }),
          );
          return response;
        }
        return (await fallback()) ?? response;
      } catch {
        const destination = legacyDestinations.get(url.pathname);
        if (request.mode === 'navigate' && destination) {
          // Keep the query. The browser carries the fragment across the redirect.
          url.pathname = destination;
          return Response.redirect(url);
        }
        return (await fallback()) ?? Response.error();
      }
    })(),
  );
});
