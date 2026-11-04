import { useEffect, useRef } from 'react';

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

// How dark the flyer is at each grid cell, 0..1. Stretched so dim photos still use both colors.
// -1 marks cells the flyer doesn't cover.
function readTones(img, nx, ny, fit) {
  const c = document.createElement('canvas');
  c.width = nx; c.height = ny;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const s = (fit === 'cover' ? Math.max : Math.min)(nx / iw, ny / ih);
  const dw = iw * s, dh = ih * s;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, (nx - dw) / 2, fit === 'cover' ? 0 : (ny - dh) / 2, dw, dh);
  const px = ctx.getImageData(0, 0, nx, ny).data;
  const tones = new Float32Array(nx * ny).fill(-1), seen = [];
  for (let i = 0; i < tones.length; i++) {
    if (px[i * 4 + 3] < 128) continue;
    tones[i] = (0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2]) / 255;
    seen.push(tones[i]);
  }
  seen.sort((a, b) => a - b);
  const lo = seen[Math.floor(seen.length * 0.02)], hi = seen[Math.floor(seen.length * 0.98)], range = Math.max(hi - lo, 0.01);
  for (let i = 0; i < tones.length; i++) if (tones[i] >= 0) tones[i] = 1 - Math.max(0, Math.min(1, (tones[i] - lo) / range));
  return tones;
}

export default function Dither({ src, w, h, colors, bg = '#F7F8FE', cell, fit = 'contain', style, className }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = w * dpr; cv.height = h * dpr;
    const ctx = cv.getContext('2d');
    const cs = cell || (w >= 200 ? 4 : w >= 90 ? 3 : 2);
    const nx = Math.ceil(w / cs), ny = Math.ceil(h / cs);
    let visible = true, tones = null, off = () => {}, alive = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '80px' });
    io.observe(cv);
    const draw = (t) => {
      if (!visible || !tones) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      for (let gy = 0; gy < ny; gy++) for (let gx = 0; gx < nx; gx++) {
        const tone = tones[gy * nx + gx];
        if (tone < 0) continue;
        const f = tone + 0.08 * Math.sin((gx + gy) / (nx + ny) * 14 - t * 1.4); // slow shimmer across the flyer
        if (f <= 0.02) continue;
        const b = (BAYER[(gy % 4) * 4 + (gx % 4)] + 0.5) / 16;
        if (f > 0.5 + b * 0.5) ctx.fillStyle = colors[1]; else if (f > b * 0.5) ctx.fillStyle = colors[0]; else continue;
        const d = cs > 2 ? cs - 1 : cs - 0.6;
        ctx.fillRect(gx * cs, gy * cs, d, d);
      }
    };
    const img = new Image();
    img.onload = () => {
      if (!alive) return;
      tones = readTones(img, nx, ny, fit);
      draw(2.5);
      if (!reduce) off = subscribe(draw);
    };
    img.src = src;
    return () => { alive = false; off(); io.disconnect(); };
  }, [src, w, h, colors && colors.join(), bg, cell, fit]);
  return <canvas ref={ref} className={className} style={{ width: w, height: h, display: 'block', background: bg, ...style }} />;
}
