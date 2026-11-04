// App-side date reasoning. The AI only copies what's printed; this turns it into real dates.
const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
const DAYS = ['sun','mon','tue','wed','thu','fri','sat'];

function parseTime(t) {
  if (!t) return null;
  const s = t.toLowerCase().replace(/\s+/g, ' ');
  if (/noon/.test(s)) return { start: [12, 0] };
  const re = /(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?/g;
  const parts = [...s.matchAll(re)].filter(m => +m[1] <= 24).slice(0, 2);
  if (!parts.length) return null;
  const mer = parts.map(m => (m[3] || '').replace(/\./g, ''));
  const last = mer[1] || mer[0] || '';
  const toHM = (m, ap) => {
    let h = +m[1]; const mm = +(m[2] || 0);
    ap = ap || last || (h < 8 ? 'pm' : '');
    if (ap === 'pm' && h < 12) h += 12;
    if (ap === 'am' && h === 12) h = 0;
    return [h, mm];
  };
  const out = { start: toHM(parts[0], mer[0]) };
  if (parts[1]) out.end = toHM(parts[1], mer[1]);
  return out;
}

function parseDayList(d) {
  if (!d) return null;
  const s = d.toLowerCase();
  let m = s.match(/(\d{1,2})\s*\/\s*(\d{1,2})(?:\s*\/\s*(\d{2,4}))?/);
  if (m) return { month: +m[1] - 1, day: +m[2], year: m[3] ? (+m[3] < 100 ? 2000 + +m[3] : +m[3]) : null };
  m = s.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*(\d{1,2})(?:st|nd|rd|th)?(?:\s*[-–to]+\s*(\d{1,2}))?(?:,?\s*(\d{4}))?/);
  if (m) return { month: MONTHS.indexOf(m[1]), day: +m[2], endDay: m[3] ? +m[3] : null, year: m[4] ? +m[4] : null };
  m = s.match(/(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/);
  if (m) return { month: MONTHS.indexOf(m[2]), day: +m[1], year: null };
  return null;
}

function weekdayIn(s) {
  if (!s) return -1;
  const m = s.toLowerCase().match(/\b(sun|mon|tue|wed|thu|fri|sat)[a-z]*\b/);
  return m ? DAYS.indexOf(m[1]) : -1;
}

// Returns { start: Date|null, end: Date|null, allDay, flags: [] }
export function resolveDate(flyer, now = new Date()) {
  const flags = [];
  const d = parseDayList(flyer.date_text);
  if (!d) return { start: null, end: null, allDay: true, flags: ['no_date'] };
  let year = d.year;
  if (!year) {
    year = now.getFullYear();
    const guess = new Date(year, d.month, d.day);
    const daysAgo = (now - guess) / 864e5;
    if (daysAgo > 60) year += 1; // a "Jan 12" flyer seen in November means next year
  }
  const t = parseTime(flyer.time_text);
  const start = new Date(year, d.month, d.day, t ? t.start[0] : 0, t ? t.start[1] : 0);
  let end = null;
  if (d.endDay) end = new Date(year, d.month, d.endDay, 23, 59);
  else if (t && t.end) { end = new Date(year, d.month, d.day, t.end[0], t.end[1]); if (end < start) end.setDate(end.getDate() + 1); }
  const wd = weekdayIn(flyer.date_text);
  if (wd >= 0 && wd !== start.getDay()) flags.push('weekday_mismatch');
  if (!t) flags.push('no_time');
  if (d.endDay) flags.push('multi_day');
  return { start, end, allDay: !t, flags };
}

export const fmt = {
  day: (d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
  mon: (d) => d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
  dd: (d) => String(d.getDate()).padStart(2, '0'),
  time: (d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(':00', '').toLowerCase(),
  month: (d) => d.toLocaleDateString('en-US', { month: 'long' })
};

export function relative(d, now = new Date()) {
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const b = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const n = Math.round((b - a) / 864e5);
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n > 1 && n < 7) return `In ${n} days`;
  return null;
}
