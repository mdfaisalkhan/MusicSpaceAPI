

const API_BASE = "https://saavn.sumit.co";



const searchForm =document.getElementById("searchForm");
const searchInput =document.getElementById("searchInput");
const searchBtn =document.getElementById("searchBtn");
const songsContainer =document.getElementById("songsContainer");
const favoritesContainer =document.getElementById("favoritesContainer");
const favoriteEmpty =document.getElementById("favoriteEmpty");
const loading =document.getElementById("loading");
const message =document.getElementById("message");
const sectionTitle =document.getElementById("sectionTitle");
const resultCount =document.getElementById("resultCount");
const exploreBtn =document.getElementById("exploreBtn");
const audioPlayer =document.getElementById("audioPlayer");
const masterSongImg =document.getElementById("masterSongImg");
const masterSongName =document.getElementById("masterSongName");
const masterArtistName =document.getElementById("masterArtistName");
const masterPlay =document.getElementById("masterPlay");
const previousBtn = document.getElementById("previous");
const nextBtn =document.getElementById("next");
const myProgressBar =document.getElementById("myProgressBar");
const currentTimeEl =document.getElementById("currentTime");
const totalTimeEl =document.getElementById("totalTime");
const volumeBar =document.getElementById("volumeBar");
const volumeIcon =document.getElementById("volumeIcon");
const mobileMenu =  document.getElementById("mobileMenu");
const mobileSidebar =document.getElementById("mobileSidebar");
const closeMobileMenu = document.getElementById("closeMobileMenu");



let songs = [];

let currentSongIndex = -1;

let favorites = loadFavorites();


audioPlayer.volume = 0.8;


const DEFAULT_IMAGE =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500' viewBox='0 0 500 500'%3E%3Crect width='500' height='500' fill='%2317171d'/%3E%3Ccircle cx='250' cy='250' r='130' fill='%23a855f7' opacity='.15'/%3E%3Cpath d='M250 160v170a45 45 0 1 1-32-43V185h110v-25H250z' fill='%23c084fc'/%3E%3C/svg%3E";


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function formatTime(seconds) {

    if (
        !seconds ||
        Number.isNaN(Number(seconds))
    ) {

        return "00:00";

    }


    const totalSeconds =
        Math.floor(Number(seconds));


    const minutes =
        Math.floor(totalSeconds / 60);


    const remaining =
        totalSeconds % 60;


    return `${String(minutes).padStart(2, "0")}:${String(
        remaining
    ).padStart(2, "0")}`;

}


/*
   Loading
*/

function showLoading(value) {

    if (!loading) {
        return;
    }


    loading.classList.toggle(
        "hidden",
        !value
    );

}


function showMessage(text) {

    if (message) {
        message.textContent = text || "";
    }

}



function getImage(song) {

    if (!song) {
        return DEFAULT_IMAGE;
    }


    /*
       New API:

       image: [
           {
               quality: "50x50",
               url: "..."
           },
           {
               quality: "500x500",
               url: "..."
           }
       ]
    */

    if (
        Array.isArray(song.image) &&
        song.image.length
    ) {

        const last =
            song.image[song.image.length - 1];


        if (
            last &&
            typeof last === "object"
        ) {

            return last.url || DEFAULT_IMAGE;

        }


        if (typeof last === "string") {
            return last;
        }

    }


    if (song.image_url) {
        return song.image_url;
    }


    if (
        typeof song.image === "string"
    ) {
        return song.image;
    }


    return DEFAULT_IMAGE;

}



function getArtist(song) {

    if (!song) {
        return "Unknown Artist";
    }


    if (
        song.artists &&
        Array.isArray(song.artists.primary)
    ) {

        const names =
            song.artists.primary
                .map(
                    artist =>
                        artist?.name || ""
                )
                .filter(Boolean);


        if (names.length) {
            return names.join(", ");
        }

    }


    if (song.primaryArtists) {
        return song.primaryArtists;
    }


    if (song.singers) {
        return song.singers;
    }


    if (song.artist) {
        return song.artist;
    }


    return "Unknown Artist";

}



function getAudioUrl(song) {

    if (!song) {
        return "";
    }


    if (
        Array.isArray(song.downloadUrl) &&
        song.downloadUrl.length
    ) {

       

        const sorted =
            [...song.downloadUrl]
                .sort(
                    (a, b) =>
                        extractQuality(b) -
                        extractQuality(a)
                );


        for (const item of sorted) {

            if (
                item &&
                typeof item === "object" &&
                item.url
            ) {

                return item.url;

            }

            if (
                typeof item === "string"
            ) {

                return item;

            }

        }

    }


    

    if (song.url) {
        return song.url;
    }


    return "";

}



