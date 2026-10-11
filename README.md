# Gift Site

A small gift website built with **React + Vite**. The recipient taps a wrapped
gift, it opens with confetti and fireworks, the message types itself out, and a
music player (with a live visualizer) plays your song.

Effects: animated aurora background, twinkling stars and floating hearts,
shaking/opening gift with light rays, confetti, fireworks, sparkle trail that
follows the cursor, 3D tilt card, typewriter message, audio visualizer.

---

## Fastest way: just open it

Open **`standalone/index.html`** in your browser (double-click it). It is the
whole site in one file, no install needed.

> The fonts load from Google Fonts, so use an internet connection for the
> nicest look. Without internet it still works with fallback fonts.

Note: after you edit the code, rebuild this file with `npm run build:single`
(see below).

---

## Run the React project (to edit it)

You need [Node.js](https://nodejs.org) (version 18 or newer).

```bash
cd gift-site
npm install          # first time only
npm run dev          # opens a local site, usually http://localhost:5173
```

Other commands:

| Command               | What it does                                                  |
| --------------------- | ------------------------------------------------------------- |
| `npm run dev`         | Live development server (changes show instantly)              |
| `npm run build`       | Production build into `dist/` (upload to any static hosting)  |
| `npm run build:single`| One-file build into `standalone/index.html` (double-click it) |
| `npm run preview`     | Preview the `dist/` build locally                             |

---

## Make it yours

### 1. Words, name and title
Open **`src/config.js`**. Change `recipient`, `title`, the `messages` list and
the `signature`. Each message is typed out one after another.

### 2. Your song
Copy your song into the **`public/`** folder and name it `song.mp3`
(or change `song.file` in `src/config.js`). Fill in `song.title` and
`song.artist`.

If no `song.mp3` is found, a built-in gentle melody plays instead, so the page
always has music.

With `npm run build:single`, the song is copied next to `standalone/index.html`
(in the same folder). Keep the two together when you share them.

### 3. Colors and look
Open **`src/styles.css`**. The colors are at the top, in `:root`
(`--rose`, `--gold`, `--teal`, `--violet`, `--bg-1`...).

---

## How to share it

- **Easiest:** send the whole `standalone` folder (zip it). The person opens
  `index.html`.
- **A real link:** run `npm run build`, then upload the `dist/` folder to
  Netlify (drag and drop at app.netlify.com/drop), Vercel, or GitHub Pages.

## Project structure

```
src/
  config.js        <- your text, name, song
  App.jsx          <- the stages: closed -> shaking -> opening -> open
  GiftBox.jsx      <- the gift and its opening animation
  Card.jsx         <- the message card (tilt, signature, buttons)
  Typewriter.jsx   <- typing effect
  Player.jsx       <- player UI + visualizer
  useMusic.js      <- plays song.mp3, falls back to the synth
  synth.js         <- built-in melody (Web Audio API)
  FxCanvas.jsx     <- confetti, fireworks, cursor sparkles
  Background.jsx   <- stars and floating hearts
  styles.css       <- all styling
```
