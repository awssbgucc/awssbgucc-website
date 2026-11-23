import { Compass, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { Role } from '@/lib/auth-rules';
import { db } from '@/lib/db';
import { AppearanceRow } from '@/components/ui/ThemeSelector';
import { SidebarNav, type NavGroup } from './SidebarNav';
import { SignOutButton } from './SignOutButton';

export async function Sidebar({ role, email }: { role: Role; email: string }) {
  const [pendingSubmissions, pendingProjects, pendingRedemptions, openPrivacy, activeSubscribers] = await Promise.all([
    db.submission.count({ where: { status: 'PENDING' } }),
    db.project.count({ where: { status: 'PENDING' } }),
    role === 'ADMIN' ? db.redemption.count({ where: { status: 'PENDING' } }) : Promise.resolve(0),
    role === 'ADMIN' ? db.privacyRequest.count({ where: { status: 'OPEN' } }) : Promise.resolve(0),
    db.newsletterSubscriber.count({ where: { status: 'SUBSCRIBED' } }),
  ]);

  // Links are hidden by role for tidiness only. Every page and action checks the role again on the server.
  const allGroups: (NavGroup & { admin?: boolean })[] = [
    {
      title: 'Content',
      links: [
        { href: '/admin', label: 'Overview', icon: 'overview' },
        { href: '/admin/analytics', label: 'Analytics', icon: 'analytics' },
        { href: '/admin/events', label: 'Events and check-in', icon: 'events' },
        { href: '/admin/posts', label: 'Posts', icon: 'posts' },
        { href: '/admin/newsletter', label: 'Newsletter', icon: 'mail', badge: activeSubscribers, badgeTone: 'lime' },
        { href: '/admin/announcements', label: 'Announcements', icon: 'megaphone' },
        { href: '/admin/team', label: 'Team', icon: 'users' },
        { href: '/admin/partners', label: 'Partners', icon: 'handshake' },
        { href: '/admin/certifications', label: 'Certifications', icon: 'award' },
        { href: '/admin/scd', label: 'Community Day', icon: 'sparkles' },
      ],
    },
    {
      title: 'Builders',
      links: [
        { href: '/admin/members', label: 'Members', icon: 'members' },
        { href: '/admin/challenges', label: 'Challenges', icon: 'challenges' },
        { href: '/admin/submissions', label: 'Submissions', icon: 'submissions', badge: pendingSubmissions, badgeTone: 'purple' },
        { href: '/admin/projects', label: 'Projects', icon: 'projects', badge: pendingProjects, badgeTone: 'purple' },
        { href: '/admin/swag', label: 'Swag inventory', icon: 'swag' },
        { href: '/admin/reports', label: 'Reports', icon: 'reports' },
      ],
    },
    {
      title: 'Admins only',
      admin: true,
      links: [
        { href: '/admin/rewards', label: 'Rewards and redemptions', icon: 'rewards', badge: pendingRedemptions, badgeTone: 'purple' },
        { href: '/admin/achievements', label: 'Achievements', icon: 'achievements' },
        { href: '/admin/rules', label: 'XP and credit rules', icon: 'rules' },
        { href: '/admin/privacy', label: 'Privacy requests', icon: 'privacy', badge: openPrivacy, badgeTone: 'purple' },
        { href: '/admin/audit', label: 'Audit log', icon: 'audit' },
        { href: '/admin/settings', label: 'Site settings', icon: 'settings' },
        { href: '/admin/users', label: 'Admin users', icon: 'userCog' },
      ],
    },
  ];

  const groups: NavGroup[] = allGroups
    .filter((group) => !group.admin || role === 'ADMIN')
    .map(({ title, links }) => ({ title, links }));

  const initial = email.trim().charAt(0).toUpperCase() || 'A';

  return (
    <aside className="portal-rail border-b border-border bg-bg p-4 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-68 lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:border-r lg:border-b-0 lg:p-5">
      <SidebarNav
        groups={groups}
        footer={
          <div className="mt-6 space-y-3 border-t border-border pt-4">
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/"
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-xs font-medium text-text-muted transition-colors hover:border-border-strong hover:text-text-strong"
              >
                <ExternalLink aria-hidden size={13} />
                <span>Public site</span>
              </Link>
              <Link
                href="/builder"
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-xs font-medium text-text-muted transition-colors hover:border-border-strong hover:text-text-strong"
              >
                <Compass aria-hidden size={13} />
                <span>Portal</span>
              </Link>
            </div>
            <div className="rounded-md border border-border bg-card p-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-lime/40 bg-lime/10 font-display text-xs font-semibold text-lime">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-text-strong">{email}</p>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">{role === 'ADMIN' ? 'Admin' : 'Editor'}</p>
                </div>
              </div>
              <SignOutButton className="mt-3" />
            </div>
            <AppearanceRow className="px-0.5 pt-1" />
          </div>
        }
      />
    </aside>
  );
}
