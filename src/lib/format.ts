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
  return `${part('weekday')} ${part('day')} ${part('month')} ${part('year')}`;
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

/** 9:30 AM to 1:00 PM */
export function formatTimeRange(start: Date, end: Date) {
  return `${formatTime(start)} to ${formatTime(end)}`;
}