function extractQuality(item) {

    if (
        !item ||
        typeof item !== "object"
    ) {
        return 0;
    }


    const match =
        String(item.quality || "")
            .match(/\d+/);


    return match
        ? Number(match[0])
        : 0;

}


function getAlbum(song) {

    if (!song) {
        return "Unknown Album";
    }


    if (
        song.album &&
        typeof song.album === "object"
    ) {

        return song.album.name ||
            "Unknown Album";

    }


    if (song.album) {
        return song.album;
    }


    return "Unknown Album";

}


function normalizeSong(song) {

    return {

        id:
            String(
                song.id ||
                song.songid ||
                song.e_songid ||
                crypto.randomUUID()
            ),

        title:
            song.name ||
            song.title ||
            "Unknown Song",

        artist:
            getArtist(song),

        album:
            getAlbum(song),

        image:
            getImage(song),

        audio:
            getAudioUrl(song),

        duration:
            Number(
                song.duration || 0
            ),

        language:
            song.language || "",

        year:
            song.year || "",

        albumUrl:
            song.album_url || "",

        songUrl:
            song.perma_url ||
            song.tiny_url ||
            "",

        lyrics:
            song.lyrics || ""

    };

}



function extractResults(data) {

    
    if (
        data &&
        data.data &&
        Array.isArray(data.data.results)
    ) {

        return data.data.results;

    }


  

    if (
        data &&
        Array.isArray(data.data)
    ) {

        return data.data;

    }



    if (
        data &&
        Array.isArray(data.results)
    ) {

        return data.results;

    }



    if (
        data &&
        data.data &&
        Array.isArray(data.data.songs)
    ) {

        return data.data.songs;

    }


   
    if (Array.isArray(data)) {
        return data;
    }


    return [];

}

async function searchSongs(query) {

    const cleanQuery =
        String(query || "").trim();


    if (!cleanQuery) {

        showMessage(
            "Please enter a song or artist name."
        );

        return;

    }


    showLoading(true);

    showMessage("");

    songsContainer.innerHTML = "";


    sectionTitle.textContent =
        `Results for "${cleanQuery}"`;


    resultCount.textContent =
        "Searching...";


    try {

       

        const apiURL =
            `${API_BASE}/api/search/songs?query=${encodeURIComponent(
                cleanQuery
            )}`;


        console.log(
            "MusicSpace API:",
            apiURL
        );


        const response =
            await fetch(apiURL);


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "API Response:",
            data
        );


        const results =
            extractResults(data);


        songs =
            results
                .map(normalizeSong)
                .filter(
                    song =>
                        song.title &&
                        song.audio
                );


        /*
           No results
        */

        if (!songs.length) {

            resultCount.textContent =
                "0 songs";


            showMessage(
                `No playable songs found for "${cleanQuery}".`
            );

            return;

        }


        resultCount.textContent =
            `${songs.length} songs found`;


        renderSongs(songs);


    }
    catch (error) {

        console.error(
            "MusicSpace Search Error:",
            error
        );


        songs = [];

        currentSongIndex = -1;


        resultCount.textContent =
            "Error";


        showMessage(
            "Unable to load songs. Please check the API connection and try again."
        );

    }
    finally {

        showLoading(false);

    }

}



function renderSongs(songList) {

    songsContainer.innerHTML = "";


    songList.forEach(
        (song, index) => {

            const card =
                createSongCard(
                    song,
                    index,
                    false
                );


            songsContainer.appendChild(card);

        }
    );

}



