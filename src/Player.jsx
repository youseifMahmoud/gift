import { useEffect, useRef } from 'react';

const BARS = 28;

function fmt(s) {
  if (!Number.isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r < 10 ? '0' : ''}${r}`;
}

export default function Player({ music, title, artist }) {
  const canvasRef = useRef(null);
  const musicRef = useRef(music);
  musicRef.current = music;

  // Visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const levels = new Array(BARS).fill(0);
    const shown = new Array(BARS).fill(0);
    let raf = 0;
    let w = 0;
    let h = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    function frame() {
      musicRef.current.getLevels(levels);
      ctx.clearRect(0, 0, w, h);
      const gap = 4;
      const bw = (w - gap * (BARS - 1)) / BARS;
      const grad = ctx.createLinearGradient(0, h, 0, 0);
      grad.addColorStop(0, '#ff5d8f');
      grad.addColorStop(1, '#ffc857');
      ctx.fillStyle = grad;
      for (let i = 0; i < BARS; i += 1) {
        shown[i] += (levels[i] - shown[i]) * 0.25;
        const bh = Math.max(3, shown[i] * h);
        const x = i * (bw + gap);
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, h - bh, bw, bh, Math.min(bw / 2, 4));
        else ctx.rect(x, h - bh, bw, bh);
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const isFile = music.mode === 'file';

  return (
    <section className="player" aria-label="Music player">
      <div className="player-top">
        <button
          className={`play-btn${music.playing ? ' is-playing' : ''}`}
          onClick={music.toggle}
          aria-label={music.playing ? 'Pause the song' : 'Play the song'}
        >
          {music.playing ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" rx="1.2" />
              <rect x="14" y="5" width="4" height="14" rx="1.2" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
            </svg>
          )}
        </button>
        <div className="track">
          <p className="track-title">{isFile ? title : 'A little melody for you'}</p>
          <p className="track-sub">
            {isFile ? artist : 'Built-in song. Add song.mp3 to play your own.'}
          </p>
        </div>
      </div>

      <canvas ref={canvasRef} className="viz" aria-hidden="true" />

      <div className="player-bottom">
        {isFile ? (
          <label className="seek">
            <span className="time">{fmt(music.time.cur)}</span>
            <input
              id="seek"
              type="range"
              min="0"
              max={music.time.dur || 0}
              step="0.1"
              value={Math.min(music.time.cur, music.time.dur || 0)}
              onChange={(e) => music.seek(Number(e.target.value))}
              aria-label="Seek"
            />
            <span className="time">{fmt(music.time.dur)}</span>
          </label>
        ) : (
          <span className="loop-note">Plays on a loop</span>
        )}
        <label className="volume">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z" />
          </svg>
          <input
            id="volume"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={music.volume}
            onChange={(e) => music.setVolume(Number(e.target.value))}
            aria-label="Volume"
          />
        </label>
      </div>
    </section>
  );
}
