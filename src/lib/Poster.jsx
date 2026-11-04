import Dither from './Dither.jsx';

// Dither art of what the event is, or a plain color block if there's no drawing. Never the scanned flyer.
export default function Poster({ ev, w, h, colors, cell, fit }) {
  if (!ev.art) return <div style={{ width: w, height: h, background: colors[0] }} />;
  return <Dither src={ev.art} w={w} h={h} colors={colors} cell={cell} fit={fit} />;
}
