import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { prefersReducedMotion } from './motion.js';

// Full-screen overlay canvas for confetti, fireworks and the cursor sparkle trail.
// Use it through a ref:  fx.current.confetti(x, y)  /  fx.current.fireworks(5)

const COLORS = ['#ff5d8f', '#ffc857', '#4fe0d4', '#9b7bff', '#ffffff', '#ff9f6b'];
const TRAIL = ['#ffc857', '#ff9ec0', '#ffffff', '#9ef0ea'];
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function drawSparkle(ctx, r) {
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.quadraticCurveTo(0, 0, 0, r);
  ctx.quadraticCurveTo(0, 0, -r, 0);
  ctx.quadraticCurveTo(0, 0, 0, -r);
  ctx.closePath();
  ctx.fill();
}

const FxCanvas = forwardRef(function FxCanvas(_props, ref) {
  const canvasRef = useRef(null);
  const sim = useRef({ parts: [], rockets: [], timers: [], size: { w: 0, h: 0 } });

  useImperativeHandle(ref, () => ({
    confetti(x, y, n = 140) {
      if (prefersReducedMotion()) return;
      const { parts } = sim.current;
      for (let i = 0; i < n; i += 1) {
        const a = rand(0, Math.PI * 2);
        const s = rand(4, 14);
        parts.push({
          kind: i % 6 === 0 ? 'star' : 'rect',
          x, y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s - 6,
          g: 0.28,
          drag: 0.985,
          life: 0,
          max: rand(90, 150),
          size: rand(5, 11),
          color: pick(COLORS),
          rot: rand(0, 6.28),
          vr: rand(-0.3, 0.3),
        });
      }
    },
    fireworks(count = 5) {
      if (prefersReducedMotion()) return;
      const s = sim.current;
      for (let i = 0; i < count; i += 1) {
        const id = setTimeout(() => {
          const { w, h } = s.size;
          s.rockets.push({
            x: rand(w * 0.15, w * 0.85),
            y: h + 10,
            ty: rand(h * 0.14, h * 0.45),
            vy: -rand(9, 12),
            color: pick(COLORS),
          });
        }, i * 380 + rand(0, 200));
        s.timers.push(id);
      }
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const s = sim.current;
    const reduced = prefersReducedMotion();
    let raf = 0;
    let last = performance.now();
    let lastTrail = 0;
    let dpr = 1;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      s.size.w = window.innerWidth;
      s.size.h = window.innerHeight;
      canvas.width = s.size.w * dpr;
      canvas.height = s.size.h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    function explode(x, y, color) {
      const n = 70;
      for (let i = 0; i < n; i += 1) {
        const a = (i / n) * Math.PI * 2 + rand(-0.05, 0.05);
        const sp = rand(2, 6.2);
        s.parts.push({
          kind: i % 9 === 0 ? 'star' : 'dot',
          x, y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          g: 0.045,
          drag: 0.985,
          life: 0,
          max: rand(70, 110),
          size: rand(1.6, 3.2),
          color: i % 4 === 0 ? '#ffffff' : color,
          rot: 0,
          vr: 0,
        });
      }
    }

    function onMove(e) {
      if (reduced) return;
      const now = performance.now();
      if (now - lastTrail < 26) return;
      lastTrail = now;
      s.parts.push({
        kind: 'star',
        x: e.clientX + rand(-4, 4),
        y: e.clientY + rand(-4, 4),
        vx: rand(-0.6, 0.6),
        vy: rand(-0.2, 0.9),
        g: 0.02,
        drag: 0.98,
        life: 0,
        max: rand(34, 52),
        size: rand(3, 7),
        color: pick(TRAIL),
        rot: 0,
        vr: 0,
      });
    }
    window.addEventListener('pointermove', onMove, { passive: true });

    function frame(now) {
      const dt = Math.min(3, (now - last) / 16.667);
      last = now;
      const { w, h } = s.size;
      ctx.clearRect(0, 0, w, h);

      // rockets
      for (let i = s.rockets.length - 1; i >= 0; i -= 1) {
        const r = s.rockets[i];
        r.y += r.vy * dt;
        r.vy *= Math.pow(0.985, dt);
        s.parts.push({
          kind: 'dot', x: r.x + rand(-1, 1), y: r.y, vx: rand(-0.2, 0.2), vy: rand(0.5, 1.5),
          g: 0.02, drag: 0.98, life: 0, max: 24, size: 1.8, color: '#ffe9b0', rot: 0, vr: 0,
        });
        if (r.y <= r.ty || r.vy > -2.2) {
          explode(r.x, r.y, r.color);
          s.rockets.splice(i, 1);
        }
      }

      // particles
      for (let i = s.parts.length - 1; i >= 0; i -= 1) {
        const p = s.parts[i];
        p.life += dt;
        if (p.life >= p.max) {
          s.parts.splice(i, 1);
          continue;
        }
        const drag = Math.pow(p.drag, dt);
        p.vx *= drag;
        p.vy = p.vy * drag + p.g * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;

        const k = 1 - p.life / p.max;
        ctx.globalAlpha = Math.min(1, k * 1.6);
        ctx.fillStyle = p.color;
        if (p.kind === 'rect') {
          ctx.globalCompositeOperation = 'source-over';
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.scale(1, Math.cos(p.life * 0.25));
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
          ctx.restore();
        } else if (p.kind === 'star') {
          ctx.globalCompositeOperation = 'lighter';
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.life * 0.05);
          drawSparkle(ctx, p.size * (0.5 + k));
          ctx.restore();
        } else {
          ctx.globalCompositeOperation = 'lighter';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (0.4 + k * 0.6), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      s.timers.forEach(clearTimeout);
      s.timers = [];
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="fx-canvas" aria-hidden="true" />;
});

export default FxCanvas;
