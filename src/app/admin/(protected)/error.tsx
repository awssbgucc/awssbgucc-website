'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { PageHeader } from '@/components/admin/ui';
import { RetryButton } from '@/components/ui/RetryButton';

// Inside the dashboard shell. The reference matches the server log entry, so whoever reads the logs can find it.
export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <>
      <PageHeader title="This did not work" />
      <p className="max-w-[62ch] text-text-muted">Something went wrong on the server. Reload the page to see what was saved before trying again.</p>
      {error.digest && <p className="mt-3 font-display text-xs text-text-muted">Reference {error.digest}</p>}
      <div className="mt-6 flex flex-wrap items-center gap-6">
        <RetryButton reset={reset} className="inline-flex min-h-11 items-center rounded-sm bg-primary px-5 text-sm font-medium text-on-primary hover:bg-primary/90 disabled:opacity-60" />
        <Link href="/admin" className="inline-flex min-h-11 items-center text-sm font-medium text-text-muted underline-offset-4 hover:text-text-strong hover:underline">
          Back to the dashboard
        </Link>
      </div>
    </>
  );
}
