import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import '@/styles/globals.css';

const sans = Geist({ subsets: ['latin'], variable: '--font-sans-face' });
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono-face' });

export const metadata: Metadata = {
  title: 'AWS Student Builder Group at University of Cape Coast',
  description:
    'Student-led cloud group at the University of Cape Coast. Bootcamps, build sessions and talks on AWS, open to every department.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // The font classes sit on <html> so the @theme font variables resolve at :root.
  return (
    <html lang="en-GB" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
