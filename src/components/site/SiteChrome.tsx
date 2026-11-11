import '@/styles/public.css';
import type { ReactNode } from 'react';
import { AnnouncementBar } from './AnnouncementBar';
import { Footer } from './Footer';
import { Nav } from './Nav';
import { RevealObserver } from './RevealObserver';

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div className="public-site">
      <AnnouncementBar />
      <Nav />
      <main id="main">{children}</main>
      <Footer />
      <RevealObserver />
    </div>
  );
}
