import { useState } from 'react';
import Icon from '../lib/Icon.jsx';
import Dither from '../lib/Dither.jsx';
import Poster from '../lib/Poster.jsx';
import { fmt, relative } from '../lib/dates.js';
import { way } from '../lib/kinds.js';
import { downloadIcs } from '../lib/ics.js';

const tint = (hex, a) => { const n = parseInt(hex.slice(1), 16); const m = (c) => Math.round(255 - (255 - c) * a); return `rgb(${m(n >> 16 & 255)},${m(n >> 8 & 255)},${m(n & 255)})`; };

function Card({ ev, solid, onOpen, onAdd, idx, fresh }) {
  const w = way(ev.kind);
  const start = ev.start ? new Date(ev.start) : null, end = ev.end ? new Date(ev.end) : null;
  const now = new Date();
  const live = start && !ev.allDay && start <= now && (end ? end > now : now - start < 2 * 3600e3);
  const bg = solid ? 'var(--blue)' : tint(w.c[0], 0.32);
  const timeLine = !start ? 'Date not on flyer'
    : ev.flags?.includes('multi_day') && end ? `${fmt.day(start)} to ${end.getDate()}, all day`
    : live ? `Now${end ? ` until ${fmt.time(end)}` : ''}`
    : ev.allDay ? `${fmt.day(start)}, time not on flyer` : `${fmt.day(start)} at ${fmt.time(start)}`;
  const badge = live ? { t: 'Live', c: '#C62828', dot: true } : ev.flags?.includes('no_time') ? { t: 'No time', c: '#555' } : ev.flags?.includes('weekday_mismatch') ? { t: 'Check date', c: 'var(--warn-ink)' } : null;
  return (
    <div className="rise" style={{ animationDelay: `${60 + idx * 60}ms` }}>
      <div onClick={() => onOpen(ev)} className={`press ${solid ? 'grain shade' : 'grain'}`} role="button" tabIndex={0}
        style={{ position: 'relative', overflow: 'hidden', padding: 14, borderRadius: 26, background: bg, color: solid ? '#fff' : 'var(--ink)', boxShadow: fresh ? '0 0 0 3px var(--blue)' : 'none', transition: 'box-shadow 1.2s var(--ease-out), transform 180ms var(--ease-out)' }}>
        <div style={{ display: 'flex', gap: 14, position: 'relative', zIndex: 1 }}>
          <span style={{ position: 'relative', width: 92, height: 92, borderRadius: 20, overflow: 'hidden', flex: 'none' }}>
            <Poster ev={ev} w={92} h={92} colors={w.c} cell={3} fit="cover" />
            {badge && <span className="pop" style={{ position: 'absolute', left: 6, bottom: 6, height: 22, padding: '0 8px', borderRadius: 9999, background: 'rgba(255,255,255,.94)', display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: badge.c }}>{badge.dot && <span className="blink" style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--live)' }} />}{badge.t}</span>}
          </span>
          <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
            <div className="b" style={{ fontSize: 19, lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ev.title}</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6, color: solid ? '#D2E7FF' : w.c[1] }}>{timeLine}</div>
            <div style={{ fontSize: 13, marginTop: 3, color: solid ? '#A9D1FE' : '#555' }}>{ev.place || 'Place not on flyer'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10, position: 'relative', zIndex: 1 }}>
          <button onClick={(e) => { e.stopPropagation(); onAdd(ev); }} disabled={!start} className="press"
            style={{ height: 38, padding: '0 16px', borderRadius: 9999, display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, transition: 'background 300ms var(--ease-out), color 300ms', opacity: start ? 1 : .5,
              background: ev.added ? (solid ? 'rgba(255,255,255,.22)' : 'var(--blue-tint)') : (solid ? '#fff' : 'var(--blue)'),
              color: ev.added ? (solid ? '#fff' : 'var(--blue)') : (solid ? 'var(--blue)' : '#fff') }}>
            <span key={ev.added ? 'y' : 'n'} className="pop" style={{ display: 'flex' }}><Icon name={ev.added ? 'calendar-check' : 'calendar-plus-fill'} size={16} color="currentColor" /></span>
            {ev.added ? 'Added' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Sheet({ ev, onClose, onRemove, onAdd }) {
  const [closing, setClosing] = useState(false);
  const close = (fn) => { setClosing(true); setTimeout(() => { fn && fn(); onClose(); }, 260); };
  const w = way(ev.kind), start = ev.start ? new Date(ev.start) : null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50 }}>
      <div onClick={() => close()} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.35)', animation: `${closing ? 'vtOut' : 'rise'} 260ms var(--ease-out) both`, opacity: closing ? 0 : 1, transition: 'opacity 260ms' }} />
      <div className="safe-bottom" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '86%', overflow: 'auto', background: '#fff', borderRadius: '30px 30px 0 0', padding: '10px 20px 20px', transform: closing ? 'translateY(100%)' : 'none', transition: 'transform 260ms var(--ease-in-out)', animation: closing ? 'none' : 'dealIn 480ms var(--ease-out) both' }}>
        <span style={{ display: 'block', width: 38, height: 5, borderRadius: 3, background: '#DADADA', margin: '0 auto' }} />
        <div style={{ position: 'relative', height: ev.image ? 320 : 180, marginTop: 14, borderRadius: 20, overflow: 'hidden' }}><Poster ev={ev} w={Math.min(440, window.innerWidth) - 40} h={ev.image ? 320 : 180} colors={w.c} cell={4} /></div>
        <div className="b" style={{ fontSize: 26, marginTop: 16 }}>{ev.title}</div>
        <div style={{ fontSize: 15, color: 'var(--sec)', marginTop: 6 }}>{start ? `${fmt.day(start)}${ev.allDay ? '' : ` at ${fmt.time(start)}`}` : 'Date not on flyer'}{ev.place ? `, ${ev.place}` : ''}{ev.price ? `, ${ev.price}` : ''}</div>
        {ev.description && <p style={{ fontSize: 15, lineHeight: 1.5, margin: '14px 0 0' }}>{ev.description}</p>}
        {ev.evidence && <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 16, background: 'var(--ground)', fontSize: 13, color: '#555' }}><b style={{ fontWeight: 600, color: 'var(--ink)' }}>From the flyer:</b> “{ev.evidence}”</div>}
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button className="pill white" style={{ flex: 1 }} onClick={() => close(() => onRemove(ev))}><Icon name="trash" size={18} />Remove</button>
          <button className="pill blue" style={{ flex: 1.4 }} disabled={!start} onClick={() => onAdd(ev)}><Icon name="calendar-plus-fill" size={18} color="#fff" />Add to calendar</button>
        </div>
      </div>
    </div>
  );
}

