/* ==================================================
   YOUTUBE PLAYLIST CONFIGURATION
   Add or change available playlists here
   ================================================== */
const YOUTUBE_PLAYLIST_CONFIG = {
  godSongs: {
    id: "godSongs",
    name: "🎵 God Songs",
    url: "https://youtube.com/playlist?list=PLC_dcSpnRizY&si=La1UGYIUYuLD72G0"
  },
  ninetiesSongs: {
    id: "ninetiesSongs",
    name: "📻 90's Songs",
    url: "https://youtube.com/playlist?list=PLI05gehSC-U4&si=wUY6b2vEe3etGXa5"
  }
};

/**
 * Extracts YouTube playlist ID from a full playlist URL or raw ID string.
 */
function extractPlaylistId(urlOrId) {
  if (!urlOrId) return "PLC_dcSpnRizY";
  if (urlOrId.includes('list=')) {
    const match = urlOrId.match(/[?&]list=([^&]+)/);
    return match ? match[1] : urlOrId;
  }
  return urlOrId;
}

/* ==========================================
   PLAYLIST MUSIC DATA / MODES
   ========================================== */
const PLAYLISTS = {
  devotional: {
    name: "Devotional Mode",
    youtubePlaylistId: extractPlaylistId(YOUTUBE_PLAYLIST_CONFIG.godSongs.url),
    albumArt: "devotional_art.jpg",
    themeClass: "devotional",
    accentColor: "#f97316",
    glowColor: "rgba(249, 115, 22, 0.4)"
  },
  hits90s: {
    name: "90s + Modern Mix",
    youtubePlaylistId: extractPlaylistId(YOUTUBE_PLAYLIST_CONFIG.ninetiesSongs.url),
    albumArt: "hits90s_art.jpg",
    themeClass: "hits90s",
    accentColor: "#06b6d4",
    glowColor: "rgba(6, 182, 212, 0.4)"
  },
  modern: {
    name: "Modern & GenZ Mix",
    youtubePlaylistId: extractPlaylistId(YOUTUBE_PLAYLIST_CONFIG.ninetiesSongs.url),
    albumArt: "modern_art.jpg",
    themeClass: "modern",
    accentColor: "#d946ef",
    glowColor: "rgba(217, 70, 239, 0.4)"
  }
};

/* ==========================================
   DOM ELEMENTS OBJECT
   ========================================== */
const DOM = {
  wish: document.getElementById('wish'),
  timeHrs: document.getElementById('hrs'),
  timeAmPm: document.getElementById('am-pm'),
  diyaWidget: document.getElementById('diya-widget'),
  albumArt: document.getElementById('album-art'),
  albumArtFallback: document.getElementById('album-art-fallback'),
  trackTitle: document.getElementById('track-title'),
  trackArtist: document.getElementById('track-artist'),

  seekbarContainer: document.getElementById('seekbar-container'),
  seekbarFill: document.getElementById('seekbar-fill'),
  seekbarHandle: document.getElementById('seekbar-handle'),
  currentTimeTxt: document.getElementById('current-time'),
  durationTxt: document.getElementById('track-duration'),

  modes: {
    devotional: document.getElementById('mode-devotional'),
    hits90s: document.getElementById('mode-hits90s'),
    modern: document.getElementById('mode-modern')
  },

  playPauseBtn: document.getElementById('ctrl-play-pause'),
  playIcon: document.getElementById('play-icon'),
  prevBtn: document.getElementById('ctrl-prev'),
  nextBtn: document.getElementById('ctrl-next'),
  shuffleBtn: document.getElementById('ctrl-shuffle'),
  repeatBtn: document.getElementById('ctrl-repeat'),

  schedulerBadge: document.getElementById('scheduler-badge'),
  schedulerBadgeText: document.getElementById('scheduler-badge-text'),

  playlistDrawer: document.getElementById('playlist-drawer'),
  playlistCloseBtn: document.getElementById('playlist-close-btn'),
  playlistCategories: document.getElementById('playlist-categories'),
  playlistItems: document.getElementById('playlist-items'),

  repeatModeBtns: {
    none: document.getElementById('btn-repeat-none'),
    track: document.getElementById('btn-repeat-track'),
    playlist: document.getElementById('btn-repeat-playlist')
  }
};

