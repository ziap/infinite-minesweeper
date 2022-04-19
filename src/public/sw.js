const CACHE_NAME = 'offline-cache'

self.addEventListener('install', event => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then(cache => cache.addAll(['flag.mp3', 'clear.mp3']))
            .then(self.skipWaiting())
    )
})

self.addEventListener('fetch', e =>
    e.respondWith(
        (async () => {
            const cache = await caches.open(CACHE_NAME)
            if (e.request.headers.get('range')) {
                try {
                    const response = await fetch(e.request.url)
                    cache.put(e.request.url, response.clone())
                    return response
                } catch {
                    return await cache.match(e.request)
                }
            } else {
                try {
                    const response = await fetch(e.request)
                    cache.put(e.request, response.clone())
                    return response
                } catch {
                    return await cache.match(e.request)
                }
            }
        })()
    )
)
