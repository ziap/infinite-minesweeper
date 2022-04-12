const CACHE_NAME = 'offline-cache'

self.addEventListener('fetch', e =>
    e.respondWith(
        caches.open(CACHE_NAME).then(cache =>
            fetch(e.request)
                .then(response => cache.put(e.request, response.clone()).then(() => response))
                .catch(() => cache.match(e.request).then(response => response))
        )
    )
)
