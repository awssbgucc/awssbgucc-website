import Image from 'next/image';
import type { CSSProperties } from 'react';
import { photo, type PhotoId } from '@/lib/content/media';
import { Cta } from '../Cta';

// Four real bootcamp photographs illustrating what happens in a typical session and what participants can expect.
const BEATS: { id: PhotoId; step: string; title: string; text: string }[] = [
  { id: 'facilitators', step: 'Concepts', title: 'Cloud fundamentals, explained plainly', text: 'Sessions open with core AWS services and exam topics broken down through everyday examples, with no prior cloud background assumed.' },
  { id: 'website-on-screen', step: 'Hands-on labs', title: 'Deploying real projects on AWS', text: 'Participants move from concepts straight into the AWS console, deploying live web projects such as a Hostel Finder site on Amazon S3.' },
  { id: 'student-focus', step: 'Troubleshooting', title: 'Working through real errors together', text: 'When configurations or bucket policies fail, facilitators and classmates debug them together until everyone gets their setup working.' },
  { id: 'kahoot', step: 'Review quizzes', title: 'Checking what stuck with a quiz', text: 'Sessions wrap up with interactive Kahoot quizzes covering recent topics, with AWS swag for top scorers.' },
];

export function BootcampStory({ recapSlug }: { recapSlug?: string }) {
  return (
    <div className="bootcamp">
      <div className="bootcamp-intro" data-reveal="rise">
        <div>
          <p className="type-label text-lavender">Bootcamp, with CITSA</p>
          <h2 className="section-title">Zero to Cloud Practitioner</h2>
          <p>
            A 12-week programme with the Computer Science and Information Technology Student Association (CITSA) that prepares students for the AWS
            Certified Cloud Practitioner exam (CLF-C02), with practical work on AWS in every session.
          </p>
        </div>
        <dl className="fact-grid fact-grid-tight">
          <div><dt>When</dt><dd>Saturdays, 4:30 to 6:00 PM</dd></div>
          <div><dt>Where</dt><dd>LT5, University of Cape Coast</dd></div>
          <div className="col-span-full"><dt>Length</dt><dd>12 weeks, from Sat 17 Oct 2026</dd></div>
        </dl>
      </div>
      <div className="beats" data-reveal="steps" role="region" aria-label="What happens in a bootcamp session" tabIndex={0}>
        {BEATS.map((beat, index) => {
          const image = photo(beat.id);
          return (
            <figure key={beat.id} className="beat" style={{ '--i': index } as CSSProperties}>
              <div className="beat-photo">
                <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 40vw, 90vw" />
              </div>
              <figcaption>
                <span className="type-label">{String(index + 1).padStart(2, '0')} / {beat.step}</span>
                <strong>{beat.title}</strong>
                <span className="beat-text">{beat.text}</span>
              </figcaption>
            </figure>
          );
        })}
      </div>
      <div className="bootcamp-foot">
        <p className="type-label text-text-muted">What to expect at each session</p>
        <div className="flex flex-wrap items-center gap-6">
          <Cta href="/events#bootcamp" variant="arrow">Schedule and voucher terms</Cta>
          {recapSlug && <Cta href={`/blog/${recapSlug}`} variant="arrow">Read a session recap</Cta>}
        </div>
      </div>
    </div>
  );
}
