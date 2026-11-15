import { describe, expect, it } from 'vitest';
import { agendaRooms, EDITIONS, sessionState, type AgendaSession } from './editions';

const at = (time: string) => new Date(`2026-12-05T${time}:00Z`);
const sessions: AgendaSession[] = [
  { id: 'a', startsAt: at('09:00'), endsAt: at('09:30'), title: 'Opening', speaker: null, room: 'Hall' },
  { id: 'b', startsAt: at('09:30'), endsAt: null, title: 'Track one', speaker: null, room: 'Lab' },
  { id: 'c', startsAt: at('10:30'), endsAt: null, title: 'Track two', speaker: null, room: 'Hall' },
];

describe('agendaRooms', () => {
  it('lists rooms once, in order of first appearance', () => {
    expect(agendaRooms(sessions)).toEqual(['Hall', 'Lab']);
  });
});

describe('sessionState', () => {
  it('uses the end time when there is one', () => {
    expect(sessionState(sessions, 0, at('09:10'))).toBe('live');
    expect(sessionState(sessions, 0, at('09:30'))).toBe('past');
  });
  it('runs an open-ended session until the next one starts', () => {
    expect(sessionState(sessions, 1, at('10:00'))).toBe('live');
    expect(sessionState(sessions, 1, at('10:30'))).toBe('past');
  });
  it('gives the last open-ended session an hour', () => {
    expect(sessionState(sessions, 2, at('11:15'))).toBe('live');
    expect(sessionState(sessions, 2, at('11:31'))).toBe('past');
    expect(sessionState(sessions, 2, at('08:00'))).toBe('upcoming');
  });
});

describe('editions', () => {
  it('lists no invented past editions', () => {
    expect(EDITIONS.scd.past).toEqual([]);
  });
});
