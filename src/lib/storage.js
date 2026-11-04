// Everything lives on the phone for now. No accounts.
const KEY = 'flycatcher:v1';
export function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || { events: [], resources: [], skipped: [] }; }
  catch { return { events: [], resources: [], skipped: [] }; }
}
export function save(state) {
  const events = [...state.events];
  for (;;) {
    try { return void localStorage.setItem(KEY, JSON.stringify({ ...state, events })); }
    catch {
      // Out of room: drop the oldest flyer photo and retry. Private mode runs out of photos and keeps in memory.
      const i = events.findIndex((e) => e.image);
      if (i < 0) return;
      events[i] = { ...events[i], image: null };
    }
  }
}
