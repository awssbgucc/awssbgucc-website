const TIME_ZONE = 'Africa/Accra';

/** Sat 14 Nov 2026 */
export function formatDate(date: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value;
  // Some ICU versions write September as Sept; the house style is three letters for every month.
  return `${part('weekday')} ${part('day')} ${part('month')?.slice(0, 3)} ${part('year')}`;
}

/** 9:30 AM */
export function formatTime(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/** 9:30 AM to 1:00 PM. An end equal to the start means no end time was published, so only the start shows. */
export function formatTimeRange(start: Date, end: Date) {
  return end.getTime() === start.getTime() ? formatTime(start) : `${formatTime(start)} to ${formatTime(end)}`;
}

/** The pieces of formatDate, for layouts that set the day large: { weekday: 'Sat', day: '14', month: 'Nov', year: '2026' } */
export function dateParts(date: Date) {
  const [weekday, day, month, year] = formatDate(date).split(' ');
  return { weekday, day, month, year };
}

/** Whole calendar days between two moments, counted in Ghana time. */
function accraDay(date: Date) {
  const [d, m, y] = new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, day: 'numeric', month: 'numeric', year: 'numeric' }).format(date).split('/').map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
}

/** "Today", "Tomorrow", "In 3 days", or null once the day has passed. */
export function countdown(start: Date, now: Date) {
  const days = accraDay(start) - accraDay(now);
  if (days < 0) return null;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}
