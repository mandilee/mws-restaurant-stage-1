const staticCacheName = 'restaurant-v2.0',
    DATABASE_URL = 'http://localhost:1337/',
    REVIEW_STORE = 'reviews',
    PENDING_REVIEWS = 'pending';
let _dB;

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(staticCacheName).then(function (cache) {
            return cache.addAll([
                '/manifest.json',
                '/css/all.css',
                '/index.html',
                '/restaurant.html',
                '/js/all_index.js',
                '/js/all_restaurant.js',
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
            });
        })
    );
});


// grab the database so we can updated it
dB = () => {
    if (_dB) {
        return Promise.resolve(_dB);
    }

    return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open('restaurant-reviews', 2);

        openRequest.onerror = () => reject();

        openRequest.onsuccess = (event) => {
            _dB = openRequest.result;
            resolve(_dB);
        };
    });
};


// https://developers.google.com/web/updates/2015/12/background-sync
self.addEventListener('sync', (event) => {
    if (event.tag === 'send-reviews') {
        event.waitUntil(
            getPendingReviews()
            .then((messages) => {
                return Promise.all(messages.map((message) => updateServerReviews(message)));
            })
            .then(() => emptyPending())
            .then(() => {
                this.clients.matchAll().then((clients) => {
                    clients.forEach(client => client.postMessage('update-reviews'));
                });
            })
        );
    }
});

// grab the pending reviews
getPendingReviews = () => {
    return dB()
        .then(db => {
            const transaction = db.transaction(PENDING_REVIEWS, 'readonly'),
                store = transaction.objectStore(PENDING_REVIEWS);
            return store.getAll();
        })
        .then(query => new Promise((resolve) => {
            query.onsuccess = () => resolve(query.result);
        }))
        .catch(error => {
            console.warn(`Couldn't get pending reviews`, error.message);
            return [];
        });
};

// push pending reviews to the server
updateServerReviews = (data) => {
    return fetch(`${DATABASE_URL}reviews/`, {
            method: 'post',
            body: JSON.stringify(data)
        })
        .then((response) => response.json())
        .then((review) => {
            putDataInDb(REVIEW_STORE, [review]);
        });
};

// clear the pending reviews so they don't get pushed again
emptyPending = () => {
    return dB()
        .then((db) => {
            const transaction = db.transaction(PENDING_REVIEWS, 'readwrite');
            const store = transaction.objectStore(PENDING_REVIEWS);
            return store.clear();
        })
        .then((query) => new Promise((resolve) => {
            query.onsuccess = () => resolve();
        }))
        .catch(error => {
            console.warn(`Couldn't clear pending reviews`, error.message);
            return [];
        });
};

// put the reviews in teh database too
putDataInDb = (storeName, reviews) => {
    return dB()
        .then((db) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            reviews.forEach((review) => {
                store.put(review);
            });
        })
        .catch(error => {
            console.warn(`Couldn't set ${data} for ${storeName}.`, error.message);
            return [];
        });
};
