import { flushSync } from 'react-dom';

// Browser-only helpers shared by the motion components. Every caller runs inside an effect or an event handler.
// The motion system itself is described in docs/MOTION_SYSTEM.md.

export function reducedMotion() {
  return typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** A mouse or trackpad, as opposed to touch only. Pointer-led effects run only here. */
export function finePointer() {
  return typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

type TransitionDocument = Document & { startViewTransition?: (update: () => void | Promise<void>) => { finished: Promise<void> } };

/**
 * Runs a state change inside a view transition, so the browser animates between the before and after layouts.
 * Without support, or under reduced motion, the change simply happens. `kind` lets CSS pick the animation.
 */
export function withViewTransition(update: () => void, kind: string) {
  const doc = document as TransitionDocument;
  if (!doc.startViewTransition || reducedMotion()) {
    update();
    return;
  }
  document.documentElement.dataset.vt = kind;
  const transition = doc.startViewTransition(() => flushSync(update));
  transition.finished.finally(() => {
    if (document.documentElement.dataset.vt === kind) delete document.documentElement.dataset.vt;
  });
}

export function supportsViewTransitions() {
  return typeof document !== 'undefined' && 'startViewTransition' in document;
}
