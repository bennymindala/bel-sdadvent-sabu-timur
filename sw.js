const CACHE_NAME = "bel-sekolah-v4";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "./logo.jpg",

    "./masuk.mp3",
    "./doa-pagi.mp3",
    "./istrahat.mp3",
    "./masuk-setelah-istrahat.mp3",
    "./pulang-sekolah.mp3"
];

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                console.log(
                    "📦 Menyimpan aplikasi dan audio..."
                );

                return cache.addAll(
                    FILES_TO_CACHE
                );

            })
            .catch(error => {

                console.error(
                    "❌ Cache gagal:",
                    error
                );

            })
    );

    self.skipWaiting();
});


self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(cacheNames => {

                return Promise.all(

                    cacheNames
                        .filter(
                            name =>
                                name !== CACHE_NAME
                        )
                        .map(
                            name =>
                                caches.delete(name)
                        )
                );

            })
    );

    self.clients.claim();
});


self.addEventListener("fetch", event => {

    event.respondWith(

        caches.match(event.request)
            .then(cached => {

                if (cached) {
                    return cached;
                }

                return fetch(event.request);

            })
            .catch(() => {

                return caches.match(
                    "./index.html"
                );

            })
    );
});