function createSongCard(
    song,
    index,
    isFavoriteCard
) {

    const card =
        document.createElement("article");


    card.className =
        "song-card";


    const isFav =
        favorites.some(
            favorite =>
                favorite.id === song.id
        );


    card.innerHTML = `

        <div class="song-card-image">

            <img
                src="${escapeHTML(song.image)}"
                alt="${escapeHTML(song.title)}"
                loading="lazy"
                onerror="this.src='${DEFAULT_IMAGE}'"
            >

            <button
                class="favorite-btn ${isFav ? "active" : ""}"
                type="button"
                aria-label="Favorite ${escapeHTML(song.title)}"
            >

                <i class="${
                    isFav
                        ? "fa-solid"
                        : "fa-regular"
                } fa-heart"></i>

            </button>


            <button
                class="card-play"
                type="button"
                aria-label="Play ${escapeHTML(song.title)}"
            >

                <i class="fa-solid fa-play"></i>

            </button>

        </div>


        <div class="song-card-info">

            <h3
                title="${escapeHTML(song.title)}"
            >
                ${escapeHTML(song.title)}
            </h3>


            <p
                title="${escapeHTML(song.artist)}"
            >
                ${escapeHTML(song.artist)}
            </p>

        </div>

    `;


   

    card.addEventListener(
        "click",
        function () {

            if (isFavoriteCard) {

                playSongObject(song);

            }
            else {

                playSong(index);

            }

        }
    );




    const playButton =
        card.querySelector(".card-play");


    playButton.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            if (isFavoriteCard) {

                playSongObject(song);

            }
            else {

                playSong(index);

            }

        }
    );



    const favoriteButton =
        card.querySelector(".favorite-btn");


    favoriteButton.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            toggleFavorite(song);

        }
    );


    return card;

}

function playSong(index) {

    if (
        index < 0 ||
        index >= songs.length
    ) {

        return;

    }


    currentSongIndex = index;


    playSongObject(
        songs[index]
    );

}


function playSongObject(song) {

    if (!song || !song.audio) {

        showMessage(
            "Audio is not available for this song."
        );

        return;

    }



    const index =
        songs.findIndex(
            item =>
                item.id === song.id
        );


    if (index !== -1) {

        currentSongIndex = index;

    }


    
    masterSongImg.src =
        song.image || DEFAULT_IMAGE;

    masterSongImg.alt =
        song.title;


    masterSongName.textContent =
        song.title;


    masterArtistName.textContent =
        song.artist;


    

    audioPlayer.src =
        song.audio;


    audioPlayer.currentTime =
        0;


    audioPlayer.load();



    const playPromise =
        audioPlayer.play();


    if (playPromise) {

        playPromise
            .then(() => {

                updatePlayButton(true);

            })
            .catch(error => {

                console.error(
                    "Playback error:",
                    error
                );


                updatePlayButton(false);


                showMessage(
                    "This song could not be played."
                );

            });

    }

}


function togglePlayPause() {

    /*
       Nothing selected
    */

    if (!audioPlayer.src) {

        if (songs.length) {

            playSong(0);

        }

        return;

    }


    if (audioPlayer.paused) {

        audioPlayer
            .play()
            .then(() => {

                updatePlayButton(true);

            })
            .catch(error => {

                console.error(
                    "Play error:",
                    error
                );

            });

    }
    else {

        audioPlayer.pause();

        updatePlayButton(false);

    }

}


function updatePlayButton(isPlaying) {

    if (isPlaying) {

        masterPlay.innerHTML =
            `<i class="fa-solid fa-pause"></i>`;

        masterPlay.setAttribute(
            "aria-label",
            "Pause"
        );

    }
    else {

        masterPlay.innerHTML =
            `<i class="fa-solid fa-play"></i>`;

        masterPlay.setAttribute(
            "aria-label",
            "Play"
        );

    }

}


function playNext() {

    if (!songs.length) {
        return;
    }


    if (
        currentSongIndex === -1
    ) {

        playSong(0);

        return;

    }


    const nextIndex =
        (currentSongIndex + 1) %
        songs.length;


    playSong(nextIndex);

}



function playPrevious() {

    if (!songs.length) {
        return;
    }


    if (
        currentSongIndex === -1
    ) {

        playSong(0);

        return;

    }


    const previousIndex =
        (
            currentSongIndex -
            1 +
            songs.length
        ) %
        songs.length;


    playSong(previousIndex);

}


function updateProgress() {

    if (!audioPlayer.duration) {

        return;

    }


    const percentage =
        (
            audioPlayer.currentTime /
            audioPlayer.duration
        ) * 100;


    myProgressBar.value =
        percentage;


    currentTimeEl.textContent =
        formatTime(
            audioPlayer.currentTime
        );


    totalTimeEl.textContent =
        formatTime(
            audioPlayer.duration
        );

}



function seekAudio() {

    if (!audioPlayer.duration) {
        return;
    }


    const percentage =
        Number(
            myProgressBar.value
        );


    audioPlayer.currentTime =
        (
            percentage / 100
        ) *
        audioPlayer.duration;

}


