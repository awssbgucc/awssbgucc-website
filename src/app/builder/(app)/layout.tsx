import Link from 'next/link';
import type { ReactNode } from 'react';
import { SignOutButton } from '@/components/admin/SignOutButton';
import { MobileNav, SidebarNav } from '@/components/builder/ShellNav';
import { Avatar } from '@/components/ui/Avatar';
import { BrandMark } from '@/components/ui/BrandMark';
import { db } from '@/lib/db';
import { isAdminEmail, requireMember } from '@/lib/member';

export default async function BuilderLayout({ children }: { children: ReactNode }) {
  const { user, profile } = await requireMember();
  const [unread, admin] = await Promise.all([db.notification.count({ where: { userId: user.id, readAt: null } }), isAdminEmail(user.email)]);

  const footer = (
    <div className="flex flex-col gap-1 text-sm">
      {admin && (
        <Link href="/admin" className="inline-flex min-h-11 items-center font-medium text-text-muted underline-offset-4 hover:text-white hover:underline">
          Admin dashboard
        </Link>
      )}
      <Link href="/" className="inline-flex min-h-11 items-center font-medium text-text-muted underline-offset-4 hover:text-white hover:underline">
        Public site
      </Link>
      <SignOutButton to="/sign-in" className="self-start" />
    </div>
  );

  return (
    <div className="min-h-dvh bg-bg-alt lg:flex">
      <a href="#portal-main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-sm focus:bg-white focus:px-4 focus:py-2 focus:text-bg">
        Skip to content
      </a>
      <aside className="portal-rail hidden border-r border-border bg-bg lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-64 lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:p-5">
        <div className="px-2">
          <BrandMark href="/builder" label="Builder Portal" compact />
        </div>
        <SidebarNav unread={unread} />
        <div className="mt-auto border-t border-border px-3 pt-4">
          <Link href="/builder/profile" className="flex items-center gap-3 rounded-sm py-2 hover:text-white">
            <Avatar name={profile.displayName} accent={profile.accentKey} frame={profile.frameKey} size="sm" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-white">{profile.displayName}</span>
              <span className="block truncate font-display text-xs text-text-muted">@{profile.handle}</span>
            </span>
          </Link>
          <div className="mt-2">{footer}</div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex min-h-14 items-center justify-between border-b border-border bg-bg/95 px-4 lg:hidden">
        <BrandMark href="/builder" label="Builder Portal" compact />
        <Link href="/builder/profile" aria-label="Your profile" className="flex size-11 items-center justify-center">
          <Avatar name={profile.displayName} accent={profile.accentKey} frame={profile.frameKey} size="sm" />
        </Link>
      </header>

      <main id="portal-main" className="view-in min-w-0 flex-1 px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-[1100px]">{children}</div>
      </main>
      <MobileNav unread={unread} footer={footer} />
    </div>
  );
}
