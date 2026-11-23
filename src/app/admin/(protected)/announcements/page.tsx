import type { Metadata } from 'next';
import { AdminForm } from '@/components/admin/AdminForm';
import { ConfirmAction } from '@/components/admin/ConfirmAction';
import { SelectField, TextArea, TextField } from '@/components/admin/fields';
import { Empty, PageHeader, Panel, StatusPill } from '@/components/admin/ui';
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
      <PageHeader
        title="Announcements"
        description="Shown on the builder portal home, newest first, three at a time. They expire on the date you set."
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0">
          {announcements.length === 0 ? (
            <Empty>No announcements yet.</Empty>
          ) : (
            <Panel title="All announcements">
              <ul className="divide-y divide-border">
                {announcements.map((a) => (
                  <li key={a.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <a href={`/admin/announcements?edit=${a.id}`} className="font-semibold text-text-strong underline-offset-4 hover:underline">
                        {a.title}
                      </a>
                      <StatusPill published={a.status === 'PUBLISHED'} />
                      {a.expiresAt && <span className="font-display text-xs text-text-muted">until {formatDate(a.expiresAt)}</span>}
                    </div>
                    <p className="mt-1.5 text-sm text-text-muted">{a.body}</p>
                    <div className="mt-3">
                      <ConfirmAction action={deleteAnnouncement.bind(null, a.id)} label="Delete" question="Delete this announcement?" />
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
        <Panel title={editing ? 'Edit announcement' : 'New announcement'}>
          <AdminForm key={editing?.id ?? 'new'} action={saveAnnouncement.bind(null, editing?.id ?? null)} framed={false}>
            <TextField name="title" label="Title" defaultValue={editing?.title} />
            <TextArea name="body" label="Text" defaultValue={editing?.body} help="600 characters at most." />
            <TextField name="href" label="Link" defaultValue={editing?.href} help="Optional." />
            <TextField
              name="expiresAt"
              label="Expires"
              type="datetime-local"
              defaultValue={editing?.expiresAt ? dateToAccraInput(editing.expiresAt) : ''}
              help="Optional. Ghana time."
            />
            <SelectField name="status" label="Status" defaultValue={editing?.status ?? 'DRAFT'} options={STATUSES} />
          </AdminForm>
        </Panel>
      </div>
    </>
  );
}
