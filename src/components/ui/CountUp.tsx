'use client';

import { useEffect, useState } from 'react';

/**
 * A number that counts up to its value once, for confirmed rewards such as XP after a check-in. It only ever shows
 * a value the server already returned, it starts from the final value under reduced motion, and screen readers get
 * the final value from the surrounding status text.
 */
export function CountUp({ value, duration = 700 }: { value: number; duration?: number }) {
  const [shown, setShown] = useState(value);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || value <= 0) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / duration);
      setShown(Math.round(value * (1 - (1 - k) ** 3)));
      if (k < 1) frame = requestAnimationFrame(tick);
    };
    setShown(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);
  return <span aria-hidden="true">{shown}</span>;
}
