import type { ReactNode } from 'react';
import { SiteChrome } from '@/components/site/SiteChrome';

// Amplify Hosting does not support on-demand revalidation, so public pages refresh on a timer.
// This also moves finished events from upcoming to past with nobody saving anything.
export const revalidate = 60;

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
