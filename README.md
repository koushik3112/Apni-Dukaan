# 🛍️ Apni Dukaan

> **A modern, responsive digital shop experience with an integrated music player.**

Apni Dukaan is a web-based project designed to create a simple, visually appealing digital **dukaan (shop)** experience while providing users with an integrated music player.

The project combines a responsive frontend with a Node.js/Express backend and is designed to be easily extendable with features such as dynamic music playlists.

---

#Site Link : https://koushik3112.github.io/Apni-Dukaan/ 

## ✨ Features

* 🛍️ Clean and modern shop-style interface
* 🎵 Integrated music player
* ▶️ Play / Pause controls
* ⏮️ Previous / Next track controls
* 🔁 Repeat Track / Repeat Playlist
* 🎶 Support for YouTube playlists
* 🖼️ Dynamic song thumbnails
* 📱 Responsive and mobile-friendly design
* 💻 Desktop and laptop optimized
* ⚡ Node.js + Express backend
* 🌐 Ready for deployment with Vercel
* 🎨 Custom background assets for PC and mobile
* 🔧 Easy-to-extend project structure

---

## 🎵 Music Player

The music player is designed to work with YouTube playlists rather than requiring individual songs to be manually hardcoded.

Users can select their preferred playlist from the playlist section.

### Example playlists

**🙏 God Songs**

```text
https://youtube.com/playlist?list=PLC_dcSpnRizY
```

**🎸 90's Songs**

```text
https://youtube.com/playlist?list=PLI05gehSC-U4
```

More playlists can be added in the future.

### Dynamic Playlist Concept

The player is designed around playlists rather than individual tracks.

For example:

```text
YouTube Playlist
       │
       ▼
┌─────────────────┐
│     Song 1      │
│     Song 2      │
│     Song 3      │
│     Song 4      │
└─────────────────┘
       │
       ▼
   Music Player
       │
       ├── ▶ Play
       ├── ⏸ Pause
       ├── ⏮ Previous
       ├── ⏭ Next
       └── 🔁 Repeat
```

If new songs are added to a configured playlist, the application can retrieve the updated playlist rather than requiring every song to be manually entered into the code.

---

## 📱 Responsive Design

Apni Dukaan is designed to work across different screen sizes.

### Supported layouts

| Device      | Support |
| ----------- | ------- |
| 📱 Mobile   | ✅       |
| 📲 Tablet   | ✅       |
| 💻 Laptop   | ✅       |
| 🖥️ Desktop | ✅       |

The interface is designed to prevent horizontal scrolling and maintain usable music-player controls on smaller screens.

---

## 🛠️ Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express.js

### Other

* YouTube playlist integration
* Vercel deployment configuration
* Responsive CSS
* Custom image assets

---

## 📂 Project Structure

```text
Apni-Dukaan/
│
├── 📄 app.js
├── 📄 server.js
├── 📄 index.html
├── 📄 styles.css
│
├── 🖼️ background_pc.png
├── 🖼️ background_mobile.png
│
├── 📄 package.json
├── 📄 package-lock.json
├── 📄 vercel.json
│
└── 📄 README.md
```

### Important Files

| File                    | Purpose                                |
| ----------------------- | -------------------------------------- |
| `app.js`                | Application logic / configuration      |
| `server.js`             | Express server                         |
| `index.html`            | Main frontend page                     |
| `styles.css`            | Website styling and responsive design  |
| `package.json`          | Dependencies and project configuration |
| `vercel.json`           | Vercel deployment configuration        |
| `background_pc.png`     | Desktop background                     |
| `background_mobile.png` | Mobile background                      |

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/koushik3112/Apni-Dukaan.git
```

### 2. Navigate into the project

```bash
cd Apni-Dukaan
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the application

```bash
node server.js
```

Depending on the project's current configuration, you can also use the available npm scripts:

```bash
npm start
```

### 5. Open in your browser

Open the local URL shown by the terminal, commonly:

```text
http://localhost:3000
```

---

## 🎵 Adding / Changing Playlists

The playlist configuration should be kept in the designated playlist section of the application.

Look for the clearly marked section similar to:

```javascript
// ==========================================
// YOUTUBE PLAYLIST CONFIGURATION
// ==========================================
```

