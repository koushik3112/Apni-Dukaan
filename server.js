const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================================================
// YOUTUBE PLAYLIST CONFIGURATION
// Add or change available playlists here
// ==================================================
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

// Enable CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Serve static frontend files
app.use(express.static(__dirname));

// API endpoint to return available configured playlists
app.get('/api/playlists', (req, res) => {
  res.json({ success: true, playlists: YOUTUBE_PLAYLIST_CONFIG });
});

/**
 * Helper to parse XML RSS feed from YouTube into JSON track list
 */
function parseYouTubeFeedXML(xmlText) {
  const tracks = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xmlText)) !== null) {
    const entryBlock = match[1];
    const idMatch = entryBlock.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
    const titleMatch = entryBlock.match(/<title>(.*?)<\/title>/);
    const authorMatch = entryBlock.match(/<name>(.*?)<\/name>/);

    if (idMatch && idMatch[1]) {
      const videoId = idMatch[1].trim();
      const title = titleMatch ? titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim() : 'YouTube Track';
      const author = authorMatch ? authorMatch[1].trim() : 'YouTube Music';

      tracks.push({
        id: videoId,
        title: title,
        author: author,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
      });
    }
  }
  return tracks;
}

// API endpoint to fetch YouTube playlist tracks dynamically
app.get('/api/playlist', async (req, res) => {
  const playlistParam = req.query.id || req.query.url || 'PLI05gehSC-U4';
  
  // Extract playlist ID
  let playlistId = playlistParam;
  if (playlistParam.includes('list=')) {
    const m = playlistParam.match(/[?&]list=([^&]+)/);
    if (m) playlistId = m[1];
  }

  const feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;

  try {
    const response = await fetch(feedUrl);
    if (!response.ok) {
      throw new Error(`YouTube RSS returned status ${response.status}`);
    }
    const xmlText = await response.text();
    const tracks = parseYouTubeFeedXML(xmlText);
    res.json({ success: true, playlistId, count: tracks.length, tracks });
  } catch (err) {
    console.error('Error fetching playlist feed:', err.message);
    res.status(500).json({ success: false, error: err.message, tracks: [] });
  }
});

// Start Express server locally or export for Vercel serverless function
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🎵 Apni Dukaan Music Player Server running on port ${PORT}`);
    console.log(`👉 Open http://localhost:${PORT} in your browser`);
    console.log(`==================================================`);
  });
}

module.exports = app;
