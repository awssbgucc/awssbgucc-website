import type { Metadata } from 'next';
import { EventForm } from '@/components/admin/EventForm';
import { PageHeader } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';

export const metadata: Metadata = { title: 'New event' };

export default async function NewEventPage() {
  await requireRole();
  return (
    <>
      <PageHeader title="New event" />
      <EventForm />
    </>
  );
}
