const CACHE_NAME = 'site-static-v1';
const MAX_ITEMS_IN_CACHE = 50;

const assetsToCache = [
    '/',
    '/index.html',
    '/static/js/bundle.js',
    '/static/js/0.chunk.js',
    '/static/js/main.chunk.js',
    '/favicon.ico',
    '/logo192.png',
    '/images/fallback.png'
    // Add other assets and static files as needed
];

function checkCacheSize(cacheName) {
    caches.open(cacheName).then(cache => {
        cache.keys().then(keys => {
            if (keys.length > MAX_ITEMS_IN_CACHE) {
                cache.delete(keys[0]).then(() => {
                    checkCacheSize(cacheName); // Recurse until the cache size is within limits
                });
            }
        });
    });
}

self.addEventListener('message', event => {
    if (event.data.type === 'CHECK_SW') {
        console.log('Received message in service worker: ', event.data.msg);
        // Respond back to the message
        event.ports[0].postMessage({msg: 'Yes, I am here and active.'});
    }
});

// Install service worker
self.addEventListener('install', event => {
    console.log('Service Worker installing.');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching shell assets');
                cache.addAll(assetsToCache);
            })
    );
});

// Activate event
self.addEventListener('activate', event => {
    console.log('Service Worker activating.');    
    event.waitUntil(
        Promise.all([
            // Remove old caches.
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Limit the number of items in the cache.
            caches.open(CACHE_NAME).then(cache => {
                cache.keys().then(keys => {
                    if (keys.length > MAX_ITEMS_IN_CACHE) {
                        cache.delete(keys[0]).then(() => {
                            // Recurse to check and maintain cache size.
                            limitCacheSize(CACHE_NAME, MAX_ITEMS_IN_CACHE);
                        });
                    }
                });
            })
        ])
    );
});

// Function to limit the cache size.
function limitCacheSize(cacheName, maxItems) {
    caches.open(cacheName).then(cache => {
        cache.keys().then(keys => {
            if (keys.length > maxItems) {
                cache.delete(keys[0]).then(() => {
                    limitCacheSize(cacheName, maxItems);
                });
            }
        });
    });
}


// Fetch event logic to cache comic images dynamically when they are requested
self.addEventListener('fetch', event => {
    console.log('Service Worker fetching:', event.request.url);

    // Only cache GET requests.
    if (event.request.method !== 'GET') {
        return;
    }

    const requestUrl = new URL(event.request.url);

    // Check if the request is for a comic image
    if (requestUrl.pathname.startsWith('/Dilbert/') && requestUrl.pathname.endsWith('.png')) {
        event.respondWith(
            fetch(event.request).then(networkResponse => {
                // If the fetch is successful, clone the response, cache it, and return the original response
                return caches.open('dynamic-comics-cache').then(cache => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            }).catch(() => {
                // If the network request fails, look for the request in the cache
                return caches.match(event.request).then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    } else {
                        // If there is no cached response, return the fallback image
                        console.error('Fetching failed and no cache available.');
                        return caches.match('/images/fallback.png');
                    }
                });
            })
        );
    } else {
        // For non-comic requests, use a simple network-first strategy
        event.respondWith(
            fetch(event.request).catch(() => {
                // If the network request fails, return responses from the cache
                return caches.match(event.request);
            })
        );
    }
});
