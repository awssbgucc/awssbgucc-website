import type { Metadata } from 'next';
import { AdminForm } from '@/components/admin/AdminForm';
import { ConfirmAction } from '@/components/admin/ConfirmAction';
import { SelectField, TextArea, TextField } from '@/components/admin/fields';
import { Empty, PageHeader, StatusPill } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/format';
import { dateToAccraInput } from '@/lib/validation/shared';
import { deleteAnnouncement, saveAnnouncement } from './actions';

export const metadata: Metadata = { title: 'Announcements' };

const STATUSES = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
];

type Props = { searchParams: Promise<{ edit?: string }> };

// Announcements show on members' portal home. The public site keeps its one-line bar in Site settings.
export default async function AnnouncementsPage({ searchParams }: Props) {
  await requireRole();
  const { edit } = await searchParams;
  const announcements = await db.announcement.findMany({ orderBy: { createdAt: 'desc' } });
  const editing = announcements.find((a) => a.id === edit);

  return (
    <>
      <PageHeader title="Announcements" />
      <p className="mb-8 max-w-[62ch] text-sm text-text-muted">Shown on the builder portal home, newest first, three at a time. They expire on the date you set.</p>
      <div className="grid gap-12 xl:grid-cols-[1fr_480px]">
        <div>
          {announcements.length === 0 ? (
            <Empty>No announcements yet.</Empty>
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {announcements.map((a) => (
                <li key={a.id} className="py-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <a href={`/admin/announcements?edit=${a.id}`} className="font-semibold underline-offset-4 hover:underline">
                      {a.title}
                    </a>
                    <StatusPill published={a.status === 'PUBLISHED'} />
                    {a.expiresAt && <span className="text-xs text-text-muted">until {formatDate(a.expiresAt)}</span>}
                  </div>
                  <p className="mt-1 text-sm text-text-muted">{a.body}</p>
                  <div className="mt-2">
                    <ConfirmAction action={deleteAnnouncement.bind(null, a.id)} label="Delete" question="Delete this announcement?" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <section>
          <h2 className="mb-4 text-lg font-semibold">{editing ? 'Edit announcement' : 'New announcement'}</h2>
          <AdminForm key={editing?.id ?? 'new'} action={saveAnnouncement.bind(null, editing?.id ?? null)}>
            <TextField name="title" label="Title" defaultValue={editing?.title} />
            <TextArea name="body" label="Text" defaultValue={editing?.body} help="600 characters at most." />
            <TextField name="href" label="Link" defaultValue={editing?.href} help="Optional." />
            <TextField name="expiresAt" label="Expires" type="datetime-local" defaultValue={editing?.expiresAt ? dateToAccraInput(editing.expiresAt) : ''} help="Optional. Ghana time." />
            <SelectField name="status" label="Status" defaultValue={editing?.status ?? 'DRAFT'} options={STATUSES} />
          </AdminForm>
        </section>
      </div>
    </>
  );
}
