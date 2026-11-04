import Dither from './Dither.jsx';

// The real flyer photo, or the category art when there's no crop for it.
export default function Poster({ ev, w, h, colors, cell, fit = 'contain' }) {
  if (!ev.image) return <Dither kind={ev.kind} w={w} h={h} colors={colors} cell={cell} />;
  return <img src={ev.image} alt="" draggable={false} style={{ display: 'block', width: w, height: h, objectFit: fit, objectPosition: 'center top', background: colors[0], pointerEvents: 'none' }} />;
}
