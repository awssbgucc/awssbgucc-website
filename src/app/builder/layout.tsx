import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Every portal page is personal, so none is indexed or cached.
export const metadata: Metadata = {
  title: { default: 'Builder portal', template: '%s | Builder portal' },
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function BuilderRootLayout({ children }: { children: ReactNode }) {
  return children;
}
