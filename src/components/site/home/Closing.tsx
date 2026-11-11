import { Container } from '@/components/ui/Container';
import { Cta } from '../Cta';
import { PixelMap } from '../PixelMap';
import { SbgIcon, type SbgIconName, type SbgTone } from '../SbgIcon';

const WAYS: { icon: SbgIconName; tone: SbgTone; who: string; what: string }[] = [
  { icon: 'ladder', tone: 'purple', who: 'New to tech', what: 'Start at the bootcamp or a freshers session. Nobody expects you to know AWS yet.' },
  { icon: 'wrench', tone: 'magenta', who: 'Already writing code', what: 'Bring a project to a build session and leave with it deployed.' },
  { icon: 'speaker', tone: 'blue', who: 'Thinking about work', what: 'Hear from people doing the job, and plan a path that suits you.' },
];

/** The invitation, anchored to the place: the map with Cape Coast lit, and three ways in. */
export function Closing({ meetupUrl }: { meetupUrl: string }) {
  return (
    <section className="closing" aria-labelledby="closing-title">
      <Container>
        <div className="closing-layout">
          <div className="closing-copy" data-reveal="rise">
            <p className="type-label text-sbg-mint">Cape Coast, Ghana</p>
            <h2 id="closing-title" className="closing-title">Come build<br />with us.</h2>
            <p className="closing-lead">
              Membership is free and runs through Meetup, where every session is listed first. Already a member? The Builder Portal keeps your
              check-ins, materials and projects in one place.
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
            <PixelMap />
          </div>
        </div>
      </Container>
    </section>
  );
}
