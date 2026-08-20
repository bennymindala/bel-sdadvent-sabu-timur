/* =========================================================
   🔔 BEL SEKOLAH
   SD ADVENT SABU TIMUR

   FITUR:

   ✅ Unlock audio tanpa membunyikan MP3
   ✅ Android Chrome
   ✅ Safari/iPhone sebisa mungkin
   ✅ Audio sesuai jadwal
   ✅ Aktif / nonaktif
   ✅ Retry audio
   ✅ Cek file MP3
   ✅ Bel berikutnya
   ✅ Animasi jadwal
   ✅ Popup
   ✅ Anti double alarm
   ✅ Mode Uji Coba Real-Time
========================================================= */


/* =========================================================
   MODE UJI COBA
========================================================= */

let testMode = false;


/* =========================================================
   JADWAL NORMAL
========================================================= */

const normalSchedule = [

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
   JADWAL AKTIF
========================================================= */

let bellSchedule =
    [...normalSchedule];


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

const testModeButton =
    document.getElementById("testModeButton");

const testStatus =
    document.getElementById("testStatus");

const installButton =
    document.getElementById("installButton");

const laterButton =
    document.getElementById("laterButton");

const installPopup =
    document.getElementById("installPopup");

const fixedInstallButton =
    document.getElementById("fixedInstallButton");


/* =========================================================
   AUDIO ELEMENT
========================================================= */

const audioElements = {};


bellSchedule.forEach(
    bell => {

        const audio =
            document.getElementById(
                bell.audioId
            );


        if (audio) {

            audio.preload =
                "auto";


            audioElements[
                bell.audioId
            ] = audio;

        }

    }
);


/* =========================================================
   SILENT AUDIO
========================================================= */

const silentAudio =
    document.getElementById(
        "silentAudio"
    );


/* =========================================================
   STATE
========================================================= */

let systemActive =
    false;

let audioUnlocked =
    false;

let lastPlayedKey =
    "";

let currentPlayingAudio =
    null;


/* =========================================================
   RETRY
========================================================= */

const MAX_RETRY =
    3;


/* =========================================================
   WITA
========================================================= */

function getWitaDate() {

    const now =
        new Date();


    const witaString =
        now.toLocaleString(
            "en-US",
            {
                timeZone:
                    "Asia/Makassar"
            }
        );


    return new Date(
        witaString
    );
}


/* =========================================================
   JAM
========================================================= */

function updateClock() {

    const now =
        getWitaDate();


    if (clockElement) {

        clockElement.textContent =
            now.toLocaleTimeString(
                "id-ID",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false
                }
            );

    }


    if (dateElement) {

        dateElement.textContent =
            now.toLocaleDateString(
                "id-ID",
                {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );

    }


    checkBell(
        now
    );


    updateNextBell(
        now
    );

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


    const hour =
        String(
            now.getHours()
        ).padStart(
            2,
            "0"
        );


    const minute =
        String(
            now.getMinutes()
        ).padStart(
            2,
            "0"
        );


    const currentTime =
        `${hour}:${minute}`;


    const dateKey =
        [
            now.getFullYear(),
            now.getMonth() + 1,
            now.getDate()
        ].join("-");


    const uniqueKey =
        `${dateKey}-${currentTime}`;


    /*
       Anti double alarm
    */

    if (
        lastPlayedKey ===
        uniqueKey
    ) {

        return;
    }


    const bell =
        bellSchedule.find(
            item =>
                item.time ===
                currentTime
        );


    if (!bell) {
        return;
    }


    /*
       Tandai SEBELUM play
       agar tidak double.
    */

    lastPlayedKey =
        uniqueKey;


    playBell(
        bell
    );

}


/* =========================================================
   PLAY BELL
========================================================= */

async function playBell(
    bell
) {

    const audio =
        audioElements[
            bell.audioId
        ];


    if (!audio) {

        showAudioError(
            `Audio ${bell.audioId} tidak ditemukan.`
        );

        return;
    }


    /*
       Jika audio lain sedang berjalan,
       hentikan terlebih dahulu.
    */

    stopAllAudio();


    /*
       Animasi
    */

    highlightSchedule(
        bell.time
    );


    /*
       Popup
    */

    showBellPopup(
        bell.message
    );


    /*
       Play
    */

    await playAudio(
        audio,
        bell
    );

}


/* =========================================================
   STOP SEMUA AUDIO
========================================================= */

function stopAllAudio() {

    Object.values(
        audioElements
    ).forEach(
        audio => {

            try {

                audio.pause();

                audio.currentTime =
                    0;

            }

            catch (error) {

                console.warn(
                    error
                );

            }

        }
    );


    currentPlayingAudio =
        null;
}


/* =========================================================
   PLAY AUDIO
========================================================= */

async function playAudio(
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
                `🔊 ${bell.name} - percobaan ${attempt}`
            );


            audio.currentTime =
                0;


            currentPlayingAudio =
                audio;


            await audio.play();


            console.log(
                `✅ Audio berhasil: ${bell.name}`
            );


            if (systemActive) {

                statusElement.textContent =
                    "🟢 Sistem Bel Aktif • Audio OK";

            }


            return true;

        }

        catch (error) {

            console.warn(
                `⚠️ Audio gagal percobaan ${attempt}`,
                error
            );


            await wait(
                1000
            );

        }

    }


    showAudioError(
        `Audio "${bell.name}" gagal dimainkan.`
    );


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
   🔓 UNLOCK AUDIO
