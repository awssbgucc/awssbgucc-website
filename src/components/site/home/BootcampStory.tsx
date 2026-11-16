import Image from 'next/image';
import type { CSSProperties } from 'react';
import { photo, type PhotoId } from '@/lib/content/media';
import { Cta } from '../Cta';

// Week 3 of the bootcamp, from the group's recap (source S1). The photos carry the bootcamp watermark
// and the 31 Oct filenames; see docs/research/ASSET_INVENTORY.md.
const BEATS: { id: PhotoId; step: string; title: string; text: string }[] = [
  { id: 'facilitators', step: 'Concepts', title: 'Compute and storage, in plain terms', text: 'The session opened with the two services explained through real-life examples.' },
  { id: 'website-on-screen', step: 'The lab', title: 'A Hostel Finder site, live on Amazon S3', text: 'By the end of the session, every participant had the site live on the internet.' },
  { id: 'student-focus', step: 'The errors', title: 'Bucket policies pushed back', text: 'Some configurations and bucket policies failed at first. Participants troubleshot them together until they worked.' },
  { id: 'kahoot', step: 'The podium', title: 'A Kahoot on three weeks of work', text: 'A quiz on everything from the first three weeks, with AWS swag for the podium.' },
];

export function BootcampStory({ recapSlug }: { recapSlug?: string }) {
  return (
    <div className="bootcamp">
      <div className="bootcamp-intro" data-reveal="rise">
        <div>
          <p className="type-label text-lavender">Bootcamp, with CITSA</p>
          <h2 className="section-title">Zero to Cloud Practitioner</h2>
          <p>
            Twelve Saturdays of preparation for the AWS Certified Cloud Practitioner exam (CLF-C02), run with the Computer Science and Information
            Technology Student Association. Sessions mix exam topics with practical work on AWS services. Participants who attend consistently and
            score 70% or higher on the official AWS Skill Builder practice exam are eligible for a certification exam voucher.
          </p>
        </div>
        <dl className="fact-grid fact-grid-tight">
          <div><dt>When</dt><dd>Saturdays, 4:30 to 6:00 PM</dd></div>
          <div><dt>Where</dt><dd>LT5, University of Cape Coast</dd></div>
          <div className="col-span-full"><dt>Length</dt><dd>12 weeks, from Sat 17 Oct 2026</dd></div>
        </dl>
      </div>
      <div className="beats" data-reveal="steps" role="region" aria-label="Week 3 in four photographs" tabIndex={0}>
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
        <p className="type-label text-text-muted">Week 3, Sat 31 Oct 2026</p>
        {recapSlug && <Cta href={`/blog/${recapSlug}`} variant="arrow">Read the week 3 recap</Cta>}
      </div>
    </div>
  );
}
