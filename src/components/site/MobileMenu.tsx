'use client';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Cta } from './Cta';

type Props = { meetupUrl: string; whatsappUrl: string | null; links: { href: string; label: string }[] };

// The sheet closes with a short animation, so closing waits for it unless motion is reduced.
const CLOSE_MS = 220;

export function MobileMenu({ meetupUrl, whatsappUrl, links }: Props) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  const close = useCallback((returnFocus = true) => {
    const element = dialog.current;
    if (!element?.open) return;
    const finish = () => {
      element.removeAttribute('data-closing');
      element.close();
      setOpen(false);
      if (returnFocus) trigger.current?.focus();
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return finish();
    element.setAttribute('data-closing', '');
    window.setTimeout(finish, CLOSE_MS);
  }, []);

  useEffect(() => { close(false); }, [pathname, close]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  const items = [...links, { href: '/partners', label: 'Partners' }, { href: '/contact', label: 'Contact' }];
  return (
    <div className="xl:hidden">
      <button ref={trigger} type="button" aria-expanded={open} aria-controls="mobile-menu" aria-label="Open menu" className="menu-button" onClick={() => { dialog.current?.showModal(); setOpen(true); }}>
        <Menu aria-hidden size={22} />
      </button>
      <dialog
        ref={dialog}
        id="mobile-menu"
        aria-label="Menu"
        className="mobile-sheet"
        onCancel={(event) => { event.preventDefault(); close(); }}
        onKeyDown={(event) => {
          if (event.key !== 'Tab') return;
          const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }}
      >
        <div className="mobile-sheet-top">
          <span className="type-label text-text-muted">AWS SBG UCC</span>
          <button type="button" aria-label="Close menu" className="menu-button" onClick={() => close()}>
            <X size={22} aria-hidden />
          </button>
        </div>
        <nav aria-label="Mobile">
          <ul className="mobile-sheet-links">
            {items.map(({ href, label }, index) => (
              <li key={href} style={{ '--i': index } as React.CSSProperties}>
                <Link href={href} onClick={() => close(false)} aria-current={pathname === href ? 'page' : undefined}>
                  <span className="type-label">{String(index + 1).padStart(2, '0')}</span>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mobile-sheet-actions">
          <Cta href={meetupUrl} variant="mint">Join on Meetup</Cta>
          <Cta href="/builder" variant="line">Builder Portal</Cta>
          {whatsappUrl && <Cta href={whatsappUrl} variant="arrow">WhatsApp community</Cta>}
        </div>
        <div className="mobile-sheet-steps" aria-hidden="true"><span /><span /><span /><span /></div>
      </dialog>
    </div>
  );
}
