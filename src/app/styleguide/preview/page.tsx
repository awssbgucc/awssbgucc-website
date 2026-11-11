import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import '@/styles/public.css';
import { EventRow } from '@/components/site/EventRow';
import { EventDetail } from '@/components/site/EventDetail';
import { PostCard } from '@/components/site/PostCard';
import { PostDetail } from '@/components/site/PostDetail';
import { Section } from '@/components/ui/Section';
import type { Event, Post } from '@/lib/content/types';

export const metadata: Metadata = { title: 'Content preview', robots: { index: false } };

// Sample records so event and post layouts can be checked before any real ones exist. Dev only.
const BODY = 'Sample body, for this preview only.\n\n## Sample heading\n\n- First point\n- Second point\n\nA [sample link](/styleguide) and `sample code`.';

const event: Event = {
  id: 'sample-event',
  slug: 'sample',
  title: 'Sample event title for checking the layout',
  tag: 'BUILD',
  format: 'IN_PERSON',
  startsAt: new Date('2030-01-05T09:30:00Z'),
  endsAt: new Date('2030-01-05T13:00:00Z'),
  venue: 'Sample venue',
  summary: 'Sample summary, for this preview only.',
  body: BODY,
  meetupUrl: '/styleguide',
  coverImage: null,
  photos: [],
  attendance: null,
  recapPostId: null,
  checkInCode: null,
  checkInOpensAt: null,
  checkInClosesAt: null,
  status: 'PUBLISHED',
  updatedBy: null,
  createdAt: new Date(0),
  updatedAt: new Date(0),
};

const post: Post = {
  id: 'sample-post',
  slug: 'sample',
  title: 'Sample post title for checking the layout',
  excerpt: 'Sample excerpt, for this preview only.',
  body: BODY,
  externalUrl: null,
  coverImage: null,
  author: 'Sample author',
  publishedAt: new Date('2030-01-05T09:30:00Z'),
  status: 'PUBLISHED',
  updatedBy: null,
  updatedAt: new Date(0),
};

export default function PreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <main className="public-site">
      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          <EventRow event={event} />
          <EventRow event={{ ...event, id: 'sample-past' }} attendance={12} recapSlug="sample" />
          <PostCard post={post} />
          <PostCard post={{ ...post, id: 'sample-external', externalUrl: 'https://www.linkedin.com/pulse/sample' }} />
        </div>
      </Section>
      <Section alt>
        <EventDetail event={event} />
      </Section>
      <Section>
        <PostDetail post={post} />
      </Section>
    </main>
  );
}
