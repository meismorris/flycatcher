// Cheap on-device photo checks for live coach marks. Runs on a tiny frame a few times a second.
export function analyzeFrame(video, canvas) {
  const w = 96, h = Math.round(96 * (video.videoHeight / video.videoWidth || 1.33));
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(video, 0, 0, w, h);
  const px = ctx.getImageData(0, 0, w, h).data;
  const g = new Float32Array(w * h);
  let sum = 0, hot = 0, hotRight = 0;
  for (let i = 0, j = 0; i < px.length; i += 4, j++) {
    const y = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
    g[j] = y; sum += y;
    if (y > 245) { hot++; if (j % w > w / 2) hotRight++; }
  }
  const mean = sum / (w * h);
  let lap = 0, n = 0;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x;
    const v = 4 * g[i] - g[i - 1] - g[i + 1] - g[i - w] - g[i + w];
    lap += v * v; n++;
  }
  const sharp = lap / n;
  const glare = hot / (w * h);
  let state = 'ready';
  if (mean < 50) state = 'dark';
  else if (glare > 0.05) state = 'glare';
  else if (sharp < 60) state = 'blurry';
  return { state, side: hotRight > hot / 2 ? 'right' : 'left', mean, glare, sharp };
}
