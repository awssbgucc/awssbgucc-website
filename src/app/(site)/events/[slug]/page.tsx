import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EventDetail } from '@/components/site/EventDetail';
import { Container } from '@/components/ui/Container';
import { db } from '@/lib/db';
import { getCheckInCounts, getEvent, getEvents, getPosts, getPublicResources } from '@/lib/content/queries';
import { attendanceFor } from '@/lib/content/selectors';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getEvents()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await getEvent((await params).slug);
  if (!event) return {};
  return { title: event.title, description: event.summary, openGraph: event.coverImage ? { images: [event.coverImage] } : undefined };
}

export default async function EventPage({ params }: Props) {
  const event = await getEvent((await params).slug);
  if (!event) notFound();
  const [resources, posts, checkIns, challenges, events] = await Promise.all([
    getPublicResources(event.id),
    getPosts(),
    getCheckInCounts(),
    db.challenge.findMany({ where: { eventId: event.id, status: 'PUBLISHED' }, select: { slug: true, title: true } }),
    getEvents(),
  ]);
  const recap = posts.find((post) => post.id === event.recapPostId && !post.externalUrl);
  const ordered = [...events].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  const index = ordered.findIndex((e) => e.id === event.id);
  return (
    <section className="band band-top">
      <Container>
        <EventDetail
          event={event}
          attendance={attendanceFor(event, checkIns)}
          resources={resources}
          recap={recap ? { slug: recap.slug, title: recap.title } : null}
          challenges={challenges}
          previous={ordered[index - 1] ?? null}
          next={ordered[index + 1] ?? null}
        />
      </Container>
    </section>
  );
}
