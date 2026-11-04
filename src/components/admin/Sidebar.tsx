import Link from 'next/link';
import type { Role } from '@/lib/auth-rules';
import { SignOutButton } from './SignOutButton';

const LINKS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/team', label: 'Team' },
  { href: '/admin/partners', label: 'Partners' },
  { href: '/admin/posts', label: 'Posts' },
];

const ADMIN_LINKS = [
  { href: '/admin/settings', label: 'Site settings' },
  { href: '/admin/users', label: 'Admin users' },
];

export function Sidebar({ role, email }: { role: Role; email: string }) {
  const links = role === 'ADMIN' ? [...LINKS, ...ADMIN_LINKS] : LINKS;
  return (
    <aside className="border-b border-border bg-bg p-4 lg:sticky lg:top-0 lg:h-dvh lg:w-60 lg:shrink-0 lg:border-r lg:border-b-0 lg:p-6">
      <p className="font-display text-sm font-medium text-white">AWS SBG UCC</p>
      <nav aria-label="Dashboard" className="mt-3 lg:mt-8">
        <ul className="flex flex-wrap gap-x-4 lg:flex-col">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className="flex min-h-11 items-center text-sm font-medium text-text-muted hover:text-white">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-3 lg:mt-8">
        <p className="truncate text-sm text-text-muted">{email}</p>
        <SignOutButton />
      </div>
    </aside>
  );
}
