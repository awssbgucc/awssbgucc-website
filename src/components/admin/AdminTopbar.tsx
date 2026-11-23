'use client';

import { CalendarPlus, ChevronRight, ExternalLink, Send } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Role } from '@/lib/auth-rules';

const SECTION_NAMES: Record<string, string> = {
  events: 'Events and check-in',
  posts: 'Posts',
  newsletter: 'Newsletter',
  announcements: 'Announcements',
  team: 'Team',
  partners: 'Partners',
  certifications: 'Certifications',
  scd: 'Community Day',
  members: 'Members',
  challenges: 'Challenges',
  submissions: 'Submissions',
  projects: 'Projects',
  reports: 'Reports',
  rewards: 'Rewards and redemptions',
  achievements: 'Achievements',
  rules: 'XP and credit rules',
  privacy: 'Privacy requests',
  audit: 'Audit log',
  settings: 'Site settings',
  users: 'Admin users',
  preview: 'Preview',
};

export function AdminTopbar({ role }: { role: Role }) {
  const pathname = usePathname();
  const segments = pathname.replace(/^\/admin\/?/, '').split('/').filter(Boolean);
  const sectionKey = segments[0] ?? '';
  const sectionLabel = sectionKey ? (SECTION_NAMES[sectionKey] ?? sectionKey) : 'Overview';

  return (
    <div className="sticky top-0 z-20 hidden h-14 items-center justify-between gap-4 border-b border-border bg-bg/92 px-8 backdrop-blur lg:flex">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
        <Link href="/admin" className="text-text-muted transition-colors hover:text-text-strong">
          Dashboard
        </Link>
        <ChevronRight aria-hidden size={14} className="text-text-faint" />
        <span className="font-medium text-text-strong">{sectionLabel}</span>
      </nav>
      <div className="flex items-center gap-2">
        <Link
          href="/admin/events/new"
          className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-border-strong bg-card px-3 text-xs font-medium text-text-strong transition-colors hover:border-text-muted hover:bg-card-raised"
        >
          <CalendarPlus aria-hidden size={14} />
          <span>New event</span>
        </Link>
        <Link
          href="/admin/newsletter/campaigns/new"
          className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-border-strong bg-card px-3 text-xs font-medium text-text-strong transition-colors hover:border-text-muted hover:bg-card-raised"
        >
          <Send aria-hidden size={14} />
          <span>Compose newsletter</span>
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-border bg-bg-alt px-3 text-xs font-medium text-text-muted transition-colors hover:border-border-strong hover:text-text-strong"
        >
          <ExternalLink aria-hidden size={13} />
          <span>View site</span>
        </Link>
        <span
          className={`ml-1 rounded-full border px-2.5 py-0.5 font-display text-[11px] font-medium uppercase ${
            role === 'ADMIN' ? 'border-lime/35 bg-lime/10 text-lime' : 'border-blue/35 bg-blue/10 text-blue'
          }`}
        >
          {role}
        </span>
      </div>
    </div>
  );
}
