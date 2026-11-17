import { Container } from '@/components/ui/Container';
import { FadeOnView } from '@/components/ui/FadeOnView';
import { Cta } from '../Cta';
import { PixelMap } from '../PixelMap';
import { SbgIcon, type SbgIconName, type SbgTone } from '../SbgIcon';

const WAYS: { icon: SbgIconName; tone: SbgTone; who: string; what: string }[] = [
  { icon: 'ladder', tone: 'purple', who: 'New to tech', what: 'Start with the bootcamp or one of our talks. Nobody expects you to know AWS yet.' },
  { icon: 'wrench', tone: 'magenta', who: 'Already writing code', what: 'Come to a build session and put a project of your own online.' },
  { icon: 'speaker', tone: 'blue', who: 'Thinking about work', what: 'Hear from people working in cloud about certifications and the paths into the field.' },
];

/** The invitation, anchored to the place: the map with Cape Coast lit, and three ways in. */
export function Closing({ meetupUrl }: { meetupUrl: string }) {
  return (
    <section className="closing" aria-labelledby="closing-title">
      <Container>
        <div className="closing-layout">
          <div className="closing-copy" data-reveal="rise">
            <p className="type-label text-lime">Cape Coast, Ghana</p>
            <h2 id="closing-title" className="closing-title">Come build<br />with us.</h2>
            <p className="closing-lead">
              Membership is free on Meetup, and every event is posted there first. Members can also sign in to the Builder Portal to check in
              at sessions, find materials and share projects.
            </p>
            <div className="closing-actions">
              <Cta href={meetupUrl} variant="mint">Join on Meetup</Cta>
              <Cta href="/builder" variant="line">Open the Builder Portal</Cta>
            </div>
            <ul className="ways">
              {WAYS.map((way) => (
                <li key={way.who}>
                  <SbgIcon name={way.icon} tone={way.tone} size={28} />
                  <div>
                    <strong>{way.who}</strong>
                    <span>{way.what}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="closing-map" id="about">
            {/* The map assembles when it scrolls into view, not at load while it is off screen. */}
            <FadeOnView>
              <PixelMap />
            </FadeOnView>
          </div>
        </div>
      </Container>
    </section>
  );
}
