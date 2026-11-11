import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminForm } from '@/components/admin/AdminForm';
import { ConfirmAction } from '@/components/admin/ConfirmAction';
import { EventForm } from '@/components/admin/EventForm';
import { SelectField, TextField } from '@/components/admin/fields';
import { GalleryField } from '@/components/admin/GalleryField';
import { LINK, PageHeader, ToggleButton } from '@/components/admin/ui';
import { Badge } from '@/components/ui/Badge';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { deleteEvent } from '../actions';
import { MAX_EVENT_PHOTOS } from '@/lib/uploads/rules';
import { addResource, deleteResource, saveEventPhotos } from '../attendance-actions';

export const metadata: Metadata = { title: 'Edit event' };

type Props = { params: Promise<{ id: string }> };

const KINDS = ['SLIDES', 'REPO', 'LAB', 'RECORDING', 'DOCS', 'OTHER'].map((value) => ({ value, label: value.charAt(0) + value.slice(1).toLowerCase() }));

export default async function EditEventPage({ params }: Props) {
  await requireRole();
  const { id } = await params;
  const event = await db.event.findUnique({ where: { id }, include: { resources: { orderBy: { order: 'asc' } }, _count: { select: { checkIns: true } } } });
  if (!event) notFound();
  return (
    <>
      <PageHeader title="Edit event" />
      <div className="mb-8 flex flex-wrap gap-x-6">
        <Link href={`/admin/preview/events/${event.id}`} className={`${LINK} inline-flex min-h-11 items-center text-sm underline`}>
          Preview this event
        </Link>
        <Link href={`/admin/events/${event.id}/attendance`} className={`${LINK} inline-flex min-h-11 items-center text-sm underline`}>
          Check-in and attendance ({event._count.checkIns})
        </Link>
      </div>
      <EventForm event={event} />

      <section className="mt-12 max-w-[640px] border-t border-border pt-8">
        <h2 className="text-lg font-semibold">Materials</h2>
        <p className="mt-1 text-sm text-text-muted">Slides, repositories and lab guides. Public ones show on the event page; members-only ones show in the portal.</p>
        {event.resources.length > 0 && (
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {event.resources.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-2">
                <span className="min-w-0">
                  <a href={r.url} className="font-medium underline-offset-4 hover:underline">
                    {r.label}
                  </a>{' '}
                  <Badge>{r.kind.toLowerCase()}</Badge> {r.access === 'MEMBERS' && <Badge tone="lavender">members only</Badge>}
                </span>
                <ToggleButton action={deleteResource.bind(null, event.id, r.id)} label="Remove" />
              </li>
            ))}
          </ul>
        )}
        <div className="mt-6">
          <AdminForm action={addResource.bind(null, event.id)} submitLabel="Add material">
            <TextField name="label" label="Label" />
            <TextField name="url" label="Link" />
            <SelectField name="kind" label="Kind" options={KINDS} />
            <SelectField name="access" label="Who can see it" options={[{ value: 'PUBLIC', label: 'Anyone' }, { value: 'MEMBERS', label: 'Signed-in members' }]} />
          </AdminForm>
        </div>
      </section>

      <section className="mt-12 max-w-[640px] border-t border-border pt-8">
        <h2 className="mb-4 text-lg font-semibold">Gallery</h2>
        <AdminForm action={saveEventPhotos.bind(null, event.id)} submitLabel="Save gallery">
          <GalleryField eventId={event.id} initial={event.photos} max={MAX_EVENT_PHOTOS} />
        </AdminForm>
      </section>

      <div className="mt-10 border-t border-border pt-6">
        <ConfirmAction action={deleteEvent.bind(null, event.id)} label="Delete event" question="This also deletes its check-ins, and takes back the XP they gave. It cannot be undone." />
      </div>
    </>
  );
}
