'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { RetryButton } from '@/components/ui/RetryButton';

// Catches failures in the public, portal and dashboard layouts themselves, such as the database being unreachable.
// It reads nothing from the database, so it still renders when that is the problem.
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <main className="flex min-h-dvh items-center justify-center bg-bg p-6">
      <div className="flex max-w-md flex-col items-center gap-5 text-center">
        <p className="type-label text-text-muted">Error</p>
        <h1 className="type-section">The site did not load</h1>
        <p className="text-text-muted">Something went wrong on our side. Try again in a moment.</p>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <RetryButton reset={reset} className="inline-flex min-h-11 items-center rounded-sm bg-primary px-5 text-sm font-medium text-on-primary hover:bg-primary/90 disabled:opacity-60" />
          <Link href="/" className="inline-flex min-h-11 items-center text-sm font-medium text-text-muted underline-offset-4 hover:text-text-strong hover:underline">
            Home page
          </Link>
        </div>
      </div>
    </main>
  );
}
