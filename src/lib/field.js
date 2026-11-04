// Animated fields for each event kind. Values 0..1 get ordered-dithered into two colors.
export function field(kind, x, y, t) {
const cl = (v) => Math.max(0, Math.min(1, v));
if (kind === 'art') {
const v = (y - 0.16) / 0.66;
let f = 0;
if (v >= 0 && v <= 1) {
let hw = 0;
if (v < 0.05) hw = 0.1; else if (v < 0.18) hw = 0.07 + 0.02 * (v - 0.05) / 0.13; else hw = 0.09 + 0.21 * Math.pow(Math.sin(Math.PI * (v - 0.18) / 0.82), 0.8);
const u = (x - 0.5) / hw;
if (Math.abs(u) <= 1) {
f = 0.28 + 0.42 * (u + 1) / 2 + (Math.abs(u) > 0.86 ? 0.25 : 0);
if (v > 0.48 && v < 0.6) f = Math.sin(Math.asin(Math.max(-1, Math.min(1, u))) * 5 + t * 1.6) > 0 ? 0.92 : 0.18;
}
}
const ex = (x - 0.5) / 0.38, ey = (y - 0.88) / 0.05;
if (ex * ex + ey * ey < 1) f = Math.max(f, 0.4 + 0.3 * (Math.sin(Math.atan2(ey, ex) * 8 + t * 2) > 0 ? 1 : 0));
return f;
}
if (kind === 'music') {
const dx = x - 0.47, dy = y - 0.54, r = Math.hypot(dx, dy), th = Math.atan2(dy, dx);
let f = 0;
if (r < 0.38) {
f = 0.5 + 0.16 * Math.sin(r * 140) + 0.38 * Math.pow(Math.max(0, Math.cos(2 * (th - t * 0.9))), 3);
if (r < 0.12) f = 0.92 - 0.3 * (r < 0.05 ? 1 : 0);
if (r < 0.012) f = 0;
}
const ax = 0.9, ay = 0.1, bx = 0.66, by = 0.44;
const tt = cl(((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / ((bx - ax) * (bx - ax) + (by - ay) * (by - ay)));
if (Math.hypot(x - (ax + tt * (bx - ax)), y - (ay + tt * (by - ay))) < 0.013) f = 0.96;
if (Math.hypot(x - ax, y - ay) < 0.035) f = 0.96;
return cl(f);
}
if (kind === 'market') {
const a = 0.07 * Math.sin(t * 1.2), cx = 0.5, cy = 0.12;
const lx = cx + (x - cx) * Math.cos(a) + (y - cy) * Math.sin(a), ly = cy - (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a);
let f = 0;
const hd = Math.hypot(lx - 0.5, ly - 0.09);
if (Math.abs(hd - 0.04) < 0.008 && ly < 0.11) f = 0.95;
if (Math.abs(lx - 0.5) < 0.006 && ly > 0.12 && ly < 0.16) f = 0.95;
if (Math.abs(lx - 0.5) < 0.27 && Math.abs(ly - (0.16 + Math.abs(lx - 0.5) * 0.3)) < 0.009) f = 0.95;
const inBody = lx > 0.33 && lx < 0.67 && ly > 0.25 && ly < 0.84;
const inSleeve = ly > 0.25 && ly < 0.46 && ((lx > 0.17 && lx < 0.33 && ly > 0.25 + (0.33 - lx) * 0.9) || (lx > 0.67 && lx < 0.83 && ly > 0.25 + (lx - 0.67) * 0.9));
const neck = Math.hypot(lx - 0.5, ly - 0.24) < 0.065;
if ((inBody || inSleeve) && !neck) f = 0.38 + 0.25 * (lx - 0.17) / 0.66 + 0.12 * Math.sin(lx * 46 + ly * 6);
return cl(f);
}
if (kind === 'club') {
let f = 0;
if (y > 0.66) {
const z = 0.22 / (y - 0.6);
const X = (x - 0.5) * z * 9, Z = z * 9 + t * 0.6;
f = ((Math.floor(X) + Math.floor(Z)) % 2 === 0 ? 0.62 : 0.2) * cl(1.4 - z * 0.5);
}
const bob = 0.012 * Math.sin(t * 1.4);
const px = x - 0.5, py = y + bob;
const inHead = Math.hypot(px, py - 0.3) < 0.085;
const inNeck = Math.abs(px) < 0.07 && py > 0.37 && py < 0.42;
const bw = 0.06 + 0.1 * (py - 0.42) / 0.3;
const inBody = py > 0.42 && py < 0.72 && Math.abs(px) < bw;
const inBase = py > 0.72 && py < 0.8 && Math.abs(px) < 0.2;
if (inHead || inNeck || inBody || inBase) f = 0.3 + 0.55 * cl((px + 0.2) / 0.4) + (inNeck ? 0.2 : 0);
const sh = ((x - 0.52) / 0.24) ** 2 + ((y - 0.83) / 0.025) ** 2;
if (sh < 1 && !inBase) f = Math.max(f, 0.75);
return cl(f);
}
if (kind === 'film') {
let f = 0;
const ang = Math.atan2(y - 0.5, x - 0.17);
if (x > 0.17 && Math.abs(ang) < 0.2 + (x - 0.17) * 0.05) {
f = 0.42 * (1 - (x - 0.17) / 0.8);
if (Math.sin(x * 70 + t * 2.4) * Math.sin(y * 60 - t * 1.7) > 0.86) f = 0.95;
}
if (x > 0.62 && x < 0.95 && y > 0.22 && y < 0.72) f = 0.48 + 0.26 * Math.sin(x * 14 - t * 0.8) * Math.cos(y * 9 + t * 0.4) + (x < 0.635 || x > 0.935 || y < 0.235 || y > 0.705 ? 0.4 : 0);
if (x > 0.03 && x < 0.19 && y > 0.42 && y < 0.6) f = 0.88;
if (Math.hypot(x - 0.08, y - 0.38) < 0.045 || Math.hypot(x - 0.15, y - 0.38) < 0.045) f = Math.sin(Math.atan2(y - 0.38, x - (x < 0.115 ? 0.08 : 0.15)) * 3 + t * 2) > 0 ? 0.9 : 0.5;
if (y > 0.6 && y < 0.82 && Math.abs(x - 0.11) < 0.02 + (y - 0.6) * 0.2) f = 0.7;
return cl(f);
}
if (kind === 'sport') {
let f = 0;
if (y > 0.76 && y < 0.92) { const gx = (x * 40) % 1, gy = (y * 40) % 1; if (gx < 0.18 || gy < 0.18) f = 0.6; }
if (y > 0.74 && y < 0.765) f = 0.9;
const bounce = Math.abs(Math.sin(t * 1.5));
const cy = 0.46 - 0.12 * bounce, R = 0.21;
const sh = ((x - 0.5) / (0.18 - 0.05 * bounce)) ** 2 + ((y - 0.72) / 0.02) ** 2;
if (sh < 1) f = Math.max(f, 0.55);
const lx = (x - 0.5) / R, ly = (y - cy) / R, rr = lx * lx + ly * ly;
if (rr < 1) {
f = 0.25 + 0.55 * cl((lx + ly + 1.2) / 2.4);
for (let k = 0; k < 3; k++) { const a = t * 0.7 + k * 2.094; const d = lx * Math.cos(a) + ly * Math.sin(a) + 0.35 * rr; if (Math.abs(d) < 0.07) f = 0.96; }
}
return cl(f);
}
if (kind === 'food') {
let f = 0;
for (let k = 0; k < 3; k++) { const col = 0.38 + k * 0.12 + 0.03 * Math.sin(y * 16 - t * 2 + k); if (y > 0.08 && y < 0.44 && Math.abs(x - col) < 0.014) f = 0.75 * (y - 0.08) / 0.36; }
const bumps = [[0.36, 0.6, 0.09], [0.5, 0.56, 0.1], [0.64, 0.6, 0.09]];
bumps.forEach((b) => { const d = Math.hypot(x - b[0], y - b[1]); if (d < b[2] && y < 0.62) f = 0.32 + 0.3 * cl((x - b[0] + b[2]) / (2 * b[2])) + (Math.sin(Math.atan2(y - b[1], x - b[0]) * 9) > 0.7 ? 0.25 : 0); });
if (y > 0.6 && y < 0.64 && Math.abs(x - 0.5) < 0.37) f = 0.92;
const ex = (x - 0.5) / 0.36, ey = (y - 0.62) / 0.22;
if (y >= 0.64 && ex * ex + ey * ey < 1) f = 0.45 + 0.4 * cl((x - 0.2) / 0.6) + (Math.abs(ey - 0.45) < 0.06 ? 0.2 : 0);
return cl(f);
}
if (kind === 'talk') {
let f = 0;
const rr = (x0, y0, x1, y1, r) => { const qx = Math.max(x0 + r - x, 0, x - (x1 - r)), qy = Math.max(y0 + r - y, 0, y - (y1 - r)); return x > x0 && x < x1 && y > y0 && y < y1 && Math.hypot(qx, qy) < r; };
if (rr(0.1, 0.16, 0.62, 0.48, 0.06) || (y > 0.47 && y < 0.56 && x > 0.18 && x < 0.18 + (0.56 - y) * 1.2)) {
f = 0.3;
[0.25, 0.32, 0.39].forEach((ly, k) => { const len = [0.38, 0.3, 0.2][k]; if (Math.abs(y - ly) < 0.016 && x > 0.17 && x < 0.17 + len) f = 0.72; });
}
if (rr(0.38, 0.42, 0.9, 0.72, 0.06) || (y > 0.71 && y < 0.8 && x < 0.82 && x > 0.82 - (0.8 - y) * 1.2)) {
f = 0.66;
for (let k = 0; k < 3; k++) { if (Math.hypot(x - (0.55 + k * 0.09), y - 0.57) < 0.03) f = Math.sin(t * 4 - k * 1.1) > 0 ? 0.98 : 0.3; }
}
return cl(f);
}
if (kind === 'party') {
const dx = x - 0.5, dy = y - 0.38, r = Math.hypot(dx, dy), th = Math.atan2(dy, dx);
let f = 0;
if (r > 0.22) f = Math.sin(th * 9 + t * 0.6) > 0.82 ? 0.55 * cl(1 - (r - 0.22) / 0.55) : 0;
if (Math.abs(x - 0.5) < 0.006 && y < 0.17) f = 0.9;
if (r < 0.2) {
const lx = dx / 0.2, ly = dy / 0.2;
const lon = Math.asin(Math.max(-1, Math.min(1, lx / Math.sqrt(Math.max(0.0001, 1 - ly * ly))))) + t * 0.5;
const lat = Math.asin(Math.max(-1, Math.min(1, ly)));
const facet = (Math.floor(lon * 4) + Math.floor(lat * 4)) % 2 === 0;
f = (facet ? 0.42 : 0.66) * (0.7 + 0.3 * cl(1 - lx - ly));
if (Math.sin(lon * 23 + lat * 17 + t * 3) > 0.97) f = 1;
}
return cl(f);
}
if (kind === 'outdoors') {
const n = (u, s, fq) => 0.5 * Math.sin(u * fq + s) + 0.3 * Math.sin(u * fq * 2.3 + s * 1.7) + 0.2 * Math.sin(u * fq * 5.1 - s);
const sun = Math.hypot(x - 0.68, y - 0.3) < 0.11 + 0.008 * Math.sin(t * 2) ? 0.55 : 0;
const r1 = 0.52 + 0.06 * n(x, t * 0.12, 6), r2 = 0.64 + 0.07 * n(x, 2 + t * 0.2, 5), r3 = 0.78 + 0.06 * n(x, 5 + t * 0.32, 7);
let v = sun;
if (y > r1) v = 0.32; if (y > r2) v = 0.6; if (y > r3) v = 0.95;
if (y > r1 && y < r2 + 0.04) v -= 0.18 * (0.5 + 0.5 * Math.sin(x * 9 - t * 0.9 + y * 4)) * (1 - (y - r1) / 0.2);
return cl(v);
}
if (kind === 'volunteer') {
const beat = 1 + 0.07 * Math.pow(Math.abs(Math.sin(t * 2)), 8);
const X = (x - 0.5) / (0.27 * beat), Y = -(y - 0.47) / (0.27 * beat);
const h = Math.pow(X * X + Y * Y - 1, 3) - X * X * Y * Y * Y;
let f = 0;
const r = Math.hypot(x - 0.5, y - 0.47);
if (r > 0.33 && Math.sin(r * 34 - t * 3) > 0.85) f = 0.5 * cl(1 - (r - 0.33) / 0.4);
if (h < 0) f = 0.35 + 0.5 * cl((X + 1.2) / 2.4) + (h > -0.06 ? 0.2 : 0);
return cl(f);
}
let f = 0;
if (x > 0.18 && x < 0.82 && y > 0.18 && y < 0.62) {
const inner = x > 0.21 && x < 0.79 && y > 0.21 && y < 0.59;
if (!inner) f = 0.92;
else { const s = y * 26 + t * 1.6; const idx = Math.floor(s); const len = 0.12 + 0.4 * (Math.abs(Math.sin(idx * 12.9898) * 43758.5453) % 1); f = ((s % 1) < 0.5 && x - 0.24 < len && x > 0.24 + 0.04 * (Math.abs(Math.sin(idx * 7.1)) > 0.6 ? 1 : 0)) ? 0.75 : 0.12; }
}
if (y > 0.63 && y < 0.7 && Math.abs(x - 0.5) < 0.36 + (y - 0.63) * 0.9) f = 0.7;
return cl(f);
}