import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import crest from '@assets/pixel-art/ucc-crest.json';
import chip from '@assets/pixel-art/sbg-chip.json';
import { PixelMap } from '@/components/site/PixelMap';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { FadeOnView } from '@/components/ui/FadeOnView';
import { PixelGrid } from '@/components/ui/PixelGrid';
import { Section } from '@/components/ui/Section';
import { Tag, type EventTag } from '@/components/ui/Tag';

export const metadata: Metadata = { title: 'Styleguide', robots: { index: false } };

const TAGS: EventTag[] = ['BOOTCAMP', 'BUILD', 'TALK', 'NETWORKING', 'COMMUNITY_DAY'];

const SWATCHES = [
  'bg-bg', 'bg-bg-alt', 'bg-card', 'bg-card-raised', 'bg-purple', 'bg-lavender', 'bg-sky', 'bg-cyan', 'bg-lime',
  'bg-logo-purple', 'bg-danger', 'bg-white',
];

// Ratios calculated from the token values. The failures stay visible until the brand kit colours are confirmed.
const CONTRAST_FAILURES = [
  { label: 'Purple on bg-alt, 4.47', classes: 'bg-bg-alt text-purple' },
  { label: 'Purple on card, 4.27', classes: 'bg-card text-purple' },
  { label: 'Purple on card-raised, 3.84', classes: 'bg-card-raised text-purple' },
  { label: 'Faint on bg, 3.68', classes: 'bg-bg text-text-faint' },
  { label: 'Faint on card, 3.32', classes: 'bg-card text-text-faint' },
  { label: 'Faint on card-raised, 2.98', classes: 'bg-card-raised text-text-faint' },
];

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-16 last:mb-0">
      <h2 className="mb-6 text-sm font-medium text-text-muted">{title}</h2>
      {children}
    </div>
  );
}

export default function StyleguidePage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <main>
      <Section>
        <Block title="Hero type and map">
          <div className="grid gap-12 xl:grid-cols-[auto_1fr] xl:items-center">
            <h1 className="type-hero">
              Build from
              <br />
              <span className="text-brand-gradient">Cape Coast.</span>
            </h1>
            <PixelMap />
          </div>
        </Block>
      </Section>

      <Section alt>
        <Block title="Type">
          <Eyebrow>About the group</Eyebrow>
          <p className="type-section mt-3">A place to learn cloud by doing it.</p>
          <p className="mt-4 max-w-[62ch]">
            We run bootcamps, hands-on build sessions and career talks, all built around AWS. Sessions are free and open
            to students from every department and level.
          </p>
          <p className="mt-4 text-sm font-medium text-text-muted">Sat 14 Nov 2026, 9:30 AM to 1:00 PM</p>
        </Block>

        <Block title="Buttons">
          <div className="flex flex-wrap items-center gap-4">
            <Button href="/styleguide">Join on Meetup</Button>
            <Button href="/styleguide" variant="secondary">
              Join the WhatsApp community
            </Button>
            <Button href="/styleguide" variant="text">
              See all events
            </Button>
          </div>
        </Block>

        <Block title="Tags">
          <div className="flex flex-wrap gap-3">
            {TAGS.map((tag) => (
              <Tag key={tag} tag={tag} />
            ))}
          </div>
        </Block>

        <Block title="Card">
          <Card className="max-w-md">
            <div className="flex items-center justify-between gap-4">
              <Tag tag="BUILD" />
              <span className="text-sm font-medium text-text-muted">Sat 14 Nov 2026</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold">From Code to Cloud: Build and Deploy Your First Project on AWS</h3>
            <p className="mt-3 text-sm font-medium text-text-muted">Computer Lab, Science Annex, 9:30 AM</p>
          </Card>
        </Block>

        <Block title="Colour tokens">
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
            {SWATCHES.map((swatch) => (
              <div key={swatch} className={`aspect-square rounded-sm border border-border-strong ${swatch}`} />
            ))}
          </div>
        </Block>

        <Block title="Contrast failures, below 4.5:1">
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {CONTRAST_FAILURES.map(({ label, classes }) => (
              <li key={label} className={`rounded-sm border border-border p-3 text-sm ${classes}`}>
                {label}
              </li>
            ))}
          </ul>
        </Block>
      </Section>

      <Section>
        <div className="grid gap-16 sm:grid-cols-2">
          <Block title="UCC crest, gated by uccCrestApproved outside this page">
            <figure className="w-40 lg:w-60">
              <FadeOnView>
                <PixelGrid data={crest} label="University of Cape Coast crest in pixel art" fade />
              </FadeOnView>
              <figcaption className="mt-3 text-sm font-medium text-text-muted">University of Cape Coast</figcaption>
            </figure>
          </Block>
          <Block title="SBG chip, for the 404 and admin sign-in pages only">
            <div className="w-40 lg:w-60">
              <PixelGrid data={chip} label="AWS Student Builder Group pixel chip" />
            </div>
          </Block>
        </div>
      </Section>
    </main>
  );
}
