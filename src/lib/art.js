// Turns the small SVG drawing Gemini makes for each event into something the dither can read.
// It only ever loads through an <img>, where browsers don't run scripts or fetch anything.
const SIZE = 400;

function artUrl(svg) {
  const start = svg.indexOf('<svg'), end = svg.lastIndexOf('</svg>');
  if (start < 0 || end < 0) return null;
  const clean = svg.slice(start, end + 6);
  const open = clean.slice(0, clean.indexOf('>'));
  const sized = open.replace(/\s(width|height|xmlns)="[^"]*"/g, '').replace('<svg', `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}"`);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sized + clean.slice(open.length))}`;
}

// Null if the drawing is broken, or the browser won't let a canvas read it.
const checked = (url) => new Promise((ok) => {
  const img = new Image();
  img.onload = () => {
    try {
      const c = document.createElement('canvas');
      c.width = c.height = 1;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, 1, 1);
      ctx.getImageData(0, 0, 1, 1);
      ok(url);
    } catch { ok(null); }
  };
  img.onerror = () => ok(null);
  img.src = url;
});

export async function drawArt(flyers) {
  return Promise.all(flyers.map(async (f) => {
    const url = typeof f.art_svg === 'string' ? artUrl(f.art_svg) : null;
    return { ...f, art: url && await checked(url) };
  }));
}
