import { useEffect, useRef } from 'react';
import { field } from './field.js';

// One shared ~15fps ticker drives every visible dither canvas.
const subs = new Set();
let raf = 0, last = 0;
const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
function tick(ts) {
  if (ts - last > 66) { last = ts; subs.forEach((fn) => fn(ts / 1000)); }
  raf = subs.size ? requestAnimationFrame(tick) : 0;
}
function subscribe(fn) { subs.add(fn); if (!raf) raf = requestAnimationFrame(tick); return () => subs.delete(fn); }

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

export default function Dither({ kind, w, h, colors, bg = '#F7F8FE', cell, speed = 1, style, className }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = w * dpr; cv.height = h * dpr;
    const ctx = cv.getContext('2d');
    const cs = cell || (w >= 200 ? 4 : w >= 90 ? 3 : 2);
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '80px' });
    io.observe(cv);
    const draw = (t) => {
      if (!visible) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      const s = Math.max(w, h), ox = (s - w) / 2, oy = (s - h) / 2;
      const nx = Math.ceil(w / cs), ny = Math.ceil(h / cs), tt = t * speed;
      for (let gy = 0; gy < ny; gy++) for (let gx = 0; gx < nx; gx++) {
        const f = field(kind, (gx * cs + cs / 2 + ox) / s, (gy * cs + cs / 2 + oy) / s, tt);
        if (f <= 0.02) continue;
        const b = (BAYER[(gy % 4) * 4 + (gx % 4)] + 0.5) / 16;
        if (f > 0.5 + b * 0.5) ctx.fillStyle = colors[1]; else if (f > b * 0.5) ctx.fillStyle = colors[0]; else continue;
        const d = cs > 2 ? cs - 1 : cs - 0.6;
        ctx.fillRect(gx * cs, gy * cs, d, d);
      }
    };
    draw(2.5);
    const off = reduce ? () => {} : subscribe(draw);
    return () => { off(); io.disconnect(); };
  }, [kind, w, h, colors && colors.join(), bg, cell, speed]);
  return <canvas ref={ref} className={className} style={{ width: w, height: h, display: 'block', ...style }} />;
}
