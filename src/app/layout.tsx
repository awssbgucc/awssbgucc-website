import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';
import '@/styles/globals.css';

const sans = Geist({ subsets: ['latin'], variable: '--font-sans-face' });
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono-face' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | AWS SBG UCC` },
  description: SITE_DESCRIPTION,
  openGraph: { type: 'website', siteName: SITE_NAME, title: SITE_NAME, description: SITE_DESCRIPTION, locale: 'en_GB' },
};

export const viewport: Viewport = { themeColor: '#161d26' };

export default function RootLayout({ children }: { children: ReactNode }) {
  // The font classes sit on <html> so the @theme font variables resolve at :root.
  return (
    <html lang="en-GB" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
