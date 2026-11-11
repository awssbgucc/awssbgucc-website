import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminForm } from '@/components/admin/AdminForm';
import { SelectField, TextArea, TextField } from '@/components/admin/fields';
import { LINK, PageHeader } from '@/components/admin/ui';
import { Markdown } from '@/components/site/Markdown';
import { StatusBadge } from '@/components/ui/Badge';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/format';
import { review } from '../actions';

export const metadata: Metadata = { title: 'Review submission' };

type Props = { params: Promise<{ id: string }> };

export default async function ReviewPage({ params }: Props) {
  await requireRole();
  const { id } = await params;
  const submission = await db.submission.findUnique({
    where: { id },
    include: { challenge: true, history: { orderBy: { createdAt: 'desc' } }, user: { select: { email: true, profile: { select: { displayName: true, handle: true } } } } },
  });
  if (!submission) notFound();
  const { challenge } = submission;

  return (
    <>
      <Link href="/admin/submissions" className={`${LINK} mb-2 inline-flex min-h-11 items-center text-sm`}>
        All submissions
      </Link>
      <PageHeader title="Review submission" />
      <div className="grid gap-10 xl:grid-cols-[1fr_420px]">
        <div className="min-w-0">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <StatusBadge status={submission.status} />
            <span className="text-sm text-text-muted">
              {submission.user.profile?.displayName} (@{submission.user.profile?.handle}), updated {formatDate(submission.updatedAt)}
            </span>
          </div>
          <dl className="mb-8 flex flex-col gap-4 text-sm">
            <div>
              <dt className="text-text-muted">Repository</dt>
              <dd>
                <a href={submission.repoUrl} className="break-all underline underline-offset-4">
                  {submission.repoUrl}
                </a>
              </dd>
            </div>
            {submission.demoUrl && (
              <div>
                <dt className="text-text-muted">Live link</dt>
                <dd>
                  <a href={submission.demoUrl} className="break-all underline underline-offset-4">
                    {submission.demoUrl}
                  </a>
                </dd>
              </div>
            )}
            {submission.notes && (
              <div>
                <dt className="text-text-muted">Notes from the member</dt>
                <dd className="whitespace-pre-line text-white">{submission.notes}</dd>
              </div>
            )}
          </dl>
          <h2 className="mb-2 text-lg font-semibold">{challenge.title}: requirements</h2>
          <div className="rounded-md border border-border p-4">
            <Markdown>{challenge.requirements}</Markdown>
          </div>
          <h2 className="mt-8 mb-2 text-lg font-semibold">History</h2>
          <ul className="space-y-2 text-sm">
            {submission.history.map((h) => (
              <li key={h.id} className="flex flex-wrap items-center gap-2">
                <StatusBadge status={h.status} />
                <span className="text-text-muted">
                  {formatDate(h.createdAt)}, {h.actor === 'member' ? 'member' : h.actor}
                  {h.note && `: ${h.note}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          {submission.status === 'APPROVED' ? (
            <p className="text-sm text-text-muted">
              Approved by {submission.reviewedBy}
              {submission.score !== null && `, score ${submission.score} of ${challenge.maxScore}`}. Approval is final; use a balance adjustment on the member page if something was wrong.
            </p>
          ) : (
            <AdminForm action={review.bind(null, submission.id)} submitLabel="Save review">
              <SelectField
                name="status"
                label="Decision"
                defaultValue="APPROVED"
                options={[
                  { value: 'APPROVED', label: 'Approve and award' },
                  { value: 'CHANGES_REQUESTED', label: 'Ask for changes' },
                  { value: 'REJECTED', label: 'Do not accept' },
                ]}
              />
              <TextField name="score" label={`Score, out of ${challenge.maxScore}`} type="number" defaultValue={submission.score} help="Optional. Used for the leaderboard." />
              <TextArea name="feedback" label="Feedback for the member" defaultValue={submission.feedback} rows={5} help="Needed when asking for changes or not accepting." />
            </AdminForm>
          )}
        </div>
      </div>
    </>
  );
}
