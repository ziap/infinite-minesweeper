const CACHE_NAME = 'offline-cache'

function addCache(request) {
    const interval = setInterval(() => {
        caches.open(CACHE_NAME).then(cache => {
            try {
                cache.add(request)
            } catch {
                return  
            }
            clearInterval(interval) 
        })
    }, 1000)
}

self.addEventListener('fetch', e =>
    e.respondWith((async() => {
        const cache = await caches.open(CACHE_NAME)
        try {
            addCache(e.request)
            return await fetch(e.request)
        } catch (err) {
            return await cache.match(e.request)
        }
    })())
)
