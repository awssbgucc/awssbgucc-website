'use client';

import { useEffect, useRef } from 'react';
import { reducedMotion } from '@/lib/motion';

// The order the official SBG backgrounds step through.
const TONES = ['--color-sbg-purple', '--color-sbg-blue', '--color-sbg-magenta', '--color-sbg-mint'];
// A lit cell fades out in three steps, like the stepped blocks, never a smooth glow.
const STEPS = [
  { until: 160, alpha: 0.34 },
  { until: 420, alpha: 0.2 },
  { until: 900, alpha: 0.08 },
];

type Lit = { col: number; row: number; tone: number; born: number };

/**
 * The hero's hairline grid, alive: cells under the pointer light in the programme colours and step back out, as if the
 * visitor were placing blocks. A tap on the open grid lights a three-step stair. It draws only while cells are lit,
 * stops off screen and in background tabs, and does nothing under reduced motion. Decorative, so it is hidden from
 * assistive technology.
 */
export function BuildField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const context = canvas?.getContext('2d');
    if (!canvas || !host || !context || reducedMotion()) return;

    const rootStyle = getComputedStyle(document.documentElement);
    const colours = TONES.map((name) => rootStyle.getPropertyValue(name).trim());
    const lit = new Map<string, Lit>();
    let cell = 48;
    let offsetX = 0;
    let width = 0;
    let height = 0;
    let frame = 0;
    let tone = 0;
    let last = '';
    let visible = true;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      cell = parseFloat(getComputedStyle(host).getPropertyValue('--cell')) || 48;
      // The CSS grid is centred horizontally, so its lines sit half a cell either side of the centre line.
      offsetX = (((width / 2 - cell / 2) % cell) + cell) % cell;
    };

    const draw = () => {
      frame = 0;
      const now = performance.now();
      context.clearRect(0, 0, width, height);
      for (const [key, item] of lit) {
        const age = now - item.born;
        if (age < 0) continue;
        const step = STEPS.find((s) => age < s.until);
        if (!step) { lit.delete(key); continue; }
        context.globalAlpha = step.alpha;
        context.fillStyle = colours[item.tone];
        context.fillRect(offsetX + item.col * cell + 1, item.row * cell + 1, cell - 1, cell - 1);
      }
      context.globalAlpha = 1;
      if (lit.size > 0 && visible && !document.hidden) frame = requestAnimationFrame(draw);
    };
    const schedule = () => { if (!frame && visible) frame = requestAnimationFrame(draw); };

    const light = (col: number, row: number, delay = 0) => {
      const key = `${col},${row}`;
      lit.set(key, { col, row, tone, born: performance.now() + delay });
    };
    const cellAt = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      return { col: Math.floor((event.clientX - rect.left - offsetX) / cell), row: Math.floor((event.clientY - rect.top) / cell) };
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const { col, row } = cellAt(event);
      const key = `${col},${row}`;
      if (key === last) return;
      last = key;
      tone = (tone + 1) % colours.length;
      light(col, row);
      schedule();
    };
    const onDown = (event: PointerEvent) => {
      // A tap on a link, button or text is meant for that, so only taps on the open grid light a stair.
      if (event.pointerType !== 'touch' || (event.target as Element).closest('a, button, h1, p, li, figure')) return;
      const { col, row } = cellAt(event);
      for (let step = 0; step < 3; step++) {
        tone = (tone + 1) % colours.length;
        light(col + step, row - step, step * 90);
      }
      schedule();
    };

    resize();
    const sizer = new ResizeObserver(resize);
    sizer.observe(host);
    const watcher = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) schedule(); });
    watcher.observe(host);
    const onVisibility = () => { if (!document.hidden) schedule(); };
    host.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(frame);
      sizer.disconnect();
      watcher.disconnect();
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerdown', onDown);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={ref} className="build-field" aria-hidden="true" />;
}
