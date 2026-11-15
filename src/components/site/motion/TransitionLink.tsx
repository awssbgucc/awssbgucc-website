'use client';

import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { type ComponentProps, type MouseEvent } from 'react';
import { reducedMotion } from '@/lib/motion';

type TransitionDocument = Document & { startViewTransition?: (update: () => Promise<void>) => { finished: Promise<void> } };

// One navigation at a time. NavigationSettled resolves it when the new route has rendered.
let settle: (() => void) | null = null;
export function settleNavigation() {
  settle?.();
  settle = null;
}

/** How long the old page may stay frozen while the next one loads. After this the swap happens without animation. */
const MAX_WAIT_MS = 1600;

function isPlainClick(event: MouseEvent<HTMLAnchorElement>) {
  const target = event.currentTarget.getAttribute('target');
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && (!target || target === '_self');
}

/**
 * next/link with a view transition between routes. Prefetching, history and server rendering are unchanged: the click
 * still ends in router.push, and back and forward stay instant. Elements marked data-vt inside the nearest
 * data-vt-source morph into the elements marked data-vt-dest on the next page, so an event card becomes its page.
 */
export function Link({ onClick, ...props }: ComponentProps<typeof NextLink>) {
  const router = useRouter();
  return (
    <NextLink
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || !isPlainClick(event)) return;
        const doc = document as TransitionDocument;
        const url = new URL(event.currentTarget.href, window.location.href);
        // The portal checks the session on the server first, so it can take a moment. A frozen view transition would
        // hide that wait; instead the link fills in steps while Next navigates as usual.
        if (url.origin === window.location.origin && url.pathname.startsWith('/builder')) {
          event.currentTarget.dataset.pending = 'true';
          return;
        }
        if (!doc.startViewTransition || reducedMotion() || url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
        event.preventDefault();

        const root = document.documentElement;
        const source = event.currentTarget.closest('[data-vt-source]');
        const shared = source ? Array.from(source.querySelectorAll<HTMLElement>('[data-vt]')) : [];
        shared.forEach((element) => { element.style.viewTransitionName = `vt-${element.dataset.vt}`; });
        root.dataset.vt = shared.length > 0 ? 'shared' : 'route';

        const transition = doc.startViewTransition(() => new Promise<void>((resolve) => {
          // The old page has been captured. From here the destination's data-vt-dest elements take the shared names.
          shared.forEach((element) => { element.style.viewTransitionName = ''; });
          root.dataset.vtPhase = 'new';
          settle?.();
          settle = resolve;
          // Only this navigation's own timer may end it, never a later click's.
          window.setTimeout(() => { if (settle === resolve) settleNavigation(); }, MAX_WAIT_MS);
          router.push(url.pathname + url.search + url.hash, { scroll: props.scroll ?? true });
        }));
        transition.finished.finally(() => {
          delete root.dataset.vt;
          delete root.dataset.vtPhase;
        });
      }}
    />
  );
}

export default Link;