export default function Wallet({ store, freshIds, onSnap, onUpdate, onRemove, toast }) {
  const [tab, setTab] = useState('upcoming');
  const [open, setOpen] = useState(null);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const evs = [...store.events].sort((a, b) => (a.start ? +new Date(a.start) : 9e15) - (b.start ? +new Date(b.start) : 9e15));
  const upcoming = evs.filter((e) => !e.start || new Date(e.end || e.start) >= today);
  const past = evs.filter((e) => e.start && new Date(e.end || e.start) < today).reverse();
  const list = tab === 'upcoming' ? upcoming : past;

  const add = (ev) => { downloadIcs(ev); onUpdate({ ...ev, added: true }); };
  const groups = [];
  list.forEach((e) => {
    const k = e.start ? new Date(e.start).toDateString() : 'none';
    const g = groups[groups.length - 1];
    if (g && g.k === k) g.items.push(e); else groups.push({ k, d: e.start ? new Date(e.start) : null, items: [e] });
  });
  let n = 0, lastMonth = '';

  const chip = (id, label) => <button key={id} onClick={() => setTab(id)} className="press" style={{ height: 40, padding: '0 18px', borderRadius: 9999, fontSize: 15, fontWeight: 500, background: tab === id ? 'var(--ink)' : 'var(--chip)', color: tab === id ? '#fff' : 'var(--ink)', transition: 'background 220ms var(--ease-out), color 220ms' }}>{label}</button>;

  return (
    <div className="screen scroll">
      <div className="safe-top" style={{ padding: '0 18px 140px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          <span className="b" style={{ fontSize: 32 }}>Wallet</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>{chip('upcoming', `Upcoming (${upcoming.length})`)}{chip('past', 'Past')}{chip('resources', 'Resources')}</div>

        {tab === 'resources' ? (
          store.resources.length ? store.resources.map((r, i) => (
            <div key={r.id} className="rise" style={{ animationDelay: `${i * 50}ms`, marginTop: 12, padding: '14px 16px', borderRadius: 20, background: '#fff', boxShadow: 'var(--shadow)' }}>
              <div className="b" style={{ fontSize: 16 }}>{r.title}</div>
              <div style={{ fontSize: 13, color: 'var(--sec)', marginTop: 3 }}>{[r.place, r.description].filter(Boolean).join('. ')}</div>
            </div>
          )) : <p style={{ color: 'var(--sec)', marginTop: 30, textAlign: 'center' }}>Flyers that aren't events, like free flu shots or club sign-ups, land here.</p>
        ) : list.length === 0 ? (
          <div className="rise" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: 60 }}>
            <span style={{ width: 200, height: 200, borderRadius: 40, overflow: 'hidden' }}><Dither kind="outdoors" w={200} h={200} colors={['#B9DAFE', '#1F84FC']} bg="#F0F1F2" cell={4} /></span>
            <div className="b" style={{ fontSize: 24, marginTop: 26 }}>{tab === 'past' ? 'Nothing here yet' : 'No events yet'}</div>
            <div style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--sec)', marginTop: 8, maxWidth: 270 }}>{tab === 'past' ? 'Events you saved move here after they happen.' : 'Snap a bulletin board and swipe right on anything that looks fun. It\'ll show up here.'}</div>
            {tab === 'upcoming' && <button className="pill blue" style={{ marginTop: 26, padding: '0 24px', height: 52 }} onClick={onSnap}><Icon name="camera-fill" size={20} color="#fff" />Snap a board</button>}
          </div>
        ) : groups.map((g) => {
          const month = g.d ? fmt.month(g.d) : 'No date';
          const showMonth = month !== lastMonth; lastMonth = month;
          const rel = g.d ? relative(g.d) : null;
          return (
            <div key={g.k}>
              {showMonth && <div className="b rise" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 24, marginTop: 24 }}>{month}<Icon name="chevron-right" size={20} /></div>}
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <div style={{ width: 34, flex: 'none', paddingTop: 6 }}>
                  <div style={{ fontSize: 11, letterSpacing: .3, color: rel === 'Today' ? 'var(--blue)' : 'var(--sec)', fontWeight: rel === 'Today' ? 600 : 400 }}>{rel === 'Today' ? 'TODAY' : g.d ? fmt.mon(g.d) : '—'}</div>
                  <div className="b" style={{ fontSize: 22, lineHeight: 1.1, marginTop: 2 }}>{g.d ? fmt.dd(g.d) : '?'}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {g.items.map((ev) => { const idx = n++; return <Card key={ev.id} ev={ev} idx={idx} solid={tab === 'upcoming' && idx === 0} fresh={freshIds.includes(ev.id)} onOpen={setOpen} onAdd={add} />; })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <button aria-label="Snap a board" onClick={onSnap} className="press pop" style={{ position: 'fixed', right: 'max(18px, calc(50vw - 222px))', bottom: 'calc(26px + env(safe-area-inset-bottom))', width: 64, height: 64, borderRadius: 32, background: 'var(--ink)', display: 'grid', placeItems: 'center', boxShadow: '0 10px 24px rgba(0,0,0,.22)', animationDelay: '300ms' }}><Icon name="camera-fill" size={28} color="#fff" /></button>
      {open && <Sheet ev={open} onClose={() => setOpen(null)} onRemove={onRemove} onAdd={(ev) => { add(ev); setOpen({ ...ev, added: true }); }} />}
      {toast && <div style={{ position: 'fixed', left: 0, right: 0, top: 'calc(14px + env(safe-area-inset-top))', display: 'flex', justifyContent: 'center', zIndex: 60, pointerEvents: 'none' }}><div key={toast} className="rise" style={{ padding: '10px 16px', borderRadius: 9999, background: 'var(--ink)', color: '#fff', fontSize: 14, fontWeight: 500 }}>{toast}</div></div>}
    </div>
  );
}
