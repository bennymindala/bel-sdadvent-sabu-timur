const CACHE_NAME = "bel-sekolah-v5";

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


self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches.open(
                CACHE_NAME
            )
            .then(
                cache => {

                    return cache.addAll(
                        FILES_TO_CACHE
                    );

                }
            )

        );

        self.skipWaiting();

    }
);


self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches.keys()
            .then(
                names => {

                    return Promise.all(

                        names
                        .filter(
                            name =>
                                name !==
                                CACHE_NAME
                        )
                        .map(
                            name =>
                                caches.delete(
                                    name
                                )
                        )

                    );

                }
            )

        );

        self.clients.claim();

    }
);


self.addEventListener(
    "fetch",
    event => {

        event.respondWith(

            caches.match(
                event.request
            )
            .then(
                cached => {

                    if (cached) {

                        return cached;

                    }

                    return fetch(
                        event.request
                    );

                }
            )

        );

    }
);