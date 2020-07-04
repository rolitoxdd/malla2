const PRECACHE = 'precache-v3';
const RUNTIME = 'runtime';

// Habilita el cache de todo para permitir funcionamiento online
// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
    './index.html',
    './',
    './index.html',
    './prioridad/',
    './personalizar/',
    './personalizar/malla.html',
    './views/header.html',
    './views/footer.html',
    './js/init.js',
    './js/malla.js',
    './js/customMalla.js',
    './js/ramo.js',
    './js/selectableRamo.js',
    './js/semesterManager.js',
    './js/priorix.js',
    './js/generator.js',
    './js/mallaEditor.js',
    './css/darkMode.css',
    './css/prettify.css',
    './css/styles.css',
    './data/carreras.json'

];

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
    console.log("activado")
    const currentCaches = [PRECACHE, RUNTIME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
        }).then(cachesToDelete => {
            return Promise.all(cachesToDelete.map(cacheToDelete => {
                return caches.delete(cacheToDelete);
            }));
        }).then(() => self.clients.claim())
    );
});

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.

self.addEventListener('fetch', event => {
    // Skip cross-origin requests, like those for Google Analytics.
    if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            caches.match(event.request, {ignoreSearch:true}).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return caches.open(RUNTIME).then(cache => {
                    return fetch(event.request).then(response => {
                        // Put a copy of the response in the runtime cache.
                        return cache.put(event.request, response.clone()).then(() => {
                            return response;
                        });
                    });
                });
            })
        );
    } else if (event.request.url.includes("d3") ) {

    }
});
// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(PRECACHE)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .then(self.skipWaiting())
    )
});


importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

if (workbox) {
    console.log(`Yay! Workbox is loaded 🎉`);
    workbox.routing.registerRoute(
        'https://d3js.org/d3.v5.min.js',
        new workbox.strategies.StaleWhileRevalidate(),
    );
    workbox.routing.registerRoute(
        "https://maxcdn.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css",
        new workbox.strategies.StaleWhileRevalidate(),
    );
    workbox.routing.registerRoute(
        "https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js",
        new workbox.strategies.StaleWhileRevalidate(),
    );
    workbox.routing.registerRoute(
        "https://maxcdn.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.bundle.min.js",
        new workbox.strategies.StaleWhileRevalidate(),
    );
    workbox.routing.registerRoute(
        "https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.4/clipboard.min.js",
        new workbox.strategies.StaleWhileRevalidate(),
    );
    workbox.routing.registerRoute(
        'https://cdn.jsdelivr.net/gh/cferdinandi/smooth-scroll/dist/smooth-scroll.polyfills.min.js',
    new workbox.strategies.StaleWhileRevalidate(),
);
} else {
    console.log(`Boo! Workbox didn't load 😬`);

}