/* ==========================================
   PLAYER & REPEAT STATE
   ========================================== */
let currentMode = 'devotional';
let currentPlaylistKey = 'godSongs';
let currentTrackIndex = 0;
let isPlaying = false;
let isShuffle = false;
let repeatMode = 'playlist'; // 'none' | 'track' | 'playlist'
let isDraggingSeekbar = false;
let isAutoSchedule = true;
let youtubePlayer = null;
let youtubeReady = false;
let pendingPlay = false;

// Array of loaded track objects: [{ id, title, author, thumbnail }]
let currentPlaylistTracks = [];

/* ==========================================
   TIME & WISH GREETING LOGIC (IST)
   ========================================== */
function getISTDate() {
  const now = new Date();
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const utcMs = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
  return new Date(utcMs + IST_OFFSET_MS);
}

function updateClockAndWish() {
  const now = getISTDate();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  let wishText;
  if (hours >= 5 && hours < 12) {
    wishText = "🌅 Good Morning";
  } else if (hours >= 12 && hours < 17) {
    wishText = "☀️ Good Afternoon";
  } else if (hours >= 17 && hours < 21) {
    wishText = "🌆 Good Evening";
  } else {
    wishText = "🌙 Good Night";
  }

  let displayHours = hours % 12;
  displayHours = displayHours ? displayHours : 12;
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

  if (DOM.wish) DOM.wish.textContent = wishText;
  if (DOM.timeHrs) DOM.timeHrs.textContent = `${displayHours}:${formattedMinutes}`;
  if (DOM.timeAmPm) DOM.timeAmPm.textContent = ampm;
}

/* ==========================================
   AUTO-SCHEDULER ENGINE
   ========================================== */
function checkTimeSchedule() {
  if (!isAutoSchedule) return;

  const now = getISTDate();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentDecimalTime = hours + minutes / 60;

  let scheduledMode = 'modern';

  if ((currentDecimalTime >= 7.0 && currentDecimalTime < 11.0) ||
      (currentDecimalTime >= 17.75 && currentDecimalTime < 18.75)) {
    scheduledMode = 'devotional';
  } else if (currentDecimalTime >= 11.0 && currentDecimalTime < 17.75) {
    scheduledMode = 'hits90s';
  } else {
    scheduledMode = 'modern';
  }

  if (scheduledMode !== currentMode) {
    selectPlaylistMode(scheduledMode, false);
  }
}

if (DOM.schedulerBadge) {
  DOM.schedulerBadge.addEventListener('click', () => {
    isAutoSchedule = !isAutoSchedule;

    if (isAutoSchedule) {
      DOM.schedulerBadge.classList.remove('manual');
      DOM.schedulerBadgeText.textContent = "Auto Mode: ON";
      checkTimeSchedule();
    } else {
      DOM.schedulerBadge.classList.add('manual');
      DOM.schedulerBadgeText.textContent = "Auto Mode: OFF";
    }
  });
}

/* ==========================================
   PLAYLIST & THEME CONTROL
   ========================================== */
function selectPlaylistMode(mode, userOverridden = false) {
  if (userOverridden) {
    if (isAutoSchedule) {
      isAutoSchedule = false;
      if (DOM.schedulerBadge) {
        DOM.schedulerBadge.classList.add('manual');
        DOM.schedulerBadgeText.textContent = "Auto Mode: OFF";
      }
    }
  }

  currentMode = mode;
  currentTrackIndex = 0;

  Object.keys(DOM.modes).forEach(key => {
    if (DOM.modes[key]) {
      DOM.modes[key].classList.toggle('active', key === mode);
    }
  });

  if (DOM.diyaWidget) {
    DOM.diyaWidget.classList.toggle('visible', mode === 'devotional');
  }

  const playlistConfig = PLAYLISTS[mode];
  document.documentElement.style.setProperty('--theme-accent-color', playlistConfig.accentColor);
  document.documentElement.style.setProperty('--theme-glow-color', playlistConfig.glowColor);

  fetchAndLoadPlaylist(playlistConfig.youtubePlaylistId, 0, isPlaying);
}

