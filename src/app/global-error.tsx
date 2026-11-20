'use client';

import '@/styles/globals.css';

// Replaces the root layout when that layout itself fails, so it brings its own <html> and <body>.
// No theme script runs here, so it shows the dark theme, the approved baseline.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-GB">
      <body>
        <main className="flex min-h-dvh items-center justify-center bg-bg p-6">
          <div className="flex max-w-md flex-col items-center gap-5 text-center">
            <h1 className="text-2xl font-semibold text-text-strong">The site did not load</h1>
            <p className="text-text-muted">Something went wrong on our side. Try again in a moment.</p>
            <button type="button" onClick={reset} className="inline-flex min-h-11 items-center rounded-sm bg-primary px-5 text-sm font-medium text-on-primary hover:bg-primary/90">
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
