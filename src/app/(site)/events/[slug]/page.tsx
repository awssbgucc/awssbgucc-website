import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EventDetail } from '@/components/site/EventDetail';
import { Section } from '@/components/ui/Section';
import { publishedEvents } from '@/lib/content/selectors';
import { events } from '@/lib/content/static';

type Props = { params: Promise<{ slug: string }> };

function findEvent(slug: string) {
  return publishedEvents(events).find((event) => event.slug === slug);
}

export function generateStaticParams() {
  return publishedEvents(events).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = findEvent((await params).slug);
  return event ? { title: event.title, description: event.summary } : {};
}

export default async function EventPage({ params }: Props) {
  const event = findEvent((await params).slug);
  if (!event) notFound();
  return (
    <Section>
      <EventDetail event={event} />
    </Section>
  );
}
