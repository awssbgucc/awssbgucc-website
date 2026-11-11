'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * The only script behind the public motion. It marks [data-reveal] elements as they scroll into view, and CSS does the rest.
 * Without it, or under reduced motion, nothing is ever hidden: the hiding rule needs the motion-ready class this adds.
 */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const show = (element: Element) => element.setAttribute('data-inview', '');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        show(entry.target);
        observer.unobserve(entry.target);
      }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );
    // Anything already on screen is shown in the same frame the class is added, so it never flickers.
    document.querySelectorAll('[data-reveal]:not([data-inview])').forEach((element) => {
      if (element.getBoundingClientRect().top < window.innerHeight * 0.92) show(element);
      else observer.observe(element);
    });
    document.documentElement.classList.add('motion-ready');
    return () => observer.disconnect();
  }, [pathname]);
  return null;
}