=========================================================

   SANGAT PENTING:

   TIDAK memainkan MP3 bel.

   Hanya silentAudio.
========================================================= */

async function unlockAudio() {

    console.log(
        "🔓 Membuka izin audio..."
    );


    if (!silentAudio) {

        console.error(
            "❌ silentAudio tidak ditemukan."
        );

        return false;
    }


    try {

        silentAudio.volume =
            0;


        silentAudio.currentTime =
            0;


        await silentAudio.play();


        silentAudio.pause();


        silentAudio.currentTime =
            0;


        silentAudio.volume =
            1;


        audioUnlocked =
            true;


        console.log(
            "✅ Audio berhasil di-unlock."
        );


        return true;

    }

    catch (error) {

        console.error(
            "❌ Browser menolak audio:",
            error
        );


        audioUnlocked =
            false;


        return false;

    }

}


/* =========================================================
   AKTIFKAN / MATIKAN
========================================================= */

if (activateButton) {

    activateButton.addEventListener(
        "click",
        async () => {


            /*
               MATIKAN
            */

            if (systemActive) {

                systemActive =
                    false;


                stopAllAudio();


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


                statusElement.textContent =
                    "🔴 Sistem Bel Belum Aktif";


                statusLight.classList.remove(
                    "on"
                );


                statusLight.classList.add(
                    "off"
                );


                console.log(
                    "🔴 Sistem dimatikan."
                );


                return;
            }


            /*
               AKTIFKAN
            */

            activateButton.disabled =
                true;


            activateButton.innerHTML =
                `
                🔓 MEMBUKA AUDIO...
                `;


            /*
               Unlock silent audio
            */

            const unlocked =
                await unlockAudio();


            if (!unlocked) {

                activateButton.disabled =
                    false;


                activateButton.innerHTML =
                    `
                    🔔 COBA AKTIFKAN LAGI
                    `;


                statusElement.textContent =
                    "🔴 Audio belum tersedia";


                return;

            }


            /*
               AKTIF
            */

            systemActive =
                true;


            activateButton.disabled =
                false;


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


            statusElement.textContent =
                "🟢 Sistem Bel Aktif • Audio OK";


            statusLight.classList.remove(
                "off"
            );


            statusLight.classList.add(
                "on"
            );


            console.log(
                "🟢 SISTEM BEL AKTIF"
            );

        }
    );

}


/* =========================================================
   🧪 MODE UJI COBA REAL-TIME
========================================================= */

if (testModeButton) {

    testModeButton.addEventListener(
        "click",
        async () => {


            /*
               Kalau mode test sedang aktif,
               matikan kembali.
            */

            if (testMode) {

                testMode =
                    false;


                bellSchedule =
                    [...normalSchedule];


                testModeButton.textContent =
                    "🧪 AKTIFKAN MODE UJI COBA";


                testStatus.textContent =
                    "Mode uji coba tidak aktif";


                updateScheduleDisplay();


                updateNextBell(
                    getWitaDate()
                );


                return;
            }


            /*
               Audio harus diaktifkan dulu.
            */

            if (!audioUnlocked) {

                const unlocked =
                    await unlockAudio();


                if (!unlocked) {

                    alert(
                        "Audio belum dapat diaktifkan. Tekan AKTIFKAN SISTEM BEL terlebih dahulu."
                    );


                    return;
                }

            }


            /*
               Aktifkan sistem otomatis.
            */

            if (!systemActive) {

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


                statusElement.textContent =
                    "🟢 Sistem Bel Aktif • MODE UJI COBA";


                statusLight.classList.remove(
                    "off"
                );


                statusLight.classList.add(
                    "on"
                );

            }


            /*
               AKTIFKAN TEST
            */

            testMode =
                true;


            createTestSchedule();


            testModeButton.textContent =
                "🛑 MATIKAN MODE UJI COBA";


            testStatus.textContent =
                "🧪 Mode uji coba aktif • Bel akan berbunyi otomatis";


            updateScheduleDisplay();


            updateNextBell(
                getWitaDate()
            );


            console.log(
                "🧪 MODE UJI COBA AKTIF"
            );

        }
    );

}


/* =========================================================
   BUAT JADWAL TEST
========================================================= */