function updateVolume() {

    const volume =
        Number(
            volumeBar.value
        ) / 100;


    audioPlayer.volume =
        volume;


    updateVolumeIcon(volume);

}



function updateVolumeIcon(volume) {

    volumeIcon.classList.remove(
        "fa-volume-high",
        "fa-volume-low",
        "fa-volume-off"
    );


    if (volume === 0) {

        volumeIcon.classList.add(
            "fa-volume-off"
        );

    }
    else if (volume < 0.5) {

        volumeIcon.classList.add(
            "fa-volume-low"
        );

    }
    else {

        volumeIcon.classList.add(
            "fa-volume-high"
        );

    }

}



function loadFavorites() {

    try {

        const saved =
            localStorage.getItem(
                "musicspace-favorites"
            );


        return saved
            ? JSON.parse(saved)
            : [];

    }
    catch {

        return [];

    }

}




function saveFavorites() {

    localStorage.setItem(
        "musicspace-favorites",
        JSON.stringify(favorites)
    );

}


function toggleFavorite(song) {

    const index =
        favorites.findIndex(
            favorite =>
                favorite.id === song.id
        );


    if (index === -1) {

        favorites.push(song);

    }
    else {

        favorites.splice(index, 1);

    }


    saveFavorites();

    renderFavorites();

  
    if (songs.length) {

        renderSongs(songs);

    }

}




function renderFavorites() {

    favoritesContainer.innerHTML = "";


    if (!favorites.length) {

        favoriteEmpty.style.display =
            "block";

        return;

    }


    favoriteEmpty.style.display =
        "none";


    favorites.forEach(
        song => {

            const card =
                createSongCard(
                    song,
                    -1,
                    true
                );


            favoritesContainer.appendChild(card);

        }
    );

}



searchForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        searchSongs(
            searchInput.value
        );

    }
);


searchBtn.addEventListener(
    "click",
    function () {

        searchSongs(
            searchInput.value
        );

    }
);


searchInput.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            searchSongs(
                searchInput.value
            );

        }

    }
);



exploreBtn.addEventListener(
    "click",
    function () {

        searchInput.value =
            "Arijit Singh";


        searchSongs(
            "Arijit Singh"
        );


        document
            .getElementById("songs")
            .scrollIntoView({
                behavior: "smooth"
            });

    }
);



masterPlay.addEventListener(
    "click",
    togglePlayPause
);


nextBtn.addEventListener(
    "click",
    playNext
);


previousBtn.addEventListener(
    "click",
    playPrevious
);



myProgressBar.addEventListener(
    "input",
    seekAudio
);


volumeBar.addEventListener(
    "input",
    updateVolume
);





audioPlayer.addEventListener(
    "timeupdate",
    updateProgress
);




audioPlayer.addEventListener(
    "loadedmetadata",
    updateProgress
);



audioPlayer.addEventListener(
    "play",
    function () {

        updatePlayButton(true);

    }
);


audioPlayer.addEventListener(
    "pause",
    function () {

        updatePlayButton(false);

    }
);




audioPlayer.addEventListener(
    "ended",
    function () {

        playNext();

    }
);



audioPlayer.addEventListener(
    "error",
    function () {

        console.error(
            "Audio loading error."
        );


        showMessage(
            "Unable to play this audio right now."
        );


        updatePlayButton(false);

    }
);



mobileMenu.addEventListener(
    "click",
    function () {

        mobileSidebar.classList.add(
            "show"
        );

    }
);


closeMobileMenu.addEventListener(
    "click",
    function () {

        mobileSidebar.classList.remove(
            "show"
        );

    }
);




mobileSidebar
    .querySelectorAll("a")
    .forEach(
        link => {

            link.addEventListener(
                "click",
                function () {

                    mobileSidebar.classList.remove(
                        "show"
                    );

                }
            );

        }
    );



document.addEventListener(
    "click",
    function (event) {

        if (
            mobileSidebar.classList.contains("show") &&
            !mobileSidebar.contains(event.target) &&
            !mobileMenu.contains(event.target)
        ) {

            mobileSidebar.classList.remove(
                "show"
            );

        }

    }
);


renderFavorites();

updateVolumeIcon(0.8);


searchInput.value =
    "BIBA";


searchSongs("BIBA");