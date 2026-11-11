'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { BrandMark } from '@/components/ui/BrandMark';

export type NavGroup = { title: string; links: { href: string; label: string }[] };

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== '/admin' && pathname.startsWith(`${href}/`));
}

/** Below lg the links fold behind a Menu button, so a phone opens on the page, not on the link list. */
export function SidebarNav({ groups, footer }: { groups: NavGroup[]; footer: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <BrandMark href="/admin" label="Dashboard" compact />
        <button
          type="button"
          aria-expanded={open}
          aria-controls="admin-menu"
          onClick={() => setOpen(!open)}
          className="min-h-11 rounded-sm border border-border-strong px-4 text-sm font-medium text-white lg:hidden"
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>
      <div id="admin-menu" className={`${open ? 'block' : 'hidden'} lg:block`}>
        <nav aria-label="Dashboard" className="mt-3 flex flex-col gap-4 lg:mt-6">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="type-label text-text-muted">{group.title}</p>
              <ul className="mt-1 flex flex-wrap gap-x-4 lg:flex-col">
                {group.links.map(({ href, label }) => {
                  const active = isActive(pathname, href);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        aria-current={active ? 'page' : undefined}
                        className={`flex min-h-10 items-center text-sm font-medium hover:text-white ${active ? 'text-white underline decoration-lime underline-offset-4' : 'text-text-muted'}`}
                      >
                        {label}
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