function createTestSchedule() {

    const now =
        getWitaDate();


    const testTimes = [];


    /*
       Buat:

       +10 detik
       +25 detik
       +40 detik
       +55 detik
       +70 detik
    */


    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const testDate =
            new Date(
                now.getTime() +
                (
                    (i + 1) *
                    15 *
                    1000
                )
            );


        const hour =
            String(
                testDate.getHours()
            ).padStart(
                2,
                "0"
            );


        const minute =
            String(
                testDate.getMinutes()
            ).padStart(
                2,
                "0"
            );


        /*
           Karena sistem utama
           memeriksa menit,
           test menggunakan menit
           yang berbeda.

           Jika beberapa masuk menit
           sama, kita pindahkan.
        */

        testTimes.push(
            `${hour}:${minute}`
        );

    }


    /*
       Untuk pengujian yang benar-benar
       menggunakan REAL TIME per menit,
       kita gunakan 1 menit ke depan.
    */

    const base =
        new Date(
            now.getTime() +
            60 * 1000
        );


    bellSchedule =
        normalSchedule.map(
            (bell, index) => {

                const date =
                    new Date(
                        base.getTime() +
                        (
                            index *
                            60 *
                            1000
                        )
                    );


                const hour =
                    String(
                        date.getHours()
                    ).padStart(
                        2,
                        "0"
                    );


                const minute =
                    String(
                        date.getMinutes()
                    ).padStart(
                        2,
                        "0"
                    );


                return {

                    ...bell,

                    time:
                        `${hour}:${minute}`,

                    name:
                        `TEST • ${bell.name}`,

                    message:
                        `🧪 TEST: ${bell.message}`

                };

            }
        );


    console.table(
        bellSchedule
    );

}


/* =========================================================
   UPDATE TAMPILAN JADWAL
========================================================= */

function updateScheduleDisplay() {

    const items =
        document.querySelectorAll(
            ".schedule-item"
        );


    items.forEach(
        (item, index) => {

            const bell =
                bellSchedule[index];


            if (!bell) {
                return;
            }


            const time =
                item.querySelector(
                    ".schedule-time"
                );


            const name =
                item.querySelector(
                    ".schedule-info strong"
                );


            if (time) {

                time.textContent =
                    bell.time;

            }


            if (name) {

                name.textContent =
                    bell.name;

            }


            item.dataset.time =
                bell.time;

        }
    );

}


/* =========================================================
   CEK FILE AUDIO
========================================================= */

function checkAudioFiles() {

    console.log(
        "🎵 Mengecek MP3..."
    );


    normalSchedule.forEach(
        bell => {

            const audio =
                audioElements[
                    bell.audioId
                ];


            if (!audio) {

                console.error(
                    `❌ Audio tidak ditemukan: ${bell.audioId}`
                );

                return;
            }


            audio.addEventListener(
                "canplay",
                () => {

                    console.log(
                        `✅ MP3 siap: ${bell.audioId}`
                    );

                    audio.dataset.loaded =
                        "true";

                }
            );


            audio.addEventListener(
                "error",
                () => {

                    console.error(
                        `❌ MP3 gagal: ${bell.audioId}`
                    );

                    audio.dataset.loaded =
                        "false";

                }
            );


            audio.load();

        }
    );

}


/* =========================================================
   STATUS ERROR
========================================================= */

function showAudioError(
    message
) {

    console.error(
        "🔴",
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


    let next =
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

            next =
                bell;

            break;

        }

    }


    if (!next) {

        next =
            bellSchedule[0];


        nextBellElement.textContent =
            `${next.time} • ${next.name} (Besok)`;

        return;

    }


    nextBellElement.textContent =
        `${next.time} • ${next.name}`;

}


/* =========================================================
   HIGHLIGHT
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


    const active =
        document.querySelector(
            `.schedule-item[data-time="${time}"]`
        );


    if (!active) {
        return;
    }


    active.classList.add(
        "active"
    );


    active.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });


    setTimeout(
        () => {

            active.classList.remove(
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


    bellMessage.textContent =
        message;


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


window.addEventListener(
    "beforeinstallprompt",
    event => {

        event.preventDefault();


        deferredPrompt =
            event;


        if (fixedInstallButton) {

            fixedInstallButton.style.display =
                "flex";

        }

    }
);


/* =========================================================
   INSTALL
========================================================= */

async function installApp() {

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


    alert(
        "📱 Cara memasang Bel Sekolah:\n\n" +
        "Android: buka menu browser ⋮ → Install aplikasi / Tambahkan ke layar utama.\n\n" +
        "iPhone: tekan Bagikan ⬆️ → Tambahkan ke Layar Utama."
    );

}


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


if (laterButton) {

    laterButton.addEventListener(
        "click",
        () => {

            installPopup.classList.remove(
                "show"
            );

        }
    );

}


/* =========================================================
   APP INSTALLED
========================================================= */

window.addEventListener(
    "appinstalled",
    () => {

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
                .register(
                    "./sw.js"
                )
                .then(
                    registration => {

                        console.log(
                            "✅ SW aktif:",
                            registration.scope
                        );

                    }
                )
                .catch(
                    error => {

                        console.error(
                            "❌ SW gagal:",
                            error
                        );

                    }
                );

        }
    );

}


/* =========================================================
   START
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


        if (fixedInstallButton) {

            fixedInstallButton.style.display =
                "none";

        }

    }
);