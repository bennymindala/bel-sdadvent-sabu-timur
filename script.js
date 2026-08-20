/* =========================================================
   🔔 BEL SEKOLAH
   SD ADVENT SABU TIMUR
   FINAL VERSION
   WITA - ANDROID - SAFARI/iPHONE
========================================================= */


/* =========================================================
   JADWAL BEL
========================================================= */

const bellSchedule = [
    {
        time: "07:15",
        name: "Masuk Sekolah",
        message: "Waktunya masuk sekolah!",
        audioId: "masuk"
    },
    {
        time: "09:00",
        name: "Doa Pagi",
        message: "Saatnya doa pagi bersama.",
        audioId: "doaPagi"
    },
    {
        time: "09:20",
        name: "Istirahat",
        message: "Waktunya beristirahat.",
        audioId: "istirahat"
    },
    {
        time: "09:40",
        name: "Masuk Setelah Istirahat",
        message: "Waktunya kembali belajar.",
        audioId: "masukSetelahIstirahat"
    },
    {
        time: "12:30",
        name: "Pulang Sekolah",
        message: "Pelajaran hari ini selesai. Sampai jumpa!",
        audioId: "pulang"
    }
];


/* =========================================================
   ELEMENT
========================================================= */

const clockElement =
    document.getElementById("clock");

const dateElement =
    document.getElementById("date");

const statusElement =
    document.getElementById("status");

const statusLight =
    document.getElementById("statusLight");

const nextBellElement =
    document.getElementById("nextBell");

const activateButton =
    document.getElementById("activateButton");

const bellPopup =
    document.getElementById("bellPopup");

const bellMessage =
    document.getElementById("bellMessage");

const installButton =
    document.getElementById("installButton");

const testBellButton =
    document.getElementById("testBellButton");

const laterButton =
    document.getElementById("laterButton");

const installPopup =
    document.getElementById("installPopup");

const fixedInstallButton =
    document.getElementById("fixedInstallButton");


/* =========================================================
   AUDIO
========================================================= */

const audioElements = {};

bellSchedule.forEach(bell => {

    const audio =
        document.getElementById(bell.audioId);

    if (audio) {

        audio.preload = "auto";

        audioElements[bell.audioId] =
            audio;

    }

});


/* =========================================================
   SISTEM
========================================================= */

let systemActive = false;

let audioUnlocked = false;

let lastPlayedKey = "";

let currentPlayingBell = null;

const MAX_RETRY = 3;


/* =========================================================
   WITA
========================================================= */

function getWitaDate() {

    const now = new Date();

    const witaString =
        now.toLocaleString(
            "en-US",
            {
                timeZone: "Asia/Makassar"
            }
        );

    return new Date(witaString);
}


/* =========================================================
   FORMAT JAM
========================================================= */

function formatTime(date) {

    return date.toLocaleTimeString(
        "id-ID",
        {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        }
    );
}


/* =========================================================
   FORMAT TANGGAL
========================================================= */

