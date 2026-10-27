// Service Hub PWA Service Worker for Windows & Desktop Installation
const CACHE_NAME = 'service-hub-v1'

const PRECACHE_ASSETS = [
  '/',
  '/icon.svg',
  '/manifest.json',
  '/favicon.svg'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('PWA Precache warning:', err)
      })
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }
        })
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return

  // Do not intercept API requests or Server Actions
  const url = new URL(event.request.url)
  if (url.pathname.startsWith('/api') || event.request.headers.get('accept')?.includes('text/x-component')) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache static asset copies
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (url.pathname.startsWith('/_next/static') || url.pathname.endsWith('.svg') || url.pathname.endsWith('.png'))
        ) {
          const responseClone = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        return networkResponse
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse
          // Fallback to root for navigations
          if (event.request.mode === 'navigate') {
            return caches.match('/')
          }
          return new Response('Network error occurred while offline', { status: 503 })
        })
      })
  )
})
