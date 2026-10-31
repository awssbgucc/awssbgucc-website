import type { ReactNode } from 'react';
import { AnnouncementBar } from './AnnouncementBar';
import { Footer } from './Footer';
import { Nav } from './Nav';

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <Nav />
      <main>{children}</main>
      <Footer />
    </>
  );
}
