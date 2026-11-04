// Everything lives on the phone for now. No accounts.
const KEY = 'flycatcher:v1';
export function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || { events: [], resources: [], skipped: [] }; }
  catch { return { events: [], resources: [], skipped: [] }; }
}
export function save(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode: keep in memory */ }
}
