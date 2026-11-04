import { useEffect, useState } from 'react';

const LINES = ['Finding every flyer…', 'Reading titles and dates…', 'Checking what\'s unclear…', 'Almost there…'];

export default function Reading({ photo, found }) {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((n) => Math.min(n + 1, LINES.length - 1)), 1600); return () => clearInterval(t); }, []);
  return (
    <div className="screen" style={{ background: '#111' }}>
      <img src={photo} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(24px) brightness(.55)', transform: 'scale(1.1)' }} />
      <div style={{ position: 'absolute', left: 28, right: 28, top: '14%', bottom: '30%', borderRadius: 28, overflow: 'hidden', viewTransitionName: 'board', boxShadow: '0 30px 60px rgba(0,0,0,.35)' }}>
        <img src={photo} alt="Your board" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {found == null && <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '22%', background: 'linear-gradient(transparent, rgba(31,132,252,.35) 70%, rgba(255,255,255,.9) 98%, transparent)', animation: 'sweep 1.6s var(--ease-in-out) infinite' }} />}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 'calc(70px + env(safe-area-inset-bottom))', textAlign: 'center', color: '#fff' }}>
        {found == null
          ? <><div className="b" style={{ fontSize: 24 }}>Reading your board</div><div key={i} className="fade-swap" style={{ fontSize: 15, opacity: .75, marginTop: 8 }}>{LINES[i]}</div></>
          : <div className="pop" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, height: 48, padding: '0 20px', borderRadius: 9999, background: '#fff', color: 'var(--ink)', fontSize: 17, fontWeight: 600 }}>
              <span style={{ width: 10, height: 10, borderRadius: 5, background: 'var(--blue)' }} />{found === 0 ? 'No events found' : `Found ${found} ${found === 1 ? 'event' : 'events'}`}</div>}
      </div>
    </div>
  );
}
