import { useEffect, useRef, useState } from 'react';
import Icon from '../lib/Icon.jsx';
import { analyzeFrame } from '../lib/quality.js';

const HINTS = {
  aiming: { text: 'Fit the whole board within the marks', icon: 'image' },
  glare: { text: 'Glare on the board. Tilt your phone a little.', icon: 'sun', tilt: true },
  dark: { text: 'Too dark. Find more light.', icon: 'sun' },
  blurry: { text: 'Hold steady…', icon: 'clock' },
  ready: { text: 'Looks good. Take the photo.', icon: 'check', ready: true }
};

// Downscale to keep uploads fast; Gemini reads 1600px boards fine.
function toJpeg(src, sw, sh, max = 1600) {
  const s = Math.min(1, max / Math.max(sw, sh));
  const c = document.createElement('canvas');
  c.width = Math.round(sw * s); c.height = Math.round(sh * s);
  c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.82);
}

// The sharper copy stays on the phone; flyer photos are cropped from it.
const CROP_SOURCE = 3000;

export default function Capture({ onShot, onClose, canClose, onError }) {
  const video = useRef(null), probe = useRef(null), cameraRef = useRef(null), libraryRef = useRef(null);
  const [cam, setCam] = useState('starting'); // starting | live | off
  const [hint, setHint] = useState('aiming');
  const [flash, setFlash] = useState(false);
  const streak = useRef({ s: 'aiming', n: 0 });

  useEffect(() => {
    let stream, timer, alive = true;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1440 } }, audio: false });
        if (!alive) return stream.getTracks().forEach(t => t.stop());
        video.current.srcObject = stream;
        await video.current.play();
        setCam('live');
        const t0 = performance.now();
        timer = setInterval(() => {
          const v = video.current; if (!v || !v.videoWidth) return;
          let { state } = analyzeFrame(v, probe.current);
          if (performance.now() - t0 < 1200) state = 'aiming';
          const st = streak.current;
          if (st.s === state) st.n++; else { st.s = state; st.n = 1; }
          if (st.n >= 2) setHint(state); // needs two frames in a row, so hints don't flicker
        }, 350);
      } catch { setCam('off'); }
    })();
    return () => { alive = false; clearInterval(timer); stream && stream.getTracks().forEach(t => t.stop()); };
  }, []);

  const shoot = () => {
    const v = video.current;
    if (cam !== 'live' || !v.videoWidth) return cameraRef.current.click();
    setFlash(true);
    navigator.vibrate && navigator.vibrate(12);
    const data = toJpeg(v, v.videoWidth, v.videoHeight);
    const full = toJpeg(v, v.videoWidth, v.videoHeight, CROP_SOURCE);
    setTimeout(() => onShot(data, full), 160);
  };
  const pick = (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = ''; // so choosing the same photo again still fires onChange
    if (!f) return;
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      const data = toJpeg(img, img.naturalWidth, img.naturalHeight);
      const full = toJpeg(img, img.naturalWidth, img.naturalHeight, CROP_SOURCE);
      URL.revokeObjectURL(url);
      onShot(data, full);
    };
    img.onerror = () => { URL.revokeObjectURL(url); onError('Couldn\'t open that photo. Try a different one.'); };
    img.src = url;
  };

  const h = HINTS[hint];
  const mark = h.ready ? '#5AD27A' : '#FFFFFF';
  const corner = (pos, bw, br) => <span style={{ position: 'absolute', ...pos, width: 58, height: 58, borderStyle: 'solid', borderColor: mark, borderWidth: bw, borderRadius: br, transition: 'border-color 300ms var(--ease-out)' }} />;

  return (
    <div className="screen" style={{ background: '#1d1d1d' }}>
      <video ref={video} playsInline muted style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', viewTransitionName: 'board', opacity: cam === 'live' ? 1 : 0, transition: 'opacity 400ms var(--ease-out)' }} />
      <canvas ref={probe} style={{ display: 'none' }} />
      <div style={{ position: 'absolute', inset: '0 0 auto', height: 190, background: 'linear-gradient(rgba(0,0,0,.55), transparent)' }} />
      <div style={{ position: 'absolute', inset: 'auto 0 0', height: 300, background: 'linear-gradient(transparent, rgba(0,0,0,.6))' }} />

      <header className="safe-top" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', height: 44 + 14, color: '#fff' }}>
        {canClose ? <button className="press" aria-label="Close" onClick={onClose}><Icon name="multiply-circle-fill" size={36} color="#fff" /></button> : <span style={{ width: 36 }} />}
        <span className="b" style={{ flex: 1, textAlign: 'center', fontSize: 19 }}>Take a photo of the board</span>
        <span style={{ width: 36 }} />
      </header>

      <div style={{ position: 'absolute', left: 20, right: 20, top: '17%', bottom: 'calc(246px + env(safe-area-inset-bottom))', animation: h.ready ? 'settle 420ms var(--spring)' : 'none' }} key={h.ready ? 'r' : 'n'}>
        {corner({ left: 0, top: 0 }, '4px 0 0 4px', '20px 0 0 0')}
        {corner({ right: 0, top: 0 }, '4px 4px 0 0', '0 20px 0 0')}
        {corner({ left: 0, bottom: 0 }, '0 0 4px 4px', '0 0 0 20px')}
        {corner({ right: 0, bottom: 0 }, '0 4px 4px 0', '0 0 20px 0')}
        {cam === 'off' && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,.75)', textAlign: 'center', padding: 30, fontSize: 15, lineHeight: 1.5 }}>Camera isn't available here. Tap the shutter to take a photo, or the image button to choose one.</div>}
      </div>

      <div style={{ position: 'absolute', left: 18, right: 18, bottom: 'calc(150px + env(safe-area-inset-bottom))', minHeight: 76, padding: '14px 18px 14px 14px', borderRadius: 22, background: 'rgba(28,28,28,.62)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: 18, color: '#fff' }}>
        <span style={{ position: 'relative', width: 52, height: 52, flex: 'none' }}>
          {[{ left: 0, top: 0, bw: '2.5px 0 0 2.5px', br: '6px 0 0 0' }, { right: 0, top: 0, bw: '2.5px 2.5px 0 0', br: '0 6px 0 0' }, { left: 0, bottom: 0, bw: '0 0 2.5px 2.5px', br: '0 0 0 6px' }, { right: 0, bottom: 0, bw: '0 2.5px 2.5px 0', br: '0 0 6px 0' }].map((c, i) =>
            <span key={i} style={{ position: 'absolute', left: c.left, right: c.right, top: c.top, bottom: c.bottom, width: 14, height: 14, borderStyle: 'solid', borderColor: mark, borderWidth: c.bw, borderRadius: c.br, transition: 'border-color 300ms' }} />)}
          <span key={hint} className={`fade-swap ${h.tilt ? 'tilt' : ''}`} style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}><Icon name={h.icon} size={26} color="#fff" /></span>
        </span>
        <span key={hint + 't'} className="fade-swap" style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.3 }}>{h.text}</span>
      </div>

      <div className="safe-bottom" style={{ position: 'absolute', left: 0, right: 0, bottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 44px' }}>
        <span style={{ width: 44 }} />
        <button aria-label="Take photo" onClick={shoot} className="press" style={{ width: 78, height: 78, borderRadius: 39, boxShadow: 'inset 0 0 0 4px #fff', display: 'grid', placeItems: 'center' }}>
          <span style={{ width: 62, height: 62, borderRadius: 31, background: '#fff' }} />
        </button>
        <button aria-label="Choose a photo" className="press" onClick={() => libraryRef.current.click()} style={{ width: 44, height: 44, borderRadius: 12, display: 'grid', placeItems: 'center', boxShadow: '0 0 0 2px #fff' }}><Icon name="image" size={24} color="#fff" /></button>
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={pick} hidden />
        <input ref={libraryRef} type="file" accept="image/*" onChange={pick} hidden />
      </div>
      {flash && <div onAnimationEnd={() => setFlash(false)} style={{ position: 'absolute', inset: 0, background: '#fff', animation: 'flash 260ms var(--ease-out) both', pointerEvents: 'none' }} />}
    </div>
  );
}
