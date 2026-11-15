import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import '@/styles/public.css';
import '@/styles/motion.css';
import { EditionAgenda } from '@/components/site/edition/EditionAgenda';
import { EditionHero } from '@/components/site/edition/EditionHero';
import { DisciplineExplorer } from '@/components/site/home/DisciplineExplorer';
import { HeroMosaic } from '@/components/site/home/HeroMosaic';
import { PixelMap } from '@/components/site/PixelMap';
import { Container } from '@/components/ui/Container';
import { FadeOnView } from '@/components/ui/FadeOnView';
import { boardRecords, DISCIPLINES } from '@/lib/content/disciplines';
import { getEvents, getPosts, getSiteSettings } from '@/lib/content/queries';
import { pastEvents, upcomingEvents } from '@/lib/content/selectors';
import { EDITIONS, type Edition } from '@/lib/editions';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = { title: 'Motion concepts', robots: { index: false } };
export const dynamic = 'force-dynamic';

/**
 * Dev only. The three hero concepts from docs/MOTION_SYSTEM.md, each in the hero slot with real content, so they can
 * be compared and recorded side by side; and the event edition layout with sample agenda rows, labelled as samples.
 */
export default async function MotionConcepts() {
  if (process.env.NODE_ENV === 'production') notFound();
  const [s, events, posts] = await Promise.all([getSiteSettings(), getEvents(), getPosts()]);
  const now = new Date();
  const sitePosts = posts.filter((p) => !p.externalUrl);
  const held = [...events].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  // Sample agenda around the current time, so the live marking can be seen. Never shown outside this page.
  const minutes = (m: number) => new Date(now.getTime() + m * 60_000);
  const sample = [
    { id: 'sample-1', startsAt: minutes(-90), endsAt: minutes(-30), title: 'Sample session, finished', speaker: null, room: 'Sample room A' },
    { id: 'sample-2', startsAt: minutes(-30), endsAt: minutes(30), title: 'Sample session, in progress', speaker: 'Sample speaker', room: 'Sample room B' },
    { id: 'sample-3', startsAt: minutes(30), endsAt: null, title: 'Sample session, later', speaker: null, room: 'Sample room A' },
  ];
  const edition: Edition = EDITIONS.scd;

  return (
    <div className="public-site">
      <p className="concept-label">Concept A: connected builders. The technology board in the hero slot.</p>
      <section className="hero" aria-label="Concept A">
        <div className="hero-field" aria-hidden="true" />
        <Container>
          <h1 className="hero-title">A campus of builders.</h1>
          <div className="mt-10"><DisciplineExplorer disciplines={DISCIPLINES} records={boardRecords(DISCIPLINES, events, sitePosts)} /></div>
        </Container>
      </section>

      <p className="concept-label">Concept B: from Cape Coast. The map assembles and lists what happened here.</p>
      <section className="hero" aria-label="Concept B">
        <div className="hero-field" aria-hidden="true" />
        <Container>
          <div className="hero-layout">
            <div>
              <h2 className="hero-title">A campus of builders.</h2>
              <ol className="concept-held">
                {held.map((e) => <li key={e.id}><span className="type-label">{formatDate(e.startsAt)}</span> {e.title.split(':')[0]}</li>)}
              </ol>
            </div>
            <div className="closing-map"><FadeOnView><PixelMap /></FadeOnView></div>
          </div>
        </Container>
      </section>

      <p className="concept-label">Concept C: real builders in motion. Pixel to picture, the build field and the cursor. Chosen.</p>
      <HeroMosaic meetupUrl={s.meetupUrl} next={upcomingEvents(events, now)[0]} latest={pastEvents(events, now)[0]} now={now} />

      <p className="concept-label">Event edition layout, with sample agenda rows.</p>
      <EditionHero edition={edition} facts={[['When', 'Sample date'], ['Where', 'Sample venue'], ['Who', 'Students from every department and level']]} />
      <section className="band"><Container><EditionAgenda sessions={sample} /></Container></section>
    </div>
  );
}
