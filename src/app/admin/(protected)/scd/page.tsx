import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminForm } from '@/components/admin/AdminForm';
import { SelectField, TextArea, TextField } from '@/components/admin/fields';
import { LINK, PageHeader, StatusPill, ToggleButton } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';
import { getSiteSettings } from '@/lib/content/queries';
import { db } from '@/lib/db';
import { formatDate, formatTime } from '@/lib/format';
import { addScdFaq, addScdSession, addScdSpeaker, deleteScdItem, toggleSpeaker } from './actions';

export const metadata: Metadata = { title: 'Community Day' };

export default async function ScdAdminPage() {
  const admin = await requireRole();
  const [settings, sessions, speakers, faqs] = await Promise.all([
    getSiteSettings(),
    db.scdSession.findMany({ orderBy: [{ startsAt: 'asc' }, { order: 'asc' }] }),
    db.scdSpeaker.findMany({ orderBy: { order: 'asc' } }),
    db.scdFaq.findMany({ orderBy: { order: 'asc' } }),
  ]);
  return (
    <>
      <PageHeader title="Student Community Day" />
      <p className="mb-8 max-w-[62ch] text-sm text-text-muted">
        The page at /scd is {settings.scdPageEnabled ? 'on' : 'off'}. Date, venue, map and registration links, and the switch, are in{' '}
        {admin.role === 'ADMIN' ? (
          <Link href="/admin/settings" className={LINK}>
            Site settings
          </Link>
        ) : (
          'Site settings (admins only)'
        )}
        . Sponsors are partners of type Sponsor. Keep it off until the event is confirmed.
      </p>

      <div className="grid gap-12 xl:grid-cols-3">
        <section>
          <h2 className="mb-3 text-lg font-semibold">Agenda</h2>
          <ul className="mb-6 divide-y divide-border border-y border-border text-sm">
            {sessions.map((s) => (
              <li key={s.id} className="flex items-start justify-between gap-3 py-2">
                <span>
                  <span className="block font-display text-xs text-text-muted">{formatTime(s.startsAt)}</span>
                  {s.title}
                  {s.speaker && <span className="block text-text-muted">{s.speaker}</span>}
                </span>
                <ToggleButton action={deleteScdItem.bind(null, 'session', s.id)} label="Remove" />
              </li>
            ))}
            {sessions.length === 0 && <li className="py-2 text-text-muted">No agenda items.</li>}
          </ul>
          <AdminForm action={addScdSession} submitLabel="Add to agenda">
            <TextField name="title" label="Title" />
            <TextField name="startsAt" label="Starts" type="datetime-local" help="Ghana time." />
            <TextField name="endsAt" label="Ends" type="datetime-local" help="Optional." />
            <TextField name="speaker" label="Speaker" />
            <TextField name="room" label="Room" />
          </AdminForm>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Speakers</h2>
          <ul className="mb-6 divide-y divide-border border-y border-border text-sm">
            {speakers.map((s) => (
              <li key={s.id} className="flex items-start justify-between gap-3 py-2">
                <span>
                  {s.name}
                  <span className="block text-text-muted">
                    {s.role}
                    {s.org && `, ${s.org}`}
                  </span>
                  <StatusPill published={s.status === 'PUBLISHED'} />
                </span>
                <span className="flex flex-col items-end">
                  <ToggleButton action={toggleSpeaker.bind(null, s.id, s.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')} label={s.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'} />
                  <ToggleButton action={deleteScdItem.bind(null, 'speaker', s.id)} label="Remove" />
                </span>
              </li>
            ))}
            {speakers.length === 0 && <li className="py-2 text-text-muted">No speakers. Add only confirmed speakers.</li>}
          </ul>
          <AdminForm action={addScdSpeaker} submitLabel="Add speaker">
            <TextField name="name" label="Name" />
            <TextField name="role" label="Role" />
            <TextField name="org" label="Organisation" />
            <TextField name="linkedin" label="LinkedIn" />
            <SelectField name="status" label="Status" options={[{ value: 'DRAFT', label: 'Draft' }, { value: 'PUBLISHED', label: 'Published' }]} />
          </AdminForm>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">FAQ</h2>
          <ul className="mb-6 divide-y divide-border border-y border-border text-sm">
            {faqs.map((f) => (
              <li key={f.id} className="flex items-start justify-between gap-3 py-2">
                <span>
                  {f.question}
                  <span className="block text-text-muted">{f.answer}</span>
                </span>
                <ToggleButton action={deleteScdItem.bind(null, 'faq', f.id)} label="Remove" />
              </li>
            ))}
            {faqs.length === 0 && <li className="py-2 text-text-muted">No questions yet.</li>}
          </ul>
          <AdminForm action={addScdFaq} submitLabel="Add question">
            <TextField name="question" label="Question" />
            <TextArea name="answer" label="Answer" />
          </AdminForm>
        </section>
      </div>
      {settings.scdDate && <p className="mt-10 text-sm text-text-muted">Date set in Site settings: {formatDate(settings.scdDate)}</p>}
    </>
  );
}
