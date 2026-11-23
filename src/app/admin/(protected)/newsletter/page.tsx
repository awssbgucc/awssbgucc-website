import { CheckCircle2, FileText, Mail, Search, Send, UserMinus } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminForm } from '@/components/admin/AdminForm';
import { ConfirmAction } from '@/components/admin/ConfirmAction';
import { SelectField, TextField } from '@/components/admin/fields';
import {
  Empty,
  FilterPills,
  LINK,
  PageHeader,
  Panel,
  StatCard,
  StatusPill,
  TABLE,
  TableWrap,
  TD,
  TH,
  ToggleButton,
} from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { isResendConfigured } from '@/lib/email/newsletter';
import { formatDate } from '@/lib/format';
import { addSubscriber, deleteSubscriber, toggleSubscriberStatus } from './actions';

export const metadata: Metadata = { title: 'Newsletter' };

type Props = { searchParams: Promise<{ tab?: string; q?: string; status?: string }> };

const SUB_STATUSES = [
  { value: 'SUBSCRIBED', label: 'Subscribed' },
  { value: 'UNSUBSCRIBED', label: 'Unsubscribed' },
];

export default async function AdminNewsletterPage({ searchParams }: Props) {
  await requireRole();
  const { tab = 'subscribers', q = '', status = '' } = await searchParams;
  const activeTab = tab === 'campaigns' ? 'campaigns' : 'subscribers';
  const query = q.trim().slice(0, 80);
  const subStatus = status === 'SUBSCRIBED' || status === 'UNSUBSCRIBED' ? status : '';

  const [subscribedCount, unsubscribedCount, sentCount, draftCount, subscribers, campaigns] = await Promise.all([
    db.newsletterSubscriber.count({ where: { status: 'SUBSCRIBED' } }),
    db.newsletterSubscriber.count({ where: { status: 'UNSUBSCRIBED' } }),
    db.newsletterCampaign.count({ where: { status: 'SENT' } }),
    db.newsletterCampaign.count({ where: { status: 'DRAFT' } }),
    db.newsletterSubscriber.findMany({
      where: {
        ...(subStatus ? { status: subStatus } : {}),
        ...(query
          ? {
              OR: [
                { email: { contains: query, mode: 'insensitive' } },
                { name: { contains: query, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { subscribedAt: 'desc' },
      take: 200,
    }),
    db.newsletterCampaign.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
  ]);

  const resendReady = isResendConfigured();

  return (
    <>
      <PageHeader
        title="Newsletter"
        description="Grow your mailing list, export subscribers and send email updates via Resend."
        secondaryAction={{
          href: `/api/admin/newsletter/export?status=${subStatus || 'ALL'}`,
          label: 'Export CSV',
          external: true,
        }}
        action={{ href: '/admin/newsletter/campaigns/new', label: 'Compose update' }}
      />

      {!resendReady && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-strong bg-card px-4 py-3 text-sm">
          <div className="flex items-center gap-2.5 text-text-muted">
            <Mail aria-hidden size={16} className="shrink-0 text-blue" />
            <span>
              Subscriptions are saved in PostgreSQL. Add <code className="font-display text-xs text-text-strong">RESEND_API_KEY</code> and{' '}
              <code className="font-display text-xs text-text-strong">CONTACT_FROM_EMAIL</code> in your environment to send welcome and campaign emails.
            </span>
          </div>
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active subscribers" value={subscribedCount} icon={<CheckCircle2 aria-hidden size={18} />} tone="lime" />
        <StatCard label="Unsubscribed" value={unsubscribedCount} icon={<UserMinus aria-hidden size={18} />} tone="neutral" />
        <StatCard label="Campaigns sent" value={sentCount} icon={<Send aria-hidden size={18} />} tone="blue" />
        <StatCard label="Draft updates" value={draftCount} icon={<FileText aria-hidden size={18} />} tone="purple" />
      </div>

      <FilterPills
        label="Newsletter sections"
        items={[
          { label: 'Subscribers', href: '/admin/newsletter', active: activeTab === 'subscribers', count: subscribedCount + unsubscribedCount },
          { label: 'Campaigns', href: '/admin/newsletter?tab=campaigns', active: activeTab === 'campaigns', count: campaigns.length },
        ]}
      />

      {activeTab === 'subscribers' ? (
        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <form role="search" className="mb-5 flex flex-wrap items-center gap-3 rounded-lg border border-border-strong bg-card p-3.5">
              <div className="relative min-w-[200px] flex-1">
                <Search aria-hidden size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-muted" />
                <label htmlFor="sub-q" className="sr-only">
                  Search subscribers
                </label>
                <input
                  id="sub-q"
                  name="q"
                  defaultValue={query}
                  placeholder="Email or name"
                  className="min-h-10 w-full rounded-md border border-input-border bg-input pr-3 pl-9 text-sm text-text-strong placeholder:text-text-faint focus:border-focus focus:outline-none"
                />
              </div>
              <label htmlFor="sub-status" className="sr-only">
                Status
              </label>
              <select
                id="sub-status"
                name="status"
                defaultValue={subStatus}
                className="min-h-10 rounded-md border border-input-border bg-input px-3 text-sm text-text-strong focus:border-focus focus:outline-none"
              >
                <option value="">All statuses</option>
                <option value="SUBSCRIBED">Subscribed</option>
                <option value="UNSUBSCRIBED">Unsubscribed</option>
              </select>
              <button type="submit" className="min-h-10 rounded-md bg-primary px-4 text-sm font-medium text-on-primary transition-colors hover:bg-primary/90">
                Filter
              </button>
            </form>

            {subscribers.length === 0 ? (
              <Empty>No subscribers match your filters yet.</Empty>
            ) : (
              <TableWrap>
                <table className={TABLE}>
                  <thead>
                    <tr>
                      <th className={TH}>Subscriber</th>
                      <th className={TH}>Source</th>
                      <th className={TH}>Subscribed</th>
                      <th className={TH}>Status</th>
                      <th className={TH}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((sub) => {
                      const active = sub.status === 'SUBSCRIBED';
                      return (
                        <tr key={sub.id}>
                          <td className={TD}>
                            <span className="font-medium text-text-strong">{sub.email}</span>
                            {sub.name && <span className="block text-xs text-text-muted">{sub.name}</span>}
                          </td>
                          <td className={`${TD} font-display text-xs text-text-muted`}>{sub.source}</td>
                          <td className={`${TD} font-display text-xs whitespace-nowrap`}>{formatDate(sub.subscribedAt)}</td>
                          <td className={TD}>
                            <StatusPill published={active} labels={['Unsubscribed', 'Subscribed']} />
                          </td>
                          <td className={TD}>
                            <div className="flex flex-wrap items-center gap-2">
                              <ToggleButton
                                action={toggleSubscriberStatus.bind(null, sub.id, active ? 'UNSUBSCRIBED' : 'SUBSCRIBED')}
                                label={active ? 'Unsubscribe' : 'Resubscribe'}
                              />
                              <ConfirmAction
                                action={deleteSubscriber.bind(null, sub.id)}
                                label="Remove"
                                question={`Remove ${sub.email} from the list?`}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </TableWrap>
            )}
          </div>

          <Panel title="Add subscriber" description="Manually add someone who opted in at an event.">
            <AdminForm action={addSubscriber} submitLabel="Add subscriber" framed={false}>
              <TextField name="email" label="Email address" type="email" />
              <TextField name="name" label="Name" help="Optional." />
              <SelectField name="status" label="Status" options={SUB_STATUSES} defaultValue="SUBSCRIBED" />
            </AdminForm>
          </Panel>
        </div>
      ) : campaigns.length === 0 ? (
        <Empty action={{ href: '/admin/newsletter/campaigns/new', label: 'Compose update' }}>
          No newsletter updates drafted or sent yet.
        </Empty>
      ) : (
        <TableWrap>
          <table className={TABLE}>
            <thead>
              <tr>
                <th className={TH}>Subject</th>
                <th className={TH}>Status</th>
                <th className={TH}>Recipients</th>
                <th className={TH}>Sent / Updated</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td className={TD}>
                    <Link href={`/admin/newsletter/campaigns/${c.id}`} className={LINK}>
                      {c.subject}
                    </Link>
                    {c.previewText && <span className="block text-xs text-text-muted">{c.previewText}</span>}
                  </td>
                  <td className={TD}>
                    <StatusPill published={c.status === 'SENT'} labels={['Draft', 'Sent']} />
                  </td>
                  <td className={`${TD} font-display`}>{c.status === 'SENT' ? c.sentCount : subscribedCount}</td>
                  <td className={`${TD} font-display text-xs whitespace-nowrap`}>
                    {formatDate(c.sentAt ?? c.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}
    </>
  );
}
