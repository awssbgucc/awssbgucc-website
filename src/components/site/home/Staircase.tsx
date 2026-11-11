import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { focusFor } from '@/lib/content/media';
import type { Event } from '@/lib/content/types';
import { dateParts } from '@/lib/format';
import { SbgIcon } from '../SbgIcon';
import { TAG_LABEL, TAG_TONE } from '../tone';

const ICON = { BOOTCAMP: 'ladder', BUILD: 'wrench', TALK: 'speaker', NETWORKING: 'teams', COMMUNITY_DAY: 'teams' } as const;

/**
 * Published events, oldest first, as a staircase: each session is one step higher than the last, like the stepped
 * blocks in the official SBG backgrounds. The next session is the top step, in mint.
 */
export function Staircase({ events, now, recaps }: { events: Event[]; now: Date; recaps: Map<string, string> }) {
  const steps = [...events].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime()).slice(-6);
  if (steps.length === 0) return null;
  return (
    <ol className="staircase" data-reveal="steps" style={{ '--count': steps.length } as CSSProperties}>
      {steps.map((event, index) => {
        const upcoming = event.endsAt > now;
        const when = dateParts(event.startsAt);
        const recap = event.recapPostId ? recaps.get(event.recapPostId) : undefined;
        return (
          <li key={event.id} className="stair" style={{ '--i': index } as CSSProperties}>
            <article className="stair-card">
              <div className="stair-art">
                {event.coverImage ? (
                  <Image src={event.coverImage} alt="" fill sizes="(min-width: 1024px) 220px, 70vw" style={{ objectPosition: focusFor(event.coverImage) }} />
                ) : (
                  <SbgIcon name={ICON[event.tag]} tone={TAG_TONE[event.tag]} size={44} />
                )}
              </div>
              <p className="type-label stair-date">
                {upcoming && <span className="stair-next">Next</span>}
                {when.day} {when.month} {when.year}
              </p>
              <h3>
                <Link href={`/events/${event.slug}`} className="stretched">{event.title.split(':')[0]}</Link>
              </h3>
              <p className="stair-meta">{TAG_LABEL[event.tag]}, {event.format === 'IN_PERSON' ? 'on campus' : 'online'}</p>
              {recap && <Link href={`/blog/${recap}`} className="stair-recap">Read the recap</Link>}
            </article>
            <div className={`stair-block block-${upcoming ? 'mint' : TAG_TONE[event.tag]}`} aria-hidden="true" />
          </li>
        );
      })}
    </ol>
  );
}
