import { formatDate } from '@/lib/format';

type Session = { id: string; title: string; startsAt: Date };

const CELL = 14;
const GAP = 3;
const PER_ROW = 16;

/**
 * One cell per session the group has run with check-in, oldest first, lit in lime where the member checked in.
 * It echoes the lit Cape Coast cell on the map, and it only ever shows verified attendance.
 */
export function ParticipationGrid({ sessions, attended }: { sessions: Session[]; attended: Set<string> }) {
  const rows = Math.max(1, Math.ceil(sessions.length / PER_ROW));
  const cols = Math.min(PER_ROW, Math.max(sessions.length, 1));
  const width = cols * (CELL + GAP) - GAP;
  const height = rows * (CELL + GAP) - GAP;
  const count = sessions.filter((s) => attended.has(s.id)).length;
  return (
    <figure>
      <svg
        role="img"
        aria-label={`Attended ${count} of ${sessions.length} sessions`}
        viewBox={`0 0 ${width} ${height}`}
        className="block h-auto max-w-full"
        style={{ width: `${width}px` }}
      >
        {sessions.map((session, index) => {
          const lit = attended.has(session.id);
          return (
            <rect
              key={session.id}
              x={(index % PER_ROW) * (CELL + GAP)}
              y={Math.floor(index / PER_ROW) * (CELL + GAP)}
              width={CELL}
              height={CELL}
              fill={lit ? 'var(--color-lime)' : 'var(--color-card-raised)'}
              stroke={lit ? 'none' : 'var(--color-border-strong)'}
              strokeWidth={1}
            >
              <title>{`${session.title}, ${formatDate(session.startsAt)}${lit ? ', attended' : ''}`}</title>
            </rect>
          );
        })}
      </svg>
      <figcaption className="mt-3 type-label text-text-muted">
        {count} of {sessions.length} sessions
      </figcaption>
    </figure>
  );
}
