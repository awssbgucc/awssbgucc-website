import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EventDetail } from '@/components/site/EventDetail';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';

export const metadata: Metadata = { title: 'Preview' };

type Props = { params: Promise<{ id: string }> };

export default async function EventPreviewPage({ params }: Props) {
  await requireRole();
  const event = await db.event.findUnique({ where: { id: (await params).id } });
  if (!event) notFound();
  return <EventDetail event={event} />;
}