if (DOM.modes.devotional) DOM.modes.devotional.addEventListener('click', () => selectPlaylistMode('devotional', true));
if (DOM.modes.hits90s) DOM.modes.hits90s.addEventListener('click', () => selectPlaylistMode('hits90s', true));
if (DOM.modes.modern) DOM.modes.modern.addEventListener('click', () => selectPlaylistMode('modern', true));

/* ==========================================
   DYNAMIC PLAYLIST FETCHING (RSS / API / PROXY)
   ========================================== */
async function fetchPlaylistTracks(playlistIdOrUrl) {
  const playlistId = extractPlaylistId(playlistIdOrUrl);

  // 1. Try local Express API first
  try {
    const res = await fetch(`/api/playlist?id=${playlistId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.tracks) && data.tracks.length > 0) {
        return data.tracks;
      }
    }
  } catch (e) {
    console.warn('Local Express API unavailable, trying CORS proxy fallback...');
  }

  // 2. Fallback to public CORS proxy for static/standalone deployment
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;
    const res = await fetch(proxyUrl);
    if (res.ok) {
      const xmlText = await res.text();
      const tracks = [];
      const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
      let match;
      while ((match = entryRegex.exec(xmlText)) !== null) {
        const block = match[1];
        const idM = block.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
        const titleM = block.match(/<title>(.*?)<\/title>/);
        const authorM = block.match(/<name>(.*?)<\/name>/);
        if (idM && idM[1]) {
          const vId = idM[1].trim();
          tracks.push({
            id: vId,
            title: titleM ? titleM[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim() : 'YouTube Song',
            author: authorM ? authorM[1].trim() : 'YouTube Music',
            thumbnail: `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`
          });
        }
      }
      if (tracks.length > 0) return tracks;
    }
  } catch (e) {
    console.warn('CORS proxy fetch failed:', e);
  }

  // 3. Fallback items
  return [
    { id: '78zRUb3zZtY', title: 'Bollywood Love Rewind 💫 Evergreen Romantic Songs', author: '9xmEra', thumbnail: 'https://i.ytimg.com/vi/78zRUb3zZtY/hqdefault.jpg' },
    { id: 'mDqooripK-o', title: '2000s Bollywood Hits | Audio Jukebox', author: 'YRF Music', thumbnail: 'https://i.ytimg.com/vi/mDqooripK-o/hqdefault.jpg' },
    { id: 'cYatYLzx9hA', title: 'Top Favourites on YouTube - Volume 1', author: 'YRF Music', thumbnail: 'https://i.ytimg.com/vi/cYatYLzx9hA/hqdefault.jpg' }
  ];
}

async function fetchAndLoadPlaylist(playlistIdOrUrl, index = 0, shouldPlay = false) {
  if (DOM.trackTitle) DOM.trackTitle.textContent = 'Loading playlist songs...';
  if (DOM.trackArtist) DOM.trackArtist.textContent = 'Please wait';

  currentPlaylistTracks = await fetchPlaylistTracks(playlistIdOrUrl);
  currentTrackIndex = Math.max(0, Math.min(index, currentPlaylistTracks.length - 1));

  renderPlaylistCategories();
  renderPlaylistItems();
  loadTrack(currentTrackIndex, shouldPlay);
}

function renderPlaylistCategories() {
  if (!DOM.playlistCategories) return;
  DOM.playlistCategories.innerHTML = '';

  Object.keys(YOUTUBE_PLAYLIST_CONFIG).forEach(key => {
    const pl = YOUTUBE_PLAYLIST_CONFIG[key];
    const btn = document.createElement('button');
    btn.className = `playlist-cat-btn ${key === currentPlaylistKey ? 'active' : ''}`;
    btn.innerHTML = pl.name;

    btn.addEventListener('click', () => {
      if (currentPlaylistKey === key) return;
      currentPlaylistKey = key;
      renderPlaylistCategories();
      fetchAndLoadPlaylist(pl.url, 0, true);
    });

    DOM.playlistCategories.appendChild(btn);
  });
}

function renderPlaylistItems() {
  if (!DOM.playlistItems) return;
  DOM.playlistItems.innerHTML = '';

  if (currentPlaylistTracks.length === 0) {
    DOM.playlistItems.innerHTML = '<div class="playlist-error">No songs found in playlist</div>';
    return;
  }

  currentPlaylistTracks.forEach((track, index) => {
    const item = document.createElement('div');
    item.className = `playlist-item ${index === currentTrackIndex ? 'active' : ''}`;
    item.dataset.index = index;

    item.innerHTML = `
      <img src="${track.thumbnail}" alt="Thumbnail" class="playlist-item-thumb" onerror="this.src=''">
      <div class="playlist-item-info">
        <span class="playlist-item-title">${track.title}</span>
        <span class="playlist-item-index">Track #${index + 1} • ${track.author}</span>
      </div>
      <div class="playlist-item-playing-icon">
        <i class="fa-solid fa-volume-high"></i>
      </div>
    `;

    item.addEventListener('click', () => {
      loadTrack(index, true);
    });

    DOM.playlistItems.appendChild(item);
  });
}

function updatePlaylistHighlight() {
  if (!DOM.playlistItems) return;
  const items = DOM.playlistItems.querySelectorAll('.playlist-item');
  items.forEach((item, idx) => {
    item.classList.toggle('active', idx === currentTrackIndex);
  });
}

/* ==========================================
   YOUTUBE IFRAME PLAYER ENGINE
   ========================================== */
function loadYouTubeIframeAPI() {
  window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
  if (window.YT && window.YT.Player) {
    onYouTubeIframeAPIReady();
    return;
  }
  if (document.getElementById('youtube-iframe-api')) return;
  const script = document.createElement('script');
  script.id = 'youtube-iframe-api';
  script.src = 'https://www.youtube.com/iframe_api';
  script.async = true;
  document.head.appendChild(script);
}

function onYouTubeIframeAPIReady() {
  if (youtubePlayer) return;
  const firstVideoId = currentPlaylistTracks.length > 0 ? currentPlaylistTracks[0].id : '78zRUb3zZtY';
  youtubePlayer = new YT.Player('youtube-player', {
    width: '200', height: '200',
    videoId: firstVideoId,
    playerVars: {
      autoplay: 0,
      controls: 0,
      playsinline: 1,
      rel: 0,
      enablejsapi: 1
    },
    events: {
      onReady: onYouTubeReady,
      onStateChange: onYouTubeStateChange,
      onError: onYouTubeError,
      onAutoplayBlocked: onYouTubeAutoplayBlocked
    }
  });
}

function onYouTubeReady() {
  youtubeReady = true;
  if (typeof youtubePlayer.unMute === 'function') youtubePlayer.unMute();
  if (typeof youtubePlayer.setVolume === 'function') youtubePlayer.setVolume(100);

  if (pendingPlay && currentPlaylistTracks[currentTrackIndex]) {
    loadTrack(currentTrackIndex, true);
  }
}

function loadTrack(index = 0, autoPlay = false) {
  if (!currentPlaylistTracks || currentPlaylistTracks.length === 0) return;
  
  currentTrackIndex = (index + currentPlaylistTracks.length) % currentPlaylistTracks.length;
  const track = currentPlaylistTracks[currentTrackIndex];
  if (!track) return;

  if (DOM.trackTitle) DOM.trackTitle.textContent = track.title;
  if (DOM.trackArtist) DOM.trackArtist.textContent = track.author;

  if (DOM.albumArt) {
    DOM.albumArt.onerror = () => {
      DOM.albumArt.onerror = null;
      DOM.albumArt.src = '';
      if (DOM.albumArtFallback) DOM.albumArtFallback.classList.add('visible');
    };
    DOM.albumArt.src = track.thumbnail;
    if (DOM.albumArtFallback) DOM.albumArtFallback.classList.remove('visible');
  }

  updatePlaylistHighlight();
  updateProgressUI(0, 0);

  if (youtubeReady && youtubePlayer) {
    try {
      if (typeof youtubePlayer.unMute === 'function') youtubePlayer.unMute();
      if (typeof youtubePlayer.setVolume === 'function') youtubePlayer.setVolume(100);

      if (autoPlay || isPlaying) {
        isPlaying = true;
        pendingPlay = false;
        if (DOM.playIcon) DOM.playIcon.className = 'fa-solid fa-pause';
        if (DOM.albumArt) DOM.albumArt.classList.add('playing');
        youtubePlayer.loadVideoById(track.id);
      } else {
        youtubePlayer.cueVideoById(track.id);
      }
    } catch (e) {
      console.warn('YouTube loadVideoById warning:', e);
    }
  } else {
    pendingPlay = autoPlay;
  }
}

function playAudio() {
  if (!youtubeReady || !youtubePlayer) {
    isPlaying = true;
    pendingPlay = true;
    if (DOM.playIcon) DOM.playIcon.className = 'fa-solid fa-pause';
    return;
  }
  isPlaying = true;
  pendingPlay = false;
  if (DOM.playIcon) DOM.playIcon.className = 'fa-solid fa-pause';
  if (DOM.albumArt) DOM.albumArt.classList.add('playing');

  try {
    if (typeof youtubePlayer.unMute === 'function') youtubePlayer.unMute();
    if (typeof youtubePlayer.setVolume === 'function') youtubePlayer.setVolume(100);

    const state = youtubePlayer.getPlayerState ? youtubePlayer.getPlayerState() : -1;
    if (state === -1 || state === 5 || state === 2) {
      const currentTrack = currentPlaylistTracks[currentTrackIndex];
      if (currentTrack) youtubePlayer.loadVideoById(currentTrack.id);
    } else {
      youtubePlayer.playVideo();
    }
  } catch (e) {
    console.error('playVideo error:', e);
  }
}

function pauseAudio() {
  isPlaying = false;
  pendingPlay = false;
  if (DOM.playIcon) DOM.playIcon.className = 'fa-solid fa-play';
  if (DOM.albumArt) DOM.albumArt.classList.remove('playing');
  if (youtubePlayer && youtubeReady && typeof youtubePlayer.pauseVideo === 'function') {
    youtubePlayer.pauseVideo();
  }
}

function togglePlay() {
  if (isPlaying) pauseAudio();
  else playAudio();
}

function prevTrack() {
  if (isShuffle && currentPlaylistTracks.length > 1) {
    let nextIdx = Math.floor(Math.random() * currentPlaylistTracks.length);
    loadTrack(nextIdx, isPlaying);
  } else {
    loadTrack(currentTrackIndex - 1, isPlaying);
  }
}

function nextTrack() {
  if (isShuffle && currentPlaylistTracks.length > 1) {
    let nextIdx = Math.floor(Math.random() * currentPlaylistTracks.length);
    loadTrack(nextIdx, isPlaying);
  } else {
    loadTrack(currentTrackIndex + 1, isPlaying);
  }
}

function setRepeatMode(mode) {
  repeatMode = mode;
  Object.keys(DOM.repeatModeBtns).forEach(key => {
    if (DOM.repeatModeBtns[key]) {
      DOM.repeatModeBtns[key].classList.toggle('active', key === mode);
    }
  });

  if (DOM.repeatBtn) {
    DOM.repeatBtn.classList.toggle('active', mode !== 'none');
  }
}

function onYouTubeStateChange(event) {
  if (!youtubePlayer) return;
  if (event.data === YT.PlayerState.PLAYING) {
    isPlaying = true;
    pendingPlay = false;
    if (DOM.playIcon) DOM.playIcon.className = 'fa-solid fa-pause';
    if (DOM.albumArt) DOM.albumArt.classList.add('playing');
  } else if (event.data === YT.PlayerState.PAUSED) {
    isPlaying = false;
    if (DOM.playIcon) DOM.playIcon.className = 'fa-solid fa-play';
    if (DOM.albumArt) DOM.albumArt.classList.remove('playing');
  } else if (event.data === YT.PlayerState.ENDED) {
    if (repeatMode === 'track') {
      loadTrack(currentTrackIndex, true);
    } else if (repeatMode === 'playlist') {
      nextTrack();
    } else { // 'none'
      if (currentTrackIndex < currentPlaylistTracks.length - 1) {
        nextTrack();
      } else {
        pauseAudio();
      }
    }
  } else if (event.data === YT.PlayerState.CUED) {
    updateProgressUI(0, youtubePlayer.getDuration ? youtubePlayer.getDuration() : 0);
    if (pendingPlay) {
      pendingPlay = false;
      playAudio();
    }
  }
}

function onYouTubeAutoplayBlocked() {
  console.warn('YouTube autoplay blocked. Press Play.');
  isPlaying = false;
  pendingPlay = false;
  if (DOM.playIcon) DOM.playIcon.className = 'fa-solid fa-play';
  if (DOM.albumArt) DOM.albumArt.classList.remove('playing');
}

function onYouTubeError(event) {
  console.error('YouTube error code:', event.data);
  isPlaying = false;
  if (DOM.playIcon) DOM.playIcon.className = 'fa-solid fa-play';
  if (DOM.albumArt) DOM.albumArt.classList.remove('playing');
  
  if (event.data === 100 || event.data === 101 || event.data === 150) {
    if (DOM.trackTitle) DOM.trackTitle.textContent = 'Video restricted by YouTube. Skipping...';
    setTimeout(() => nextTrack(), 1500);
  }
}

loadYouTubeIframeAPI();

/* ==========================================
   REPEAT & PLAYLIST DRAWER CONTROLS
   ========================================== */
if (DOM.repeatBtn) {
  DOM.repeatBtn.addEventListener('click', () => {
    if (DOM.playlistDrawer) {
      const isOpen = DOM.playlistDrawer.classList.contains('open');
      DOM.playlistDrawer.classList.toggle('open', !isOpen);
      DOM.repeatBtn.classList.toggle('active', !isOpen || repeatMode !== 'none');
    }
  });
}

if (DOM.playlistCloseBtn) {
  DOM.playlistCloseBtn.addEventListener('click', () => {
    if (DOM.playlistDrawer) {
      DOM.playlistDrawer.classList.remove('open');
      if (DOM.repeatBtn) DOM.repeatBtn.classList.toggle('active', repeatMode !== 'none');
    }
  });
}

// Attach Repeat Mode Selector Listeners
if (DOM.repeatModeBtns.none) {
  DOM.repeatModeBtns.none.addEventListener('click', () => setRepeatMode('none'));
}
if (DOM.repeatModeBtns.track) {
  DOM.repeatModeBtns.track.addEventListener('click', () => setRepeatMode('track'));
}
if (DOM.repeatModeBtns.playlist) {
  DOM.repeatModeBtns.playlist.addEventListener('click', () => setRepeatMode('playlist'));
}

if (DOM.shuffleBtn) {
  DOM.shuffleBtn.addEventListener('click', () => {
    isShuffle = !isShuffle;
    DOM.shuffleBtn.classList.toggle('active', isShuffle);
  });
}

if (DOM.playPauseBtn) DOM.playPauseBtn.addEventListener('click', togglePlay);
if (DOM.prevBtn) DOM.prevBtn.addEventListener('click', prevTrack);
if (DOM.nextBtn) DOM.nextBtn.addEventListener('click', nextTrack);

/* ==========================================
   SEEKBAR PROGRESS & DRAG CONTROL
   ========================================== */
function formatTime(secs) {
  if (isNaN(secs) || !isFinite(secs)) return "0:00";
  const minutes = Math.floor(secs / 60);
  const seconds = Math.floor(secs % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function updateProgressUI(currentTime, duration) {
  const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  if (DOM.seekbarFill) DOM.seekbarFill.style.width = `${percentage}%`;
  if (DOM.seekbarHandle) DOM.seekbarHandle.style.left = `${percentage}%`;

  if (DOM.seekbarContainer) {
    DOM.seekbarContainer.setAttribute('aria-valuenow', Math.round(percentage));
  }

  if (DOM.currentTimeTxt) DOM.currentTimeTxt.textContent = formatTime(currentTime);
  if (DOM.durationTxt) DOM.durationTxt.textContent = formatTime(duration);
}

function updateYouTubeProgress() {
  if (!youtubePlayer || !youtubeReady || isDraggingSeekbar) return;

  const duration = youtubePlayer.getDuration ? youtubePlayer.getDuration() : 0;
  const currentTime = youtubePlayer.getCurrentTime ? youtubePlayer.getCurrentTime() : 0;
  updateProgressUI(currentTime, duration);
}

setInterval(updateYouTubeProgress, 250);

function getClickProgressPercentage(e) {
  const rect = DOM.seekbarContainer.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  let offsetX = clientX - rect.left;
  offsetX = Math.max(0, Math.min(offsetX, rect.width));
  return offsetX / rect.width;
}

function handleSeekbarAction(e) {
  const percentage = getClickProgressPercentage(e);
  if (!youtubePlayer || !youtubePlayer.getDuration) return;

  const duration = youtubePlayer.getDuration();
  if (duration > 0) {
    youtubePlayer.seekTo(percentage * duration, true);
    updateProgressUI(percentage * duration, duration);
  }
}

if (DOM.seekbarContainer) {
  DOM.seekbarContainer.addEventListener('mousedown', (e) => {
    isDraggingSeekbar = true;
    handleSeekbarAction(e);

    const onMouseMove = (moveEvent) => {
      if (!isDraggingSeekbar || !youtubePlayer) return;
      const percentage = getClickProgressPercentage(moveEvent);
      const duration = youtubePlayer.getDuration ? youtubePlayer.getDuration() : 0;
      if (duration > 0) updateProgressUI(percentage * duration, duration);
    };

    const onMouseUp = (upEvent) => {
      if (isDraggingSeekbar) {
        isDraggingSeekbar = false;
        handleSeekbarAction(upEvent);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  DOM.seekbarContainer.addEventListener('touchstart', (e) => {
    isDraggingSeekbar = true;
    handleSeekbarAction(e);

    const onTouchMove = (moveEvent) => {
      if (!isDraggingSeekbar || !youtubePlayer) return;
      const percentage = getClickProgressPercentage(moveEvent);
      const duration = youtubePlayer.getDuration ? youtubePlayer.getDuration() : 0;
      if (duration > 0) updateProgressUI(percentage * duration, duration);
    };

    const onTouchEnd = (endEvent) => {
      if (isDraggingSeekbar) {
        isDraggingSeekbar = false;
        if (endEvent.changedTouches && endEvent.changedTouches.length) {
          handleSeekbarAction({ touches: endEvent.changedTouches });
        }
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
      }
    };

    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onTouchEnd);
  });

  DOM.seekbarContainer.addEventListener('keydown', (e) => {
    if (!youtubePlayer || !youtubePlayer.getDuration) return;
    const duration = youtubePlayer.getDuration();
    if (!duration) return;

    const currentTime = youtubePlayer.getCurrentTime();
    const step = 5;

    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      youtubePlayer.seekTo(Math.min(duration, currentTime + step), true);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      youtubePlayer.seekTo(Math.max(0, currentTime - step), true);
    }
  });
}

/* ==========================================
   INITIALIZATION
   ========================================== */
updateClockAndWish();
setInterval(updateClockAndWish, 1000);
checkTimeSchedule();
selectPlaylistMode(currentMode, false);
setInterval(checkTimeSchedule, 30000);
