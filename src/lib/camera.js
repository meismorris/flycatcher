// iOS asks for permission every time a page requests a new camera stream, so one stream
// stays open for a while after leaving the camera. It's paused meanwhile, and stops for good
// when the time runs out or the app goes to the background.
const KEEP_MS = 5 * 60 * 1000;
const OPTIONS = { video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1440 } }, audio: false };

let stream = null, pending = null, timer = 0, inUse = false;

const isLive = () => stream && stream.getTracks().every((t) => t.readyState === 'live');
const setEnabled = (on) => stream.getTracks().forEach((t) => { t.enabled = on; });

function stop() {
  clearTimeout(timer);
  if (stream) stream.getTracks().forEach((t) => t.stop());
  stream = null;
}

export async function getCamera() {
  inUse = true;
  clearTimeout(timer);
  if (!isLive()) {
    pending = pending || navigator.mediaDevices.getUserMedia(OPTIONS).finally(() => { pending = null; });
    stream = await pending;
  }
  setEnabled(true);
  if (!inUse) releaseCamera(); // the camera screen closed while permission was being asked
  return stream;
}

export function releaseCamera() {
  inUse = false;
  clearTimeout(timer);
  if (!stream) return;
  setEnabled(false);
  timer = setTimeout(stop, KEEP_MS);
}

document.addEventListener('visibilitychange', () => { if (document.hidden && !inUse) stop(); });
