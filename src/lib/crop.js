// Cuts each flyer out of the board photo using the box Gemini found for it.
const MAX_SIDE = 720, PAD = 0.01;

const loadImage = (src) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });

// box_2d is [ymin, xmin, ymax, xmax], scaled 0-1000. Returns null if there's no usable box.
function cropOne(img, box) {
  if (!Array.isArray(box) || box.length !== 4 || !box.every(Number.isFinite)) return null;
  const [y0, x0, y1, x1] = box.map((n) => n / 1000);
  if (x1 <= x0 || y1 <= y0) return null;
  const W = img.naturalWidth, H = img.naturalHeight;
  const sx = Math.max(0, x0 - PAD) * W, sy = Math.max(0, y0 - PAD) * H;
  const sw = Math.min(1, x1 + PAD) * W - sx, sh = Math.min(1, y1 + PAD) * H - sy;
  const s = Math.min(1, MAX_SIDE / Math.max(sw, sh));
  const c = document.createElement('canvas');
  c.width = Math.round(sw * s); c.height = Math.round(sh * s);
  c.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.72); // small enough that the wallet fits in localStorage
}

export async function cropFlyers(photo, flyers) {
  const img = await loadImage(photo);
  return flyers.map((f) => ({ ...f, image: cropOne(img, f.box_2d) }));
}
