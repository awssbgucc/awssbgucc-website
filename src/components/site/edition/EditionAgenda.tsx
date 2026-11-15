'use client';

import { useEffect, useState } from 'react';
import { agendaRooms, sessionState, type AgendaSession } from '@/lib/editions';
import { formatTime } from '@/lib/format';

/**
 * The edition agenda. A room filter appears only when sessions name more than one room. On the day, the session in
 * progress carries the mint cell and "Now", and finished ones dim; the state is worked out in the browser every
 * minute, so the page can stay static. Without JavaScript the full agenda shows with no live marking.
 */
export function EditionAgenda({ sessions }: { sessions: AgendaSession[] }) {
  const rooms = agendaRooms(sessions);
  const [room, setRoom] = useState<string | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const shown = sessions.map((session, index) => ({ session, index })).filter(({ session }) => !room || !session.room || session.room === room);
  return (
    <div className="edition-agenda">
      {rooms.length > 1 && (
        <div role="group" aria-label="Filter by room" className="filter-chips">
          {[null, ...rooms].map((name) => (
            <button key={name ?? 'all'} type="button" aria-pressed={room === name} className="filter-chip" onClick={() => setRoom(name)}>
              {name ?? 'All rooms'}
            </button>
          ))}
        </div>
      )}
      <ol className="agenda-list">
        {shown.map(({ session, index }) => {
          const state = now ? sessionState(sessions, index, now) : 'upcoming';
          return (
            <li key={session.id} className={`agenda-row is-${state}`}>
              <p className="agenda-time">
                {formatTime(session.startsAt)}
                {session.endsAt && <span>{formatTime(session.endsAt)}</span>}
              </p>
              <span className="agenda-cell" aria-hidden="true" />
              <div>
                {state === 'live' && <p className="type-label agenda-now">Now</p>}
                <p className="agenda-title">{session.title}</p>
                {(session.speaker || session.room) && <p className="agenda-meta">{[session.speaker, session.room].filter(Boolean).join(', ')}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
