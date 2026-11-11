'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Marks the section you are in with a mint cell, the same cell that marks Cape Coast on the map. */
export function NavLinks({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <ul className="nav-links">
      {links.map(({ href, label }) => {
        const current = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <li key={href}>
            <Link href={href} aria-current={current ? 'page' : undefined} className="nav-link">
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
