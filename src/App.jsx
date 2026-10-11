import { useCallback, useEffect, useRef, useState } from 'react';
import config from './config.js';
import Background from './Background.jsx';
import FxCanvas from './FxCanvas.jsx';
import GiftBox from './GiftBox.jsx';
import Card from './Card.jsx';
import { useMusic } from './useMusic.js';
import { prefersReducedMotion } from './motion.js';

export default function App() {
  // 'closed' -> 'shaking' -> 'opening' -> 'open'
  const [stage, setStage] = useState('closed');
  const fx = useRef(null);
  const timers = useRef([]);
  const music = useMusic(config.song.file);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const later = (fn, ms) => {
    timers.current.push(setTimeout(fn, ms));
  };

  function openGift() {
    // Starting the music inside the click is what lets browsers allow sound.
    if (config.song.autoplayOnOpen) music.play();

    if (prefersReducedMotion()) {
      setStage('open');
      return;
    }
    setStage('shaking');
    later(() => {
      setStage('opening');
      fx.current.confetti(window.innerWidth / 2, window.innerHeight * 0.42, 160);
    }, 600);
    later(() => fx.current.fireworks(2), 900);
    later(() => setStage('open'), 1600);
  }

  const celebrate = useCallback(() => {
    if (!fx.current) return;
    fx.current.confetti(window.innerWidth / 2, window.innerHeight * 0.35, 120);
    fx.current.fireworks(5);
  }, []);

  function wrapItUp() {
    music.pause();
    setStage('closed');
  }

  return (
    <>
      <div className="aurora" aria-hidden="true">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
      </div>
      <Background />

      <main className="page">
        <div className="stage">
          {stage === 'open' ? (
            <Card config={config} music={music} onCelebrate={celebrate} onClose={wrapItUp} />
          ) : (
            <div className="closed">
              <h1 className="teaser">{config.teaser}</h1>
              <GiftBox stage={stage} onOpen={openGift} label="Open the gift" />
              <p className={`hint${stage !== 'closed' ? ' faded' : ''}`}>{config.hint}</p>
            </div>
          )}
        </div>
      </main>

      <FxCanvas ref={fx} />
    </>
  );
}
