import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ConfirmAction } from '@/components/admin/ConfirmAction';
import { EventForm } from '@/components/admin/EventForm';
import { LINK, PageHeader } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { deleteEvent } from '../actions';

export const metadata: Metadata = { title: 'Edit event' };

type Props = { params: Promise<{ id: string }> };

export default async function EditEventPage({ params }: Props) {
  await requireRole();
  const { id } = await params;
  const event = await db.event.findUnique({ where: { id } });
  if (!event) notFound();
  return (
    <>
      <PageHeader title="Edit event" />
      <Link href={`/admin/preview/events/${event.id}`} className={`${LINK} mb-6 inline-flex min-h-11 items-center text-sm underline`}>
        Preview this event
      </Link>
      <EventForm event={event} />
      <div className="mt-10 border-t border-border pt-6">
        <ConfirmAction action={deleteEvent.bind(null, event.id)} label="Delete event" question="This cannot be undone." />
      </div>
    </>
  );
}
