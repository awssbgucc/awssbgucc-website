const DAY = 24 * 60 * 60 * 1000;
const WEEKS = 26;
const CELL = 11;
const GAP = 3;

/**
 * A participation calendar of verified activity only: check-ins, approved work and achievements.
 * Opening the portal never lights a day.
 */
export function ActivityCalendar({ days, now = new Date() }: { days: Date[]; now?: Date }) {
  const key = (date: Date) => date.toISOString().slice(0, 10);
  const counts = new Map<string, number>();
  for (const date of days) counts.set(key(date), (counts.get(key(date)) ?? 0) + 1);

  // Columns are weeks ending this week; rows run Monday to Sunday (Accra is on UTC).
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const mondayOffset = (today.getUTCDay() + 6) % 7;
  const start = new Date(today.getTime() - (mondayOffset + (WEEKS - 1) * 7) * DAY);
  const cells = [];
  for (let week = 0; week < WEEKS; week += 1) {
    for (let day = 0; day < 7; day += 1) {
      const date = new Date(start.getTime() + (week * 7 + day) * DAY);
      if (date > today) continue;
      cells.push({ week, day, date, count: counts.get(key(date)) ?? 0 });
    }
  }
  const activeDays = cells.filter((c) => c.count > 0).length;
  const width = WEEKS * (CELL + GAP) - GAP;
  const height = 7 * (CELL + GAP) - GAP;

  return (
    <figure className="max-w-full overflow-x-auto">
      <svg role="img" aria-label={`Verified activity on ${activeDays} days in the last ${WEEKS} weeks`} viewBox={`0 0 ${width} ${height}`} style={{ width: `${width}px` }} className="block h-auto">
        {cells.map(({ week, day, date, count }) => (
          <rect
            key={key(date)}
            x={week * (CELL + GAP)}
            y={day * (CELL + GAP)}
            width={CELL}
            height={CELL}
            rx={1}
            fill={count === 0 ? 'var(--color-card-raised)' : 'var(--color-lime)'}
            opacity={count === 0 ? 1 : count > 1 ? 1 : 0.6}
          >
            <title>{`${key(date)}: ${count} verified ${count === 1 ? 'activity' : 'activities'}`}</title>
          </rect>
        ))}
      </svg>
      <figcaption className="mt-3 type-label text-text-muted">{activeDays} active days, last 26 weeks</figcaption>
    </figure>
  );
}
