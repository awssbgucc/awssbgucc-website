import type { SbgTone } from '@/components/site/SbgIcon';

/**
 * Special event editions, after the Heapcon pattern: every edition shares one skeleton (hero and facts, agenda,
 * speakers, venue, photos, sponsors, questions, past editions) and only its theme changes. The theme is code, reviewed
 * like any other change; the facts stay in the dashboard. A section with no real content renders nothing, so an
 * unfinished edition can never show placeholders, and the page itself stays behind its own switch (scdPageEnabled for
 * Community Day). See docs/MOTION_SYSTEM.md, "Event editions".
 */
export type EditionTheme = {
  /** Leads the hero blocks, the agenda's live marker is always mint. */
  accent: SbgTone;
  second: SbgTone;
  /** Which signature builds in the hero when there is no official artwork. */
  motif: 'stairs' | 'chip';
  /** Official event artwork, only once supplied and cleared under COMPLIANCE.md. */
  artwork: { src: string; alt: string } | null;
};

export type PastEdition = { year: number; href: string; note: string };

export type Edition = { id: string; name: string; label: string; theme: EditionTheme; past: PastEdition[] };

export const EDITIONS = {
  scd: {
    id: 'scd',
    name: 'AWS Student Builder Groups Student Community Day Cape Coast',
    label: 'Student Community Day',
    theme: { accent: 'purple', second: 'mint', motif: 'stairs', artwork: null },
    // TODO(joel): add past Community Days here once one has happened, with a link to its record.
    past: [],
  },
} satisfies Record<string, Edition>;

export type AgendaSession = { id: string; startsAt: Date; endsAt: Date | null; title: string; speaker: string | null; room: string | null };

/** Rooms in the order they first appear, for the agenda's track filter. Sessions without a room are not a track. */
export function agendaRooms(sessions: AgendaSession[]) {
  return [...new Set(sessions.map((s) => s.room).filter((room): room is string => !!room))];
}

/**
 * Where a session stands at a moment. Without an end time a session counts as running until the next one starts,
 * or for an hour if it is the last.
 */
export function sessionState(sessions: AgendaSession[], index: number, now: Date): 'past' | 'live' | 'upcoming' {
  const session = sessions[index];
  const following = sessions.slice(index + 1).find((s) => s.startsAt > session.startsAt);
  const end = session.endsAt ?? following?.startsAt ?? new Date(session.startsAt.getTime() + 60 * 60 * 1000);
  if (now < session.startsAt) return 'upcoming';
  if (now < end) return 'live';
  return 'past';
}
