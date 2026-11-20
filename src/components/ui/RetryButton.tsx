'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

/**
 * For error pages. Refreshing first asks the server for the page again, so a failed database read is retried,
 * not only the browser's part of the page.
 */
export function RetryButton({ reset, className }: { reset: () => void; className: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(() => {
          router.refresh();
          reset();
        })
      }
      className={className}
    >
      {pending ? 'Trying again' : 'Try again'}
    </button>
  );
}
