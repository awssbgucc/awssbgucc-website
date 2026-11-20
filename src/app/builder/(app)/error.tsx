'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { PageTitle } from '@/components/builder/ui';
import { RetryButton } from '@/components/ui/RetryButton';

// Inside the portal shell, so the navigation stays.
export default function PortalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <>
      <PageTitle label="Error" title="This page did not load" intro="Something went wrong on our side. Try again in a moment." />
      <div className="flex flex-wrap items-center gap-6">
        <RetryButton reset={reset} className="inline-flex min-h-11 items-center rounded-sm bg-primary px-5 text-sm font-medium text-on-primary hover:bg-primary/90 disabled:opacity-60" />
        <Link href="/builder" className="inline-flex min-h-11 items-center text-sm font-medium text-text-muted underline-offset-4 hover:text-text-strong hover:underline">
          Back to your dashboard
        </Link>
      </div>
    </>
  );
}
