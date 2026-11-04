import Dither from './Dither.jsx';

// The scanned flyer as dither art, or a plain color block when there's no crop for it.
export default function Poster({ ev, w, h, colors, cell, fit }) {
  if (!ev.image) return <div style={{ width: w, height: h, background: colors[0] }} />;
  return <Dither src={ev.image} w={w} h={h} colors={colors} cell={cell} fit={fit} />;
}
