import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import Capture from './screens/Capture.jsx';
import Reading from './screens/Reading.jsx';
import Retake from './screens/Retake.jsx';
import Swipe from './screens/Swipe.jsx';
import Wallet from './screens/Wallet.jsx';
import { load, save } from './lib/storage.js';
import { resolveDate, fmt } from './lib/dates.js';
import { kindFor, way } from './lib/kinds.js';
import { cropFlyers } from './lib/crop.js';

const uid = () => Math.random().toString(36).slice(2, 10);

// Screen changes run through the View Transitions API when the browser has it,
// so the board photo morphs between camera, reading and retake.
function transition(fn) {
  if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(() => flushSync(fn));
  else fn();
}

function toDeck(result) {
  const flyers = (result && result.flyers) || [];
  return flyers.filter((f) => f.kind === 'event' || f.kind === 'deadline').map((f) => {
    const kind = kindFor(f.category);
    const r = resolveDate(f);
    const readings = (f.possible_readings || []).find((p) => p.field === 'date_text')?.options;
    const start = r.start;
    const whenLine = !start ? 'Date not on flyer' : r.flags.includes('multi_day') && r.end ? `${fmt.day(start)} to ${r.end.getDate()}` : r.allDay ? `${fmt.day(start)}, time not on flyer` : `${fmt.day(start)}, ${fmt.time(start)}`;
    return {
      id: uid(), flyer: f, kind, way: way(kind), image: f.image,
      title: f.display_title || f.title_text || 'Untitled flyer', place: f.display_place || f.place_text, price: f.price_text,
      description: f.description, evidence: f.evidence,
      start, end: r.end, allDay: r.allDay, flags: r.flags, readings: readings && readings.length > 1 ? readings : null,
      mon: start ? fmt.mon(start) : null, dd: start ? fmt.dd(start) : null, whenLine
    };
  });
}

export default function App() {
  const [store, setStore] = useState(load);
  const [screen, setScreen] = useState(() => (load().events.length ? 'wallet' : 'capture'));
  const [photo, setPhoto] = useState(null);
  const [result, setResult] = useState(null);
  const [found, setFound] = useState(null);
  const [deck, setDeck] = useState([]);
  const [fresh, setFresh] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => save(store), [store]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2600); return () => clearTimeout(t); }, [toast]);
  const go = (s) => transition(() => setScreen(s));

  const keepResources = (res) => {
    const items = ((res && res.flyers) || []).filter((f) => ['resource', 'info', 'recruitment'].includes(f.kind))
      .map((f) => ({ id: uid(), title: f.display_title || f.title_text, place: f.display_place, description: f.description }));
    if (items.length) setStore((s) => ({ ...s, resources: [...items, ...s.resources.filter((r) => !items.some((i) => i.title === r.title))] }));
  };

  const scan = async (dataUrl, fullUrl) => {
    setPhoto(dataUrl); setFound(null); setResult(null);
    go('reading');
    let res;
    try {
      const r = await fetch('/api/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: dataUrl.split(',')[1] }) });
      res = await r.json();
      if (!r.ok) throw new Error(res.error || 'Scan failed');
      res = { ...res, flyers: await cropFlyers(fullUrl, res.flyers || []) };
    } catch (e) {
      console.warn('Scan failed:', e.message);
      go('capture');
      setToast('Couldn\'t read that photo. Try again in a minute.');
      return;
    }
    const d = toDeck(res);
    setResult(res); setDeck(d); setFound(d.length);
    keepResources(res);
    setTimeout(() => {
      if (res.photo_check && res.photo_check.retake_board) go('retake');
      else if (d.length) go('swipe');
      else { go('capture'); setToast('No events found. Try a closer photo.'); }
    }, 900);
  };

  const decide = (ev, kind, pick) => {
    if (kind !== 'keep') return;
    let { start, end, allDay, flags } = ev;
    if (pick) { const r = resolveDate({ ...ev.flyer, date_text: pick }); start = r.start; end = r.end; allDay = r.allDay; flags = r.flags; }
    const saved = { id: ev.id, title: ev.title, kind: ev.kind, place: ev.place, price: ev.price, description: ev.description, evidence: ev.evidence, image: ev.image, start: start && start.toISOString(), end: end && end.toISOString(), allDay, flags, added: false };
    setStore((s) => ({ ...s, events: [...s.events.filter((e) => e.id !== ev.id), saved] }));
    setFresh((f) => [...f, ev.id]);
  };

  const done = () => { go('wallet'); setTimeout(() => setFresh([]), 2400); };

  return (
    <div className="app">
      {screen === 'capture' && <Capture onShot={scan} canClose={store.events.length > 0} onClose={() => go('wallet')} onError={setToast} />}
      {screen === 'reading' && <Reading photo={photo} found={found} />}
      {screen === 'retake' && <Retake photo={photo} check={result && result.photo_check} canUse={deck.length > 0} onRetake={() => go('capture')} onUseAnyway={() => go('swipe')} />}
      {screen === 'swipe' && <Swipe deck={deck} onDecide={decide} onDone={done} onClose={done} />}
      {screen === 'wallet' && <Wallet store={store} freshIds={fresh} toast={toast} onSnap={() => go('capture')}
        onUpdate={(ev) => setStore((s) => ({ ...s, events: s.events.map((e) => (e.id === ev.id ? ev : e)) }))}
        onRemove={(ev) => setStore((s) => ({ ...s, events: s.events.filter((e) => e.id !== ev.id) }))} />}
      {screen === 'capture' && toast && <div style={{ position: 'absolute', left: 0, right: 0, top: 'calc(70px + env(safe-area-inset-top))', display: 'flex', justifyContent: 'center', zIndex: 60, pointerEvents: 'none' }}><div className="rise" style={{ padding: '10px 16px', borderRadius: 9999, background: '#fff', fontSize: 14, fontWeight: 500 }}>{toast}</div></div>}
    </div>
  );
}
