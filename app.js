// DOM Element Targets
const audio = document.getElementById('audio-core');
const fileUpload = document.getElementById('file-upload');
const dropZone = document.getElementById('drop-zone');
const queueList = document.getElementById('queue-list');

const playBtn = document.getElementById('btn-play');
const prevBtn = document.getElementById('btn-prev');
const nextBtn = document.getElementById('btn-next');
const seekBar = document.getElementById('seek-bar');
const volumeBar = document.getElementById('volume-bar');

const currentTimeText = document.getElementById('current-time');
const durationText = document.getElementById('total-duration');

// Multimedia Meta Display Fields
const trackArt = document.getElementById('track-art');
const trackTitle = document.getElementById('track-title');
const trackArtist = document.getElementById('track-artist');
const miniArt = document.getElementById('mini-art');
const miniTitle = document.getElementById('mini-title');
const miniArtist = document.getElementById('mini-artist');

// Local Reactive State Data
let playlist = [];
let currentIdx = 0;
let isPlaying = false;

// Random Decorative Cover Placeholders
const artworkPlaceholders = [
    "https://unsplash.com",
    "https://unsplash.com",
    "https://unsplash.com"
];

// File Pipeline Upload Operations
function handleFileQueue(files) {
    if (files.length === 0) return;
    const initialPlaylistSize = playlist.length;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Distribute alternating artwork placeholders
        const placeholderImg = artworkPlaceholders[playlist.length % artworkPlaceholders.length];
        
        playlist.push({
            title: file.name.replace(/\.[^/.]+$/, ""), 
            artist: "Local Stream Asset",
            url: URL.createObjectURL(file),
            art: placeholderImg
        });
    }

    renderQueueUI();

    if (initialPlaylistSize === 0 && playlist.length > 0) {
        currentIdx = 0;
        loadSong(currentIdx);
        playSong();
    }
}

// Render dynamic interactive Sidebar queue items
function renderQueueUI() {
    queueList.innerHTML = "";
    
    playlist.forEach((song, index) => {
        const item = document.createElement('div');
        item.classList.add('queue-item');
        if (index === currentIdx) item.classList.add('active');

        item.innerHTML = `
            <div class="queue-item-idx">${index + 1}</div>
            <div class="queue-item-details">
                <div class="queue-title truncate">${song.title}</div>
                <div class="queue-artist truncate">${song.artist}</div>
            </div>
        `;

        // Make queue tracks interactive
        item.addEventListener('click', () => {
            currentIdx = index;
            loadSong(currentIdx);
            playSong();
        });

        queueList.appendChild(item);
    });
}

// Mount selected data target index structures
function loadSong(index) {
    if (!playlist[index]) return;

    const track = playlist[index];
    audio.src = track.url;
    
    // Sync main display panel
    trackArt.src = track.art;
    trackTitle.textContent = track.title;
    trackArtist.textContent = track.artist;

    // Sync bottom control deck indicators
    miniArt.src = track.art;
    miniTitle.textContent = track.title;
    miniArtist.textContent = track.artist;

    seekBar.value = 0;
    
    // Refresh visual active indicators inside queue sidebar
    renderQueueUI();
    audio.load();
}

// Active Playback Controller Functions
function togglePlayback() {
    if (playlist.length === 0) return;
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
}

function playSong() {
    if (playlist.length === 0) return;
    isPlaying = true;
    audio.play();
    playBtn.textContent = '⏸';
    trackArt.style.transform = 'scale(1.03)';
}

function pauseSong() {
    isPlaying = false;
    audio.pause();
    playBtn.textContent = '▶';
    trackArt.style.transform = 'scale(1)';
}

function nextSong() {
    if (playlist.length <= 1) return;
    currentIdx = (currentIdx + 1) % playlist.length;
    loadSong(currentIdx);
    playSong();
}

function prevSong() {
    if (playlist.length <= 1) return;
    currentIdx = (currentIdx - 1 + playlist.length) % playlist.length;
    loadSong(currentIdx);
    playSong();
}

// Format Seconds to MM:SS string
function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// Structural Continuous Action Listeners
fileUpload.addEventListener('change', (e) => handleFileQueue(e.target.files));

dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = '#ff0000'; });
dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = '#333'; });
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#333';
    handleFileQueue(e.dataTransfer.files);
});

audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        seekBar.value = (audio.currentTime / audio.duration) * 100;
        currentTimeText.textContent = formatTime(audio.currentTime);
    }
});

audio.addEventListener('loadedmetadata', () => {
    durationText.textContent = formatTime(audio.duration);
});

seekBar.addEventListener('input', () => {
    if (audio.duration) {
        audio.currentTime = (seekBar.value / 100) * audio.duration;
    }
});

volumeBar.addEventListener('input', (e) => {
    audio.volume = e.target.value;
});

audio.addEventListener('ended', nextSong);

playBtn.addEventListener('click', togglePlayback);
nextBtn.addEventListener('click', nextSong);
prevBtn.addEventListener('click', prevSong);
