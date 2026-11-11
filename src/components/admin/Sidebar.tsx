import Link from 'next/link';
import type { Role } from '@/lib/auth-rules';
import { SidebarNav } from './SidebarNav';
import { SignOutButton } from './SignOutButton';

// Links are hidden by role for tidiness only. Every page and action checks the role again on the server.
const GROUPS: { title: string; admin?: boolean; links: { href: string; label: string }[] }[] = [
  {
    title: 'Content',
    links: [
      { href: '/admin', label: 'Overview' },
      { href: '/admin/events', label: 'Events and check-in' },
      { href: '/admin/posts', label: 'Posts' },
      { href: '/admin/announcements', label: 'Announcements' },
      { href: '/admin/team', label: 'Team' },
      { href: '/admin/partners', label: 'Partners' },
      { href: '/admin/scd', label: 'Community Day' },
    ],
  },
  {
    title: 'Builders',
    links: [
      { href: '/admin/members', label: 'Members' },
      { href: '/admin/challenges', label: 'Challenges' },
      { href: '/admin/submissions', label: 'Submissions' },
      { href: '/admin/projects', label: 'Projects' },
      { href: '/admin/reports', label: 'Reports' },
    ],
  },
  {
    title: 'Admins only',
    admin: true,
    links: [
      { href: '/admin/rewards', label: 'Rewards and redemptions' },
      { href: '/admin/achievements', label: 'Achievements' },
      { href: '/admin/rules', label: 'XP and credit rules' },
      { href: '/admin/privacy', label: 'Privacy requests' },
      { href: '/admin/audit', label: 'Audit log' },
      { href: '/admin/settings', label: 'Site settings' },
      { href: '/admin/users', label: 'Admin users' },
    ],
  },
];

export function Sidebar({ role, email }: { role: Role; email: string }) {
  const groups = GROUPS.filter((group) => !group.admin || role === 'ADMIN');
  return (
    <aside className="portal-rail border-b border-border bg-bg p-4 lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:shrink-0 lg:overflow-y-auto lg:border-r lg:border-b-0 lg:p-6">
      <SidebarNav
        groups={groups}
        footer={
          <div className="mt-4 border-t border-border pt-4 lg:mt-8">
            <Link href="/builder" className="flex min-h-10 items-center text-sm font-medium text-text-muted hover:text-white">
              Builder portal
            </Link>
            <p className="truncate text-sm text-text-muted">{email}</p>
            <SignOutButton />
          </div>
        }
      />
    </aside>
  );
}
