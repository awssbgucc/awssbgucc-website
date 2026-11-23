import {
  Award,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  ClipboardCheck,
  FilePlus2,
  Inbox,
  Mail,
  Send,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { Empty, LINK, PageHeader, Panel, StatCard } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDate, formatTime } from '@/lib/format';

const DAY = 24 * 60 * 60 * 1000;

export default async function OverviewPage() {
  await requireRole();
  const now = new Date();
  const count = (model: { count: (args: { where: { status: 'DRAFT' | 'PUBLISHED' } }) => Promise<number> }) =>
    Promise.all([model.count({ where: { status: 'DRAFT' } }), model.count({ where: { status: 'PUBLISHED' } })]);

  const [events, partners, posts, upcoming, missing, queue, newsletter, contentCounts, recentAudit] = await Promise.all([
    count(db.event),
    count(db.partner),
    count(db.post),
    db.event.findMany({ where: { startsAt: { gt: now } }, orderBy: { startsAt: 'asc' }, take: 3 }),
    db.event.findMany({
      where: { attendance: null, endsAt: { lte: now, gte: new Date(now.getTime() - 14 * DAY) } },
      orderBy: { endsAt: 'desc' },
    }),
    Promise.all([
      db.memberProfile.count({ where: { onboardedAt: { not: null } } }),
      db.checkIn.count({ where: { createdAt: { gte: new Date(now.getTime() - 7 * DAY) } } }),
      db.submission.count({ where: { status: 'PENDING' } }),
      db.project.count({ where: { status: 'PENDING' } }),
      db.redemption.count({ where: { status: 'PENDING' } }),
      db.privacyRequest.count({ where: { status: 'OPEN' } }),
    ]),
    Promise.all([
      db.newsletterSubscriber.count({ where: { status: 'SUBSCRIBED' } }),
      db.newsletterCampaign.count({ where: { status: 'SENT' } }),
    ]),
    Promise.all([
      db.memberCertification.count({ where: { status: 'PUBLISHED' } }),
      db.teamMember.count({ where: { active: true } }),
    ]),
    db.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
  ]);

  const [members, weekCheckIns, pendingSubmissions, pendingProjects, pendingRedemptions, openRequests] = queue;
  const [activeSubscribers, sentCampaigns] = newsletter;
  const [publishedCerts, activeTeam] = contentCounts;

  const todo = [
    { href: '/admin/submissions', label: 'Submissions to review', value: pendingSubmissions },
    { href: '/admin/projects', label: 'Projects to review', value: pendingProjects },
    { href: '/admin/rewards', label: 'Rewards to hand over', value: pendingRedemptions },
    { href: '/admin/privacy', label: 'Privacy requests', value: openRequests },
  ].filter((item) => item.value > 0);
  const totalTodo = todo.reduce((sum, item) => sum + item.value, 0);

  const quickActions = [
    { href: '/admin/events/new', label: 'New event', note: 'Schedule talk, build day or bootcamp', Icon: CalendarPlus },
    { href: '/admin/posts/new', label: 'New post', note: 'Publish a recap or link out', Icon: FilePlus2 },
    { href: '/admin/newsletter/campaigns/new', label: 'Compose newsletter', note: 'Send updates to subscribers', Icon: Send },
    { href: '/admin/certifications/new', label: 'Add certification', note: 'List a verified member badge', Icon: Award },
  ];

  return (
    <>
      <PageHeader
        title="Overview"
        description="Snapshot of campus events, builders, newsletter reach and pending reviews."
        action={{ href: '/admin/events/new', label: 'New event' }}
        secondaryAction={{ href: '/admin/reports', label: 'View reports' }}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Members"
          value={members}
          hint={`${weekCheckIns} check-ins in the last 7 days`}
          icon={<Users aria-hidden size={18} />}
          tone="lime"
          href="/admin/members"
        />
        <StatCard
          label="Newsletter"
          value={activeSubscribers}
          hint={`${sentCampaigns} campaigns sent`}
          icon={<Mail aria-hidden size={18} />}
          tone="blue"
          href="/admin/newsletter"
        />
        <StatCard
          label="Published events"
          value={events[1]}
          hint={`${events[0]} draft`}
          icon={<CalendarDays aria-hidden size={18} />}
          tone="purple"
          href="/admin/events"
        />
        <StatCard
          label="Review queue"
          value={totalTodo}
          hint={totalTodo === 0 ? 'Nothing waiting' : `${todo.length} categories waiting`}
          icon={<Inbox aria-hidden size={18} />}
          tone={totalTodo > 0 ? 'magenta' : 'neutral'}
          href={todo[0]?.href ?? '/admin/submissions'}
        />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map(({ href, label, note, Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-start gap-3 rounded-lg border border-border-strong bg-card p-4 transition-colors hover:border-text-muted hover:bg-card-raised"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-bg-alt text-text-muted transition-colors group-hover:border-lime/40 group-hover:text-lime">
              <Icon aria-hidden size={17} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-strong">{label}</p>
              <p className="mt-0.5 text-xs text-text-muted">{note}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <Panel
            title="Next three events"
            action={
              <Link href="/admin/events" className="text-xs font-medium text-text-muted underline-offset-4 hover:text-text-strong hover:underline">
                All events
              </Link>
            }
          >
            {upcoming.length === 0 ? (
              <Empty action={{ href: '/admin/events/new', label: 'New event' }}>No upcoming events.</Empty>
            ) : (
              <ul className="divide-y divide-border">
                {upcoming.map((event) => (
                  <li key={event.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <Link href={`/admin/events/${event.id}`} className={LINK}>
                        {event.title}
                      </Link>
                      <p className="mt-0.5 font-display text-xs text-text-muted">{formatDate(event.startsAt)}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <Link
                        href={`/admin/events/${event.id}/attendance`}
                        className="inline-flex min-h-8 items-center rounded-md border border-border-strong bg-bg px-2.5 font-medium text-text-strong hover:border-text-muted"
                      >
                        Check-in
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {missing.length > 0 && (
            <Panel
              title="Fill in attendance"
              description="Recent sessions with no headcount recorded yet."
              action={<ClipboardCheck aria-hidden size={16} className="text-text-muted" />}
            >
              <ul className="divide-y divide-border">
                {missing.map((event) => (
                  <li key={event.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                    <Link href={`/admin/events/${event.id}`} className={LINK}>
                      {event.title}
                    </Link>
                    <span className="font-display text-xs text-text-muted">{formatDate(event.startsAt)}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          <Panel title="Content overview" description="Published and draft records across the public site.">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Link href="/admin/posts" className="rounded-md border border-border bg-bg p-3 transition-colors hover:border-border-strong">
                <p className="text-xs text-text-muted">Posts</p>
                <p className="mt-1 font-display text-xl font-semibold text-text-strong">{posts[1]}</p>
                <p className="text-[11px] text-text-muted">{posts[0]} draft</p>
              </Link>
              <Link href="/admin/partners" className="rounded-md border border-border bg-bg p-3 transition-colors hover:border-border-strong">
                <p className="text-xs text-text-muted">Partners</p>
                <p className="mt-1 font-display text-xl font-semibold text-text-strong">{partners[1]}</p>
                <p className="text-[11px] text-text-muted">{partners[0]} draft</p>
              </Link>
              <Link href="/admin/certifications" className="rounded-md border border-border bg-bg p-3 transition-colors hover:border-border-strong">
                <p className="text-xs text-text-muted">Certifications</p>
                <p className="mt-1 font-display text-xl font-semibold text-text-strong">{publishedCerts}</p>
                <p className="text-[11px] text-text-muted">published</p>
              </Link>
              <Link href="/admin/team" className="rounded-md border border-border bg-bg p-3 transition-colors hover:border-border-strong">
                <p className="text-xs text-text-muted">Core team</p>
                <p className="mt-1 font-display text-xl font-semibold text-text-strong">{activeTeam}</p>
                <p className="text-[11px] text-text-muted">active</p>
              </Link>
            </div>
          </Panel>
        </div>

        <div className="space-y-6 lg:col-span-5">
          <Panel title="Waiting for someone" description="Pending reviews and open member requests.">
            {todo.length === 0 ? (
              <div className="flex items-center gap-3 rounded-md border border-lime/30 bg-lime/8 px-4 py-3 text-sm text-text-strong">
                <CheckCircle2 aria-hidden size={18} className="shrink-0 text-lime" />
                <span>Nothing waiting.</span>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {todo.map((item) => (
                  <li key={item.href} className="py-2.5 first:pt-0 last:pb-0">
                    <Link href={item.href} className="flex items-center justify-between gap-3 text-sm font-medium text-text-strong hover:text-lime">
                      <span>{item.label}</span>
                      <span className="rounded-full border border-purple/40 bg-purple/10 px-2.5 py-0.5 font-display text-xs text-purple">
                        {item.value}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel
            title="Recent activity"
            action={
              <Link href="/admin/audit" className="text-xs font-medium text-text-muted underline-offset-4 hover:text-text-strong hover:underline">
                Full log
              </Link>
            }
          >
            {recentAudit.length === 0 ? (
              <p className="text-sm text-text-muted">No recorded actions yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {recentAudit.map((entry) => (
                  <li key={entry.id} className="py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-display font-medium text-text-strong">{entry.action}</span>
                      <span className="font-display text-text-muted">{formatTime(entry.createdAt)}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-text-muted">{entry.actorEmail}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
