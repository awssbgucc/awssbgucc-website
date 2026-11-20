'use client';

import { useEffect } from 'react';
import { Container } from '@/components/ui/Container';
import { Cta } from '@/components/site/Cta';
import { RetryButton } from '@/components/ui/RetryButton';

// Inside the public header and footer, laid out like the 404.
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <section className="band band-grid">
      <Container>
        <div className="flex flex-col items-start gap-6 py-10">
          <p className="type-label text-text-muted">Error</p>
          <h1 className="page-title">This page did not load</h1>
          <p className="page-lead">Something went wrong on our side. Try again, or go back to the home page.</p>
          <div className="flex flex-wrap gap-4">
            <RetryButton reset={reset} className="cta cta-solid disabled:opacity-60" />
            <Cta href="/" variant="line">Back to the home page</Cta>
          </div>
        </div>
      </Container>
    </section>
  );
}
