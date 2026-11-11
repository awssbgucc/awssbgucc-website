import type { EventTag } from '@/lib/content/types';
import type { SbgTone } from './SbgIcon';

/** One meaning per palette colour across the site: see docs/research/CREATIVE_DIRECTION.md. */
export const TAG_TONE: Record<EventTag, SbgTone> = {
  BOOTCAMP: 'purple',
  BUILD: 'magenta',
  TALK: 'blue',
  NETWORKING: 'mint',
  COMMUNITY_DAY: 'blue',
};

export const TAG_LABEL: Record<EventTag, string> = {
  BOOTCAMP: 'Bootcamp',
  BUILD: 'Build session',
  TALK: 'Talk',
  NETWORKING: 'Networking',
  COMMUNITY_DAY: 'Community Day',
};
