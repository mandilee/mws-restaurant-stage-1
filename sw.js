var staticCacheName = 'restaurant-v1.0';

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(staticCacheName).then(function (cache) {
            return cache.addAll([
                '/',
                '/css/reviews.css',
                '/css/styles.css',
                '/css/layout/flex.css',
                '/index.html',
                '/restaurant.html',
                '/js/restaurant_info.js',
                '/js/dbhelper.js',
                '/js/main.js',
                'https://cdnjs.cloudflare.com/ajax/libs/normalize/3.0.3/normalize.min.css'
            ]);
        })
    );
});


self.addEventListener('fetch', function (event) {
    event.respondWith(
        // open the cache so we can pull from it if possible
        // or save the page if it isn't already cached
        caches.open(staticCacheName).then(function (cache) {
            return cache.match(event.request).then(function (response) {
                if (response) {
                    return response;
                } else {
                    return fetch(event.request).then(function (response) {
                        cache.put(event.request, response.clone());
                        return response;
                    });
                }
            })
        })
    )
});
