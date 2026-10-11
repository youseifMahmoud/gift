import { useEffect, useState } from 'react';
import { prefersReducedMotion } from './motion.js';

// Types the lines out one after another. All lines reserve their space from the
// start (hidden text), so the card never jumps in height while typing.
export default function Typewriter({ lines, speed = 30, onDone }) {
  const [line, setLine] = useState(() => (prefersReducedMotion() ? lines.length : 0));
  const [chars, setChars] = useState(0);

  useEffect(() => {
    if (line >= lines.length) {
      if (onDone) onDone();
      return undefined;
    }
    const text = lines[line];
    if (chars < text.length) {
      const prev = text[chars - 1] || '';
      const pause = /[.,!?]/.test(prev) ? 170 : 0;
      const id = setTimeout(() => setChars((c) => c + 1), speed + pause);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => {
      setLine((l) => l + 1);
      setChars(0);
    }, 700);
    return () => clearTimeout(id);
  }, [line, chars, lines, speed, onDone]);

  return (
    <div className="typed">
      {lines.map((text, i) => {
        const typed = i < line ? text.length : i === line ? chars : 0;
        const active = i === line;
        return (
          <p key={i} className="typed-line">
            <span>{text.slice(0, typed)}</span>
            {active && <span className="caret" aria-hidden="true" />}
            <span className="typed-rest" aria-hidden="true">{text.slice(typed)}</span>
          </p>
        );
      })}
    </div>
  );
}
