'use client';

import { Bell, CalendarDays, FolderGit2, Gift, Home, MoreHorizontal, QrCode, TrendingUp, Trophy, User, Users, X, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { isActive, MOBILE_PRIMARY, NAV_GROUPS, type IconName } from './nav';

const ICONS: Record<IconName, LucideIcon> = {
  home: Home,
  sessions: CalendarDays,
  checkin: QrCode,
  challenges: Trophy,
  projects: FolderGit2,
  progress: TrendingUp,
  rewards: Gift,
  community: Users,
  notifications: Bell,
  profile: User,
};

const ALL = NAV_GROUPS.flatMap((group) => group.items);

function Count({ value }: { value: number }) {
  if (value === 0) return null;
  return (
    <span className="ml-auto rounded-full bg-lime px-1.5 font-display text-[11px] leading-5 font-medium text-bg">
      <span className="sr-only">, </span>
      {value > 99 ? '99+' : value}
      <span className="sr-only"> unread</span>
    </span>
  );
}

export function SidebarNav({ unread }: { unread: number }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Builder portal" className="mt-8 flex flex-col gap-6">
      {NAV_GROUPS.map((group) => (
        <div key={group.title}>
          <p className="type-label px-3 text-text-muted">{group.title}</p>
          <ul className="mt-2">
            {group.items.map(({ href, label, icon }) => {
              const Icon = ICONS[icon];
              const active = isActive(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-10 items-center gap-3 rounded-sm px-3 text-sm font-medium transition-colors duration-150 ease-brand ${active ? 'bg-card-raised text-white' : 'text-text-muted hover:bg-card hover:text-white'}`}
                  >
                    <Icon aria-hidden size={16} className={active ? 'text-lime' : ''} />
                    {label}
                    {icon === 'notifications' && <Count value={unread} />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function MobileNav({ unread, footer }: { unread: number; footer: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const primary = ALL.filter((item) => MOBILE_PRIMARY.includes(item.href));
  const rest = ALL.filter((item) => !MOBILE_PRIMARY.includes(item.href));
  const moreActive = rest.some((item) => isActive(pathname, item.href));

  return (
    <>
      <nav aria-label="Builder portal" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg pb-[env(safe-area-inset-bottom)] lg:hidden">
        <ul className="grid grid-cols-5">
          {primary.map(({ href, label, icon }) => {
            const Icon = ICONS[icon];
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link href={href} aria-current={active ? 'page' : undefined} className={`flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium ${active ? 'text-white' : 'text-text-muted'}`}>
                  <Icon aria-hidden size={18} className={active ? 'text-lime' : ''} />
                  {label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="builder-more"
              onClick={() => setOpen(!open)}
              className={`relative flex min-h-14 w-full flex-col items-center justify-center gap-1 text-[11px] font-medium ${moreActive || open ? 'text-white' : 'text-text-muted'}`}
            >
              {open ? <X aria-hidden size={18} /> : <MoreHorizontal aria-hidden size={18} className={moreActive ? 'text-lime' : ''} />}
              More
              {unread > 0 && <span aria-hidden className="absolute top-2.5 right-[calc(50%-14px)] size-2 rounded-full bg-lime" />}
              {unread > 0 && <span className="sr-only">, {unread} unread notifications</span>}
            </button>
          </li>
        </ul>
      </nav>
      {open && (
        <div id="builder-more" role="dialog" aria-modal="true" aria-label="More pages" className="view-in fixed inset-x-0 top-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-30 flex flex-col justify-between overflow-y-auto bg-bg p-6 lg:hidden">
          <ul>
            {rest.map(({ href, label, icon }) => {
              const Icon = ICONS[icon];
              return (
                <li key={href} className="border-b border-border">
                  <Link href={href} aria-current={isActive(pathname, href) ? 'page' : undefined} className="flex min-h-14 items-center gap-3 text-base font-medium">
                    <Icon aria-hidden size={18} className="text-text-muted" />
                    {label}
                    {icon === 'notifications' && <Count value={unread} />}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-8">{footer}</div>
        </div>
      )}
    </>
  );
}