function formatDate(date) {

    return date.toLocaleDateString(
        "id-ID",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}


/* =========================================================
   UPDATE JAM
========================================================= */

function updateClock() {

    const now =
        getWitaDate();


    if (clockElement) {

        clockElement.textContent =
            formatTime(now);

    }


    if (dateElement) {

        dateElement.textContent =
            formatDate(now);

    }


    checkBell(now);

    updateNextBell(now);
}


/* =========================================================
   CEK BEL
========================================================= */

function checkBell(now) {

    if (!systemActive) {
        return;
    }


    if (!audioUnlocked) {
        return;
    }


    const hours =
        String(
            now.getHours()
        ).padStart(2, "0");


    const minutes =
        String(
            now.getMinutes()
        ).padStart(2, "0");


    const currentTime =
        `${hours}:${minutes}`;


    const dateKey =
        `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;


    const uniqueKey =
        `${dateKey}-${currentTime}`;


    /*
     * MENCEGAH BEL BERBUNYI 2X
     */

    if (lastPlayedKey === uniqueKey) {

        return;
    }


    const bell =
        bellSchedule.find(
            item =>
                item.time === currentTime
        );


    if (!bell) {

        return;
    }


    lastPlayedKey =
        uniqueKey;


    playBell(bell);
}


/* =========================================================
   MAIN PLAY BELL
========================================================= */

async function playBell(bell) {

    const audio =
        audioElements[bell.audioId];


    if (!audio) {

        showAudioError(
            `Audio "${bell.name}" tidak ditemukan.`
        );

        return;
    }


    currentPlayingBell =
        bell;


    /*
     * ANIMASI JADWAL
     */

    highlightSchedule(
        bell.time
    );


    /*
     * POPUP
     */

    showBellPopup(
        bell.message
    );


    /*
     * RESET AUDIO
     */

    try {

        audio.pause();

        audio.currentTime = 0;

    }

    catch (error) {

        console.warn(
            "Gagal reset audio:",
            error
        );

    }


    /*
     * MAIN PLAY
     */

    await playAudioWithRetry(
        audio,
        bell
    );
}


/* =========================================================
   PLAY + RETRY
========================================================= */

async function playAudioWithRetry(
    audio,
    bell
) {

    for (
        let attempt = 1;
        attempt <= MAX_RETRY;
        attempt++
    ) {

        try {

            console.log(
                `🔊 Memainkan ${bell.name} - percobaan ${attempt}`
            );


            /*
             * Pastikan audio berada
             * pada posisi awal
             */

            if (
                audio.currentTime > 0
            ) {

                audio.currentTime = 0;

            }


            await audio.play();


            console.log(
                `✅ BEL BERHASIL: ${bell.name}`
            );


            updateAudioStatus(
                true
            );


            currentPlayingBell =
                null;


            return true;

        }

        catch (error) {

            console.warn(
                `❌ Percobaan ${attempt} gagal:`,
                error
            );


            if (
                attempt <
                MAX_RETRY
            ) {

                await wait(1000);

            }

        }

    }


    /*
     * Semua percobaan gagal
     */

    console.error(
        `🔴 Audio gagal setelah ${MAX_RETRY} percobaan.`
    );


    showAudioError(
        `Audio "${bell.name}" gagal dimainkan.`
    );


    currentPlayingBell =
        null;


    return false;
}


/* =========================================================
   WAIT
========================================================= */

function wait(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );
}


/* =========================================================
   UNLOCK AUDIO
========================================================= */

async function unlockAudio() {

    console.log(
        "🔓 Mencoba membuka izin audio..."
    );


    const audioList =
        Object.values(
            audioElements
        );


    if (
        audioList.length === 0
    ) {

        console.error(
            "❌ Tidak ada audio ditemukan."
        );

        return false;
    }


    /*
     * Kita mencoba satu per satu.
     *
     * Tidak menggunakan autoplay.
     */

    let unlockedCount = 0;


    for (
        const audio of audioList
    ) {

        try {

            /*
             * Muat audio
             */

            audio.load();


            /*
             * Coba play
             */

            await audio.play();


            /*
             * Jika berhasil,
             * pause kembali.
             */

            audio.pause();

            audio.currentTime = 0;


            unlockedCount++;


            console.log(
                "✅ Audio berhasil di-unlock:",
                audio.id
            );

        }

        catch (error) {

            console.warn(
                "⚠️ Audio belum bisa di-unlock:",
                audio.id,
                error
            );

        }

    }


    /*
     * Jika minimal satu audio berhasil
     */

    if (
        unlockedCount > 0
    ) {

        audioUnlocked =
            true;


        console.log(
            `🔓 Audio aktif ${unlockedCount}/${audioList.length}`
        );


        return true;
    }


    audioUnlocked =
        false;


    return false;
}


/* =========================================================
   TOMBOL AKTIF / NONAKTIF
========================================================= */

if (activateButton) {

    activateButton.addEventListener(
        "click",
        async () => {


            /* =========================================
               MATIKAN
            ========================================= */

            if (systemActive) {

                systemActive =
                    false;


                activateButton.classList.remove(
                    "active"
                );


                activateButton.innerHTML =
                    `
                    <span class="button-icon">
                        🔔
                    </span>

                    <span>
                        AKTIFKAN SISTEM BEL
                    </span>
                    `;


                if (statusElement) {

                    statusElement.textContent =
                        "🔴 Sistem Bel Belum Aktif";

                }


                if (statusLight) {

                    statusLight.classList.remove(
                        "on"
                    );

                    statusLight.classList.add(
                        "off"
                    );

                }


                return;
            }


            /* =========================================
               UNLOCK AUDIO
            ========================================= */

            activateButton.disabled =
                true;


            activateButton.innerHTML =
                `
                🔊 MENGAKTIFKAN AUDIO...
                `;


            const unlocked =
                await unlockAudio();


            activateButton.disabled =
                false;


            if (!unlocked) {

                activateButton.innerHTML =
                    `
                    <span class="button-icon">
                        🔔
                    </span>

                    <span>
                        COBA AKTIFKAN LAGI
                    </span>
                    `;


                if (statusElement) {

                    statusElement.textContent =
                        "🔴 Audio belum tersedia";

                }


                if (statusLight) {

                    statusLight.classList.remove(
                        "on"
                    );

                    statusLight.classList.add(
                        "off"
                    );

                }


                return;
            }


            /* =========================================
               AKTIF
            ========================================= */

            systemActive =
                true;


            activateButton.classList.add(
                "active"
            );


            activateButton.innerHTML =
                `
                <span class="button-icon">
                    🔕
                </span>

                <span>
                    MATIKAN SISTEM BEL
                </span>
                `;


            if (statusElement) {

                statusElement.textContent =
                    "🟢 Sistem Bel Aktif • Audio OK";

            }


            if (statusLight) {

                statusLight.classList.remove(
                    "off"
                );

                statusLight.classList.add(
                    "on"
                );

            }


            console.log(
                "🟢 SISTEM BEL AKTIF"
            );

        }
    );

}


/* =========================================================
   CEK FILE AUDIO
========================================================= */

function checkAudioFiles() {

    console.log(
        "🎵 Memeriksa file MP3..."
    );


    bellSchedule.forEach(
        bell => {

            const audio =
                audioElements[
                    bell.audioId
                ];


            if (!audio) {

                console.error(
                    `❌ Element audio tidak ditemukan: ${bell.audioId}`
                );

                return;
            }


            const source =
                audio.querySelector(
                    "source"
                );


            if (!source) {

                console.error(
                    `❌ Source tidak ditemukan: ${bell.audioId}`
                );

                return;
            }


            const file =
                source.src;


            /*
             * BERHASIL LOAD
             */

            audio.addEventListener(
                "canplay",
                () => {

                    console.log(
                        `✅ MP3 tersedia: ${file}`
                    );

                    audio.dataset.loaded =
                        "true";

                },
                {
                    once: true
                }
            );


            /*
             * ERROR LOAD
             */

            audio.addEventListener(
                "error",
                () => {

                    console.error(
                        `❌ MP3 gagal dimuat: ${file}`
                    );

                    audio.dataset.loaded =
                        "false";

                }
            );


            /*
             * MULAI LOAD
             */

            audio.load();

        }
    );
}


/* =========================================================
   STATUS AUDIO
========================================================= */

function updateAudioStatus(
    success
) {

    if (!statusElement) {
        return;
    }


    if (
        success &&
        systemActive
    ) {

        statusElement.textContent =
            "🟢 Sistem Bel Aktif • Audio OK";

        return;
    }


    if (!success) {

        statusElement.textContent =
            "🟠 Sistem aktif • Audio bermasalah";

    }
}


/* =========================================================
   ERROR AUDIO
========================================================= */

function showAudioError(
    message
) {

    console.error(
        "🔴 AUDIO ERROR:",
        message
    );


    if (statusElement) {

        statusElement.textContent =
            "🔴 Audio gagal dimainkan";

    }


    if (statusLight) {

        statusLight.classList.remove(
            "on"
        );

        statusLight.classList.add(
            "off"
        );

    }
}


/* =========================================================
   BEL BERIKUTNYA
========================================================= */

function updateNextBell(
    now
) {

    if (!nextBellElement) {
        return;
    }


    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();


    let nextBell =
        null;


    for (
        const bell of bellSchedule
    ) {

        const [
            hour,
            minute
        ] =
            bell.time
                .split(":")
                .map(Number);


        const bellMinutes =
            hour * 60 +
            minute;


        if (
            bellMinutes >
            currentMinutes
        ) {

            nextBell =
                bell;

            break;
        }

    }


    /*
     * Semua jadwal sudah lewat
     */

    if (!nextBell) {

        nextBell =
            bellSchedule[0];


        nextBellElement.textContent =
            `${nextBell.time} • ${nextBell.name} (Besok)`;

        return;
    }


    nextBellElement.textContent =
        `${nextBell.time} • ${nextBell.name}`;
}


/* =========================================================
   ANIMASI JADWAL
========================================================= */

function highlightSchedule(
    time
) {

    const items =
        document.querySelectorAll(
            ".schedule-item"
        );


    items.forEach(
        item => {

            item.classList.remove(
                "active"
            );

        }
    );


    const activeItem =
        document.querySelector(
            `.schedule-item[data-time="${time}"]`
        );


    if (!activeItem) {
        return;
    }


    activeItem.classList.add(
        "active"
    );


    /*
     * Scroll ke jadwal
     */

    activeItem.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });


    /*
     * Hapus animasi
     */

    setTimeout(
        () => {

            activeItem.classList.remove(
                "active"
            );

        },
        8000
    );
}


/* =========================================================
   POPUP BEL
========================================================= */

function showBellPopup(
    message
) {

    if (!bellPopup) {
        return;
    }


    if (bellMessage) {

        bellMessage.textContent =
            message;

    }


    bellPopup.classList.add(
        "show"
    );


    setTimeout(
        () => {

            bellPopup.classList.remove(
                "show"
            );

        },
        5000
    );
}


/* =========================================================
   KLIK POPUP
========================================================= */

if (bellPopup) {

    bellPopup.addEventListener(
        "click",
        () => {

            bellPopup.classList.remove(
                "show"
            );

        }
    );

}


/* =========================================================
   PWA INSTALL
========================================================= */

let deferredPrompt =
    null;


/* =========================================================
   ANDROID INSTALL PROMPT
========================================================= */

window.addEventListener(
    "beforeinstallprompt",
    event => {

        event.preventDefault();


        deferredPrompt =
            event;


        console.log(
            "📲 PWA siap di-install."
        );


        if (fixedInstallButton) {

            fixedInstallButton.style.display =
                "flex";

        }

    }
);


/* =========================================================
   INSTALL APP
========================================================= */

async function installApp() {

    /*
     * Chrome Android
     */

    if (deferredPrompt) {

        deferredPrompt.prompt();


        const result =
            await deferredPrompt.userChoice;


        console.log(
            "Install:",
            result.outcome
        );


        deferredPrompt =
            null;


        return;
    }


    /*
     * Safari iPhone
     */

    alert(
        "📱 Cara memasang Bel Sekolah:\n\n" +
        "iPhone/iPad:\n" +
        "1. Tekan tombol Bagikan ⬆️\n" +
        "2. Pilih 'Tambahkan ke Layar Utama'\n\n" +
        "Android:\n" +
        "Buka menu browser ⋮ lalu pilih 'Tambahkan ke layar utama' atau 'Install aplikasi'."
    );
}


/* =========================================================
   INSTALL BUTTON
========================================================= */

if (installButton) {

    installButton.addEventListener(
        "click",
        installApp
    );

}


if (fixedInstallButton) {

    fixedInstallButton.addEventListener(
        "click",
        installApp
    );

}


/* =========================================================
   TOMBOL NANTI
========================================================= */

if (laterButton) {

    laterButton.addEventListener(
        "click",
        () => {

            if (installPopup) {

                installPopup.classList.remove(
                    "show"
                );

            }

        }
    );

}


/* =========================================================
   APP INSTALLED
========================================================= */

window.addEventListener(
    "appinstalled",
    () => {

        console.log(
            "✅ Bel Sekolah berhasil di-install."
        );


        deferredPrompt =
            null;


        if (installPopup) {

            installPopup.classList.remove(
                "show"
            );

        }


        if (fixedInstallButton) {

            fixedInstallButton.style.display =
                "none";

        }

    }
);


/* =========================================================
   SERVICE WORKER
========================================================= */

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register("./sw.js")
                .then(
                    registration => {

                        console.log(
                            "✅ Service Worker aktif:",
                            registration.scope
                        );

                    }
                )
                .catch(
                    error => {

                        console.error(
                            "❌ Service Worker gagal:",
                            error
                        );

                    }
                );

        }
    );

}


/* =========================================================
   INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "🚀 BEL SEKOLAH SIAP"
        );


        checkAudioFiles();


        updateClock();


        setInterval(
            updateClock,
            1000
        );


        /*
         * Tombol install awalnya disembunyikan.
         */

        if (fixedInstallButton) {

            fixedInstallButton.style.display =
                "none";

        }   

    }

    
    
);
/* =========================================================
   🧪 TEST BEL
========================================================= */

if (testBellButton) {

    testBellButton.addEventListener(
        "click",
        async () => {

            console.log("🧪 TEST BEL DIMULAI");


            /*
             * Pastikan audio sudah di-unlock
             */

            if (!audioUnlocked) {

                const unlocked =
                    await unlockAudio();

                if (!unlocked) {

                    alert(
                        "❌ Audio belum tersedia.\n\n" +
                        "Pastikan file MP3 ada dan coba lagi."
                    );

                    return;
                }
            }


            /*
             * Ambil bel pertama
             */

            const testBell =
                bellSchedule[0];


            /*
             * Mainkan
             */

            await playBell(testBell);

        }
    );

};