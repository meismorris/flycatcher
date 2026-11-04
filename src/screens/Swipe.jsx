import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Icon from '../lib/Icon.jsx';
import Poster from '../lib/Poster.jsx';

export default function Swipe({ deck, onDecide, onDone, onClose }) {
  const vw = Math.min(typeof window !== 'undefined' ? window.innerWidth : 390, 480);
  const vh = typeof window !== 'undefined' ? window.innerHeight : 844;
  const CH = Math.round(Math.min(Math.min(330, vw - 60) * 1.56, vh - 270));
  const CW = Math.round(Math.min(330, vw - 60, CH / 1.4)), AH = Math.round(Math.min(CW, CH - 150));
  const [i, setI] = useState(0);
  const [dec, setDec] = useState({});
  const [picks, setPicks] = useState({});
  const els = useRef([]), drag = useRef(null), flying = useRef(null), track = useRef(null);
  const left = deck.filter((e) => !dec[e.id]).length;
  const saved = Object.values(dec).filter((v) => v === 'keep').length;

  const nextOpen = (from, d) => { for (let k = 1; k <= deck.length; k++) { const c = (from + k) % deck.length; if (!d[deck[c].id]) return c; } return -1; };

  const layout = (dx = 0, quick = false, cur = i, d = dec) => {
    const n1 = nextOpen(cur, d), n2 = n1 >= 0 ? nextOpen(n1, { ...d, [deck[cur]?.id]: d[deck[cur]?.id] || 'x' }) : -1;
    const p = Math.min(Math.abs(dx) / 180, 1);
    const slow = 'transform 560ms var(--ease-out), opacity 450ms ease, filter 500ms ease';
    const tr = quick ? 'transform 60ms linear, opacity 120ms, filter 120ms' : slow;
    deck.forEach((ev, j) => {
      const el = els.current[j]; if (!el) return;
      const set = (t, o, blur, z, trans) => { el.style.transition = trans; el.style.transform = t; el.style.opacity = o; el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(1)}px)` : 'none'; el.style.zIndex = z; };
      const lv = el.querySelector('[data-live]');
      if (d[ev.id]) {
        const s = d[ev.id] === 'keep' ? 1 : -1;
        set(`translateX(${s * (vw + 80)}px) translateY(-20px) rotateY(${s * 62}deg) rotateZ(${s * 9}deg) scale(.94)`, 0, 0, 40, flying.current === j ? 'transform 560ms cubic-bezier(.3,.55,.3,1), opacity 360ms ease 180ms' : 'none');
        if (lv) lv.style.opacity = 0;
      } else if (j === cur) {
        set(`translateX(${dx}px) rotateY(${Math.max(-30, Math.min(30, dx / 8))}deg) rotateZ(${dx / 40}deg)`, 1, 0, 30, tr);
        if (lv) { lv.textContent = dx > 0 ? 'Maybe' : 'Skip'; lv.style.background = dx > 0 ? 'var(--blue)' : 'rgba(17,17,17,.85)'; lv.style.opacity = Math.min(Math.abs(dx) / 90, 1); }
      } else if (j === n1) set(`translateY(${22 * (1 - p)}px) scale(${0.9 + 0.08 * p})`, 0.55 + 0.4 * p, 10 * (1 - p), 20, tr);
      else if (j === n2) set('translateY(42px) scale(.82)', 0.28, 14, 10, slow);
      else set('translateY(50px) scale(.78)', 0, 16, 5, slow);
    });
  };

  useLayoutEffect(() => { layout(0, false); }, []); // eslint-disable-line

  const decide = (kind) => {
    const ev = deck[i]; if (!ev || dec[ev.id]) return;
    const d = { ...dec, [ev.id]: kind };
    flying.current = i;
    const n = nextOpen(i, d);
    const nextI = n >= 0 ? n : i;
    layout(0, false, nextI, d);
    setDec(d); setI(nextI);
    navigator.vibrate && navigator.vibrate(kind === 'keep' ? [8, 30, 8] : 8);
    onDecide(ev, kind, picks[ev.id]);
    setTimeout(() => { flying.current = null; }, 700);
  };

  const sc = () => { const r = track.current?.getBoundingClientRect(); return r ? r.width / Math.min(window.innerWidth, 480) : 1; };
  const down = (e) => { if (e.target.closest('button')) return; drag.current = { x0: e.clientX, t0: performance.now(), moved: false }; e.currentTarget.setPointerCapture?.(e.pointerId); };
  const move = (e) => { const g = drag.current; if (!g) return; const dx = (e.clientX - g.x0) / sc(); if (Math.abs(dx) > 5) g.moved = true; if (g.moved) layout(dx, true); };
  const up = (e) => {
    const g = drag.current; if (!g) return; drag.current = null;
    const dx = (e.clientX - g.x0) / sc(), vel = dx / Math.max(1, performance.now() - g.t0);
    if (g.moved && (Math.abs(dx) > 110 || Math.abs(vel) > 0.6)) decide(dx > 0 ? 'keep' : 'skip'); else layout(0, false);
  };

  useEffect(() => {
    const k = (e) => { if (e.key === 'ArrowRight') decide('keep'); if (e.key === 'ArrowLeft') decide('skip'); };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  });

  const cur = deck[i];
  return (
    <div className="screen" style={{ backgroundImage: 'radial-gradient(#D5D8DD 1px, transparent 1.3px)', backgroundSize: '16px 16px' }}>
      <header className="safe-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: 60 }}>
        <button className="press" aria-label="Close" onClick={onClose} style={{ width: 38, height: 38, borderRadius: 19, background: 'var(--chip)', display: 'grid', placeItems: 'center' }}><Icon name="multiply" size={20} /></button>
        <span style={{ fontSize: 16, fontWeight: 500 }}>{left ? `${Math.min(deck.length - left + 1, deck.length)} of ${deck.length}` : `${saved} saved`}</span>
        <button onClick={onDone} style={{ width: 38, textAlign: 'right', fontSize: 16, fontWeight: 500 }}>Done</button>
      </header>
      <div style={{ display: 'flex', gap: 6, width: 200, margin: '14px auto 0' }}>
        {deck.map((e, j) => <span key={e.id} style={{ flex: 1, height: 4, borderRadius: 2, transition: 'background 300ms var(--ease-out)', background: dec[e.id] === 'keep' ? 'var(--blue)' : dec[e.id] === 'skip' ? '#C9C9C9' : j === i && left ? 'var(--ink)' : '#E2E2E2' }} />)}
      </div>

      <div ref={track} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        style={{ position: 'relative', height: CH + 24, marginTop: 26, touchAction: 'none', userSelect: 'none', perspective: 1100 }}>
        {deck.map((ev, j) => (
          <div key={ev.id} ref={(el) => (els.current[j] = el)} style={{ position: 'absolute', left: '50%', top: 0, width: CW, height: CH, marginLeft: -CW / 2, willChange: 'transform, opacity, filter', transformOrigin: '50% 60%', cursor: 'grab' }}>
            <div style={{ position: 'absolute', inset: 0, animation: `dealIn 620ms var(--spring) ${Math.min(j, 3) * 80}ms both` }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: 24, overflow: 'hidden', background: ev.way.panel, boxShadow: '0 18px 40px rgba(0,0,0,.12), 0 2px 6px rgba(0,0,0,.06)' }}>
                <div style={{ position: 'relative', width: CW, height: AH, overflow: 'hidden' }}>
                  <Poster ev={ev} w={CW} h={AH} colors={ev.way.c} cell={4} />
                  <div style={{ position: 'absolute', left: 12, top: 12, width: 50, height: 54, borderRadius: 14, background: 'rgba(245,245,245,.94)', display: 'grid', placeItems: 'center', alignContent: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: .6, color: ev.way.c[1] }}>{ev.mon || '—'}</span>
                    <span className="b" style={{ fontSize: 24, lineHeight: 1 }}>{ev.dd || '?'}</span>
                  </div>
                  <span data-live style={{ position: 'absolute', left: '50%', top: '40%', transform: 'translateX(-50%)', height: 40, padding: '0 18px', display: 'flex', alignItems: 'center', borderRadius: 9999, color: '#fff', fontSize: 16, fontWeight: 600, opacity: 0, pointerEvents: 'none' }} />
                  {dec[ev.id] && <span className="pop" style={{ position: 'absolute', right: 12, top: 12, height: 30, padding: '0 12px', display: 'flex', alignItems: 'center', borderRadius: 9999, background: dec[ev.id] === 'keep' ? 'var(--blue)' : '#2B2B2B', color: '#fff', fontSize: 13, fontWeight: 600 }}>{dec[ev.id] === 'keep' ? 'Saved' : 'Skipped'}</span>}
                </div>
                <div className="grain shade" style={{ position: 'absolute', left: 0, right: 0, top: AH, bottom: 0, padding: 16, display: 'flex', flexDirection: 'column', color: ev.way.ink }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: ev.way.sub }}>{ev.whenLine}</span>
                  <span className="b" style={{ fontSize: 26, lineHeight: 1.05, marginTop: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ev.title}</span>
                  <div style={{ flex: 1 }} />
                  {ev.readings ? (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, marginRight: 2 }}>Which date?</span>
                      {ev.readings.map((o) => <button key={o} onClick={() => setPicks({ ...picks, [ev.id]: o })} className="press" style={{ height: 30, padding: '0 12px', borderRadius: 9999, fontSize: 13, fontWeight: 600, background: picks[ev.id] === o ? ev.way.ink : 'rgba(255,255,255,.25)', color: picks[ev.id] === o ? ev.way.panel : ev.way.ink, boxShadow: `inset 0 0 0 1.5px ${ev.way.ink}` }}>{o}</button>)}
                    </div>
                  ) : <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: ev.way.sub }}><Icon name="map-marker" size={15} color="currentColor" />{ev.place || 'Place not on flyer'}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
        {!left && (
          <div className="focus-in" style={{ position: 'absolute', left: 30, right: 30, top: '30%', textAlign: 'center', animationDelay: '250ms' }}>
            <div className="b" style={{ fontSize: 40, lineHeight: 1 }}>All caught up</div>
            <div style={{ fontSize: 15, color: 'var(--sec)', marginTop: 10 }}>{saved === 1 ? '1 flyer saved to your wallet' : `${saved} flyers saved to your wallet`}</div>
          </div>
        )}
      </div>

      {left > 0 && cur && <p key={cur.id} className="fade-swap" style={{ textAlign: 'center', fontSize: 14, color: 'var(--sec)', margin: '4px 28px 0', lineHeight: 1.45 }}>{cur.description}</p>}

      <div className="safe-bottom" style={{ position: 'absolute', left: 20, right: 20, bottom: 14 }}>
        {left > 0 ? (
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="pill white" style={{ flex: 1 }} onClick={() => decide('skip')}><Icon name="multiply" size={20} />Skip</button>
            <button className="pill blue" style={{ flex: 1 }} onClick={() => decide('keep')}><Icon name="bookmark-fill" size={19} color="#fff" />Maybe</button>
          </div>
        ) : <button className="pill blue rise" style={{ width: '100%', animationDelay: '450ms' }} onClick={onDone}>Open wallet</button>}
      </div>
    </div>
  );
}
