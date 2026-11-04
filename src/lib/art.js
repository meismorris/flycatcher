// Draws the icon Gemini picked for each event, ready for the dither.
import { ICONS } from './icons.js';
import { kindFor } from './kinds.js';

const SIZE = 256;
// Used when Gemini's pick isn't in the list.
const BY_KIND = { art: 'palette', music: 'music', market: 'storefront', club: 'account-group', film: 'movie-open', sport: 'trophy', food: 'silverware-fork-knife', talk: 'account-voice', party: 'party-popper', outdoors: 'pine-tree', volunteer: 'hand-heart', tech: 'laptop' };

function iconArt(name, category) {
  const d = ICONS[name] || ICONS[BY_KIND[kindFor(category)]];
  const c = document.createElement('canvas');
  c.width = c.height = SIZE;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, SIZE, SIZE);
  // The gradient gives the dither a range of tones, so icons aren't flat blocks of one color.
  const shade = ctx.createLinearGradient(0, SIZE, SIZE, 0);
  shade.addColorStop(0, '#000');
  shade.addColorStop(1, '#7a7a7a');
  ctx.fillStyle = shade;
  ctx.scale(SIZE / 24, SIZE / 24);
  ctx.fill(new Path2D(d));
  return c.toDataURL('image/png');
}

export const withArt = (flyers) => flyers.map((f) => ({
  ...f,
  art: f.kind === 'event' || f.kind === 'deadline' ? iconArt(f.art_icon, f.category) : null
}));
