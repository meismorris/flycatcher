// Build a .ics file so "Add" opens the phone's own calendar.
const pad = (n) => String(n).padStart(2, '0');
const stamp = (d, allDay) => allDay
  ? `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
  : `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
const esc = (s) => String(s || '').replace(/[,;\\]/g, (m) => '\\' + m).replace(/\n/g, '\\n');

export function downloadIcs(ev) {
  const start = new Date(ev.start);
  const allDay = ev.allDay;
  const end = ev.end ? new Date(ev.end) : new Date(start.getTime() + (allDay ? 864e5 : 3600e3));
  const alarm = 'BEGIN:VALARM\nTRIGGER:-P1D\nACTION:DISPLAY\nDESCRIPTION:Tomorrow\nEND:VALARM';
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//FlyCatcher//EN', 'BEGIN:VEVENT',
    `UID:${ev.id}@flycatcher`, `DTSTAMP:${stamp(new Date(), false)}`,
    allDay ? `DTSTART;VALUE=DATE:${stamp(start, true)}` : `DTSTART:${stamp(start, false)}`,
    allDay ? `DTEND;VALUE=DATE:${stamp(end, true)}` : `DTEND:${stamp(end, false)}`,
    `SUMMARY:${esc(ev.title)}`, `LOCATION:${esc(ev.place)}`, `DESCRIPTION:${esc(ev.description || 'Caught with FlyCatcher')}`,
    alarm, 'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const a = document.createElement('a');
  a.href = url; a.download = `${ev.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.ics`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
