'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { NAV_LINKS } from './nav-links';

type MobileMenuProps = { meetupUrl: string; whatsappUrl: string | null };

export function MobileMenu({ meetupUrl, whatsappUrl }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen(!open)}
        className="flex size-11 items-center justify-center text-white"
      >
        {open ? <X aria-hidden size={20} /> : <Menu aria-hidden size={20} />}
      </button>
      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 top-[61px] bottom-0 z-50 flex flex-col justify-between bg-bg p-6">
          <nav aria-label="Mobile">
            <ul>
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href} className="border-b border-border">
                  <Link href={href} onClick={() => setOpen(false)} className="flex min-h-14 items-center text-lg font-medium">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex flex-col gap-3">
            <Button href={meetupUrl} className="justify-center">
              Join on Meetup
            </Button>
            {whatsappUrl && (
              <Button href={whatsappUrl} variant="secondary" className="justify-center">
                WhatsApp
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