This is where available playlists can be added or changed.

Example:

```javascript
const playlists = {
    godSongs: "YOUR_GOD_SONG_PLAYLIST_URL",
    ninetiesSongs: "YOUR_90S_PLAYLIST_URL"
};
```

> **Important:** The exact configuration may differ depending on the current implementation. Follow the playlist configuration already present in `app.js`.

Users can then select their preferred playlist through the **Repeat Track/Playlist** section of the music player.

---

## 🔁 Repeat Track / Playlist

The music player provides repeat functionality.

### Repeat Track

Repeats the currently playing song.

```text
Song A
 ↓
Song A
 ↓
Song A
 ↓
...
```

### Repeat Playlist

Continues through the selected playlist and starts again from the beginning after the final track.

```text
Song A
 ↓
Song B
 ↓
Song C
 ↓
Song A
 ↓
...
```

### Playlist Selection

The same section also provides access to the available playlists.

```text
Repeat Track / Playlist
│
├── 🔂 Repeat Track
├── 🔁 Repeat Playlist
│
└── 🎵 Playlists
    ├── 🙏 God Songs
    └── 🎸 90's Songs
```

---

## 🖼️ Dynamic Song Information

When the current song changes, the music player is intended to update the displayed information accordingly.

This includes:

* Song title
* Current track
* Thumbnail
* Playback state

The thumbnail should correspond to the currently playing YouTube video rather than using one static image for every track.

---

## 📱 Mobile Experience

The application is designed with mobile users in mind.

The music player should remain accessible and usable on smaller screens, including:

* Touch-friendly controls
* Responsive thumbnails
* Flexible layouts
* Properly sized text
* Responsive playlist menus
* No unnecessary horizontal scrolling

---

## 🌐 Deployment

The repository includes a `vercel.json` configuration file, making the project suitable for deployment on **Vercel**.

Typical deployment flow:

```text
GitHub Repository
       │
       ▼
     Vercel
       │
       ▼
   Apni Dukaan
       │
       ▼
    Live Website
```

---

## 🔐 Environment Variables

If future versions of the project require API keys or other private credentials, store them using environment variables rather than directly inside frontend code.

Example:

```env
YOUTUBE_API_KEY=your_api_key_here
```

Never commit sensitive credentials to GitHub.

Add the relevant environment files to `.gitignore`.

---

## 🔮 Future Improvements

Possible future additions include:

* 🎵 More YouTube playlists
* ❤️ Favorite songs
* 📋 Custom user playlists
* 🔍 Song search
* 🎚️ Volume control
* 🔊 Equalizer
* ⏱️ Sleep timer
* 💾 Remember user's selected playlist
* 🌙 Dark / light mode
* 🎨 More shop customization
* 👤 User accounts
* ☁️ Cloud-based playlist storage
* 📊 Listening history
* 📱 Progressive Web App (PWA) support

---

## 🧑‍💻 Development

This project is continuously being developed and improved.

When adding new functionality:

1. Understand the existing architecture.
2. Avoid unnecessarily rewriting existing code.
3. Preserve the current UI.
4. Keep the application responsive.
5. Test both desktop and mobile layouts.
6. Check the browser console for errors.
7. Test music playback after player-related changes.

---

## ⚠️ Important Notes

Apni Dukaan uses YouTube-based music content.

The availability and playback of individual videos depend on YouTube and the respective video's availability, privacy settings, geographic restrictions, and other platform limitations.

The application should gracefully handle unavailable or deleted videos rather than crashing.

---

## 📜 License

This project is currently intended as a personal/development project.

If you plan to distribute or commercialize the project, add an appropriate open-source or proprietary license here.

---

## 👨‍💻 Author

**Koushik Prasad**

GitHub:

[@koushik3112](https://github.com/koushik3112?utm_source=chatgpt.com)

Project:

[Apni Dukaan — GitHub Repository](https://github.com/koushik3112/Apni-Dukaan?utm_source=chatgpt.com)

---

## ⭐ Support

If you find the project interesting, consider giving the repository a ⭐ on GitHub.

---

### 🛍️ Apni Dukaan

**A digital dukaan with your own music. 🎵**
