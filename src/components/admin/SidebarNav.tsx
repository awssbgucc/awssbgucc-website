'use client';

import {
  Award,
  BarChart3,
  CalendarDays,
  FileText,
  Flag,
  FolderKanban,
  Gift,
  Handshake,
  Inbox,
  LayoutDashboard,
  Mail,
  Megaphone,
  Menu,
  ScrollText,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trophy,
  UserCheck,
  UserCog,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { BrandMark } from '@/components/ui/BrandMark';

export type AdminIconName =
  | 'overview'
  | 'events'
  | 'posts'
  | 'mail'
  | 'megaphone'
  | 'users'
  | 'handshake'
  | 'award'
  | 'sparkles'
  | 'members'
  | 'challenges'
  | 'submissions'
  | 'projects'
  | 'reports'
  | 'rewards'
  | 'achievements'
  | 'rules'
  | 'privacy'
  | 'audit'
  | 'settings'
  | 'userCog';

const ICONS: Record<AdminIconName, LucideIcon> = {
  overview: LayoutDashboard,
  events: CalendarDays,
  posts: FileText,
  mail: Mail,
  megaphone: Megaphone,
  users: Users,
  handshake: Handshake,
  award: Award,
  sparkles: Sparkles,
  members: UserCheck,
  challenges: Flag,
  submissions: Inbox,
  projects: FolderKanban,
  reports: BarChart3,
  rewards: Gift,
  achievements: Trophy,
  rules: SlidersHorizontal,
  privacy: ShieldCheck,
  audit: ScrollText,
  settings: Settings,
  userCog: UserCog,
};

export type NavItem = {
  href: string;
  label: string;
  icon: AdminIconName;
  badge?: number;
  badgeTone?: 'neutral' | 'purple' | 'lime';
};

export type NavGroup = { title: string; links: NavItem[] };

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== '/admin' && pathname.startsWith(`${href}/`));
}

const BADGE_CLASSES = {
  neutral: 'bg-bg-alt text-text-muted border-border',
  purple: 'bg-purple/15 text-purple border-purple/30',
  lime: 'bg-lime/15 text-lime border-lime/30',
};

/** Below lg the links fold behind a Menu button, so a phone opens on the page, not on the link list. */
export function SidebarNav({ groups, footer }: { groups: NavGroup[]; footer: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <div className="flex items-center justify-between gap-4 border-b border-border pb-4 lg:pb-5">
        <BrandMark href="/admin" label="Dashboard" compact />
        <button
          type="button"
          aria-expanded={open}
          aria-controls="admin-menu"
          onClick={() => setOpen(!open)}
          className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border-strong bg-card px-3.5 text-sm font-medium text-text-strong lg:hidden"
        >
          {open ? <X aria-hidden size={16} /> : <Menu aria-hidden size={16} />}
          <span>{open ? 'Close' : 'Menu'}</span>
        </button>
      </div>
      <div id="admin-menu" className={`${open ? 'block' : 'hidden'} pt-4 lg:flex lg:flex-1 lg:flex-col lg:justify-between lg:pt-5`}>
        <nav aria-label="Dashboard" className="flex flex-col gap-5">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="mb-1.5 px-2.5 text-[11px] font-semibold tracking-wider uppercase text-text-faint">{group.title}</p>
              <ul className="space-y-0.5">
                {group.links.map(({ href, label, icon, badge, badgeTone = 'neutral' }) => {
                  const active = isActive(pathname, href);
                  const Icon = ICONS[icon];
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        aria-current={active ? 'page' : undefined}
                        className={`group flex min-h-9 items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
                          active
                            ? 'border border-border-strong bg-card-raised text-text-strong shadow-2xs'
                            : 'border border-transparent text-text-muted hover:bg-hover-tint hover:text-text-strong'
                        }`}
                      >
                        <Icon
                          aria-hidden
                          size={16}
                          className={`shrink-0 transition-colors ${active ? 'text-lime' : 'text-text-muted group-hover:text-text-strong'}`}
                        />
                        <span className="truncate">{label}</span>
                        {badge !== undefined && badge > 0 && (
                          <span
                            className={`ml-auto rounded-full border px-1.5 py-0.5 font-display text-[11px] leading-none tabular-nums ${BADGE_CLASSES[badgeTone]}`}
                          >
                            {badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        {footer}
      </div>
    </>
  );
}
