import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from './motion.js';

// Twinkling stars + slowly rising hearts, drawn on a canvas behind the page.

const HEART_COLORS = ['#ff5d8f', '#ff9ec0', '#ffc857', '#c3a8ff'];
const rand = (a, b) => a + Math.random() * (b - a);

function heartPath(ctx, s) {
  ctx.beginPath();
  ctx.moveTo(0, s * 0.35);
  ctx.bezierCurveTo(-s * 0.9, -s * 0.3, -s * 0.5, -s * 0.95, 0, -s * 0.4);
  ctx.bezierCurveTo(s * 0.5, -s * 0.95, s * 0.9, -s * 0.3, 0, s * 0.35);
  ctx.closePath();
}

export default function Background() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const reduced = prefersReducedMotion();
    let w = 0;
    let h = 0;
    let stars = [];
    let hearts = [];
    let raf = 0;

    function makeHeart(initial) {
      return {
        x: rand(0, w),
        y: initial ? rand(0, h) : h + 30,
        s: rand(7, 17),
        vy: rand(0.25, 0.7),
        sway: rand(14, 34),
        phase: rand(0, 6.28),
        a: rand(0.14, 0.34),
        c: HEART_COLORS[Math.floor(rand(0, HEART_COLORS.length))],
      };
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const nStars = Math.min(170, Math.floor((w * h) / 9000));
      stars = Array.from({ length: nStars }, () => ({
        x: rand(0, w), y: rand(0, h), r: rand(0.5, 1.6), p: rand(0, 6.28), sp: rand(0.6, 1.8),
      }));
      hearts = Array.from({ length: w < 600 ? 9 : 16 }, () => makeHeart(true));
    }
    resize();
    window.addEventListener('resize', resize);

    function draw(now) {
      const t = now / 1000;
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = '#ffffff';
      stars.forEach((st) => {
        ctx.globalAlpha = reduced ? 0.55 : 0.25 + 0.65 * (0.5 + 0.5 * Math.sin(t * st.sp + st.p));
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
      });

      hearts.forEach((ht, i) => {
        if (!reduced) {
          ht.y -= ht.vy;
          if (ht.y < -30) hearts[i] = makeHeart(false);
        }
        const x = ht.x + Math.sin(t * 0.8 + ht.phase) * ht.sway;
        ctx.save();
        ctx.translate(x, ht.y);
        ctx.rotate(Math.sin(t * 0.6 + ht.phase) * 0.25);
        ctx.globalAlpha = ht.a;
        ctx.fillStyle = ht.c;
        heartPath(ctx, ht.s);
        ctx.fill();
        ctx.restore();
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} className="bg-canvas" aria-hidden="true" />;
}
