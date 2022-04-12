const CACHE_NAME = 'offline-cache'
const PRECACHE_URLS = [
    'clear.mp3',
    'flag.mp3',
]

self.addEventListener('install', event => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .then(self.skipWaiting())
    )
})

self.addEventListener('fetch', e =>
    e.respondWith(
        caches.open(CACHE_NAME).then(cache =>
            fetch(e.request)
                .then(response => cache.put(e.request, response.clone()).then(() => response))
                .catch(() => cache.match(e.request).then(response => response))
        )
    )
)
