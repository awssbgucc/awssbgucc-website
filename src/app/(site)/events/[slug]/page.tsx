import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EventDetail } from '@/components/site/EventDetail';
import { Section } from '@/components/ui/Section';
import { getEvent, getEvents } from '@/lib/content/queries';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getEvents()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await getEvent((await params).slug);
  return event ? { title: event.title, description: event.summary } : {};
}

export default async function EventPage({ params }: Props) {
  const event = await getEvent((await params).slug);
  if (!event) notFound();
  return (
    <Section>
      <EventDetail event={event} />
    </Section>
  );
}
