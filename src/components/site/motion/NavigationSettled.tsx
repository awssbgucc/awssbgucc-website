'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { settleNavigation } from './TransitionLink';

/** Ends a route view transition once the new route has committed, including routes outside the public layout. */
export function NavigationSettled() {
  const pathname = usePathname();
  useEffect(() => { settleNavigation(); }, [pathname]);
  return null;
}
