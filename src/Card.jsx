import { useCallback, useRef, useState } from 'react';
import Typewriter from './Typewriter.jsx';
import Player from './Player.jsx';
import { prefersReducedMotion } from './motion.js';

export default function Card({ config, music, onCelebrate, onClose }) {
  const ref = useRef(null);
  const [done, setDone] = useState(false);
  const doneRef = useRef(false);

  const handleDone = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setDone(true);
    setTimeout(onCelebrate, 350);
  }, [onCelebrate]);

  // 3D tilt + moving glare (mouse only)
  function onMove(e) {
    if (e.pointerType !== 'mouse' || prefersReducedMotion()) return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--ry', `${(px - 0.5) * 9}deg`);
    el.style.setProperty('--rx', `${(0.5 - py) * 7}deg`);
    el.style.setProperty('--mx', `${px * 100}%`);
    el.style.setProperty('--my', `${py * 100}%`);
  }
  function onLeave() {
    const el = ref.current;
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--rx', '0deg');
  }

  return (
    <div className="card-wrap">
      <article ref={ref} className="card" onPointerMove={onMove} onPointerLeave={onLeave}>
        <div className="glare" aria-hidden="true" />
        <p className="eyebrow">For {config.recipient}</p>
        <h1 className="card-title">{config.title}</h1>

        <Typewriter lines={config.messages} onDone={handleDone} />

        <p className={`signature${done ? ' show' : ''}`}>{config.signature}</p>

        <div className={`actions${done ? ' show' : ''}`}>
          <button className="btn primary" onClick={onCelebrate}>Celebrate again</button>
          <button className="btn ghost" onClick={onClose}>Wrap it up</button>
        </div>

        <Player music={music} title={config.song.title} artist={config.song.artist} />
      </article>
    </div>
  );
}
