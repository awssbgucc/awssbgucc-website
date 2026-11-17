import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import { NavigationSettled } from '@/components/site/motion/NavigationSettled';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';
import { THEME_COLOURS, THEME_SCRIPT } from '@/lib/theme';
import '@/styles/globals.css';

const sans = localFont({ src: '../../public/fonts/geist-latin.woff2', variable: '--font-sans-face', weight: '100 900', display: 'swap' });
const mono = localFont({ src: '../../public/fonts/geist-mono-latin.woff2', variable: '--font-mono-face', weight: '100 900', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | AWS SBG UCC` },
  description: SITE_DESCRIPTION,
  openGraph: { type: 'website', siteName: SITE_NAME, title: SITE_NAME, description: SITE_DESCRIPTION, locale: 'en_GB' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: THEME_COLOURS.light },
    { media: '(prefers-color-scheme: dark)', color: THEME_COLOURS.dark },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // The font classes sit on <html> so the @theme font variables resolve at :root.
  // The theme script sets data-theme on <html> before the first paint, so React is told to expect that attribute.
  return (
    <html lang="en-GB" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        {children}
        <NavigationSettled />
      </body>
    </html>
  );
}
