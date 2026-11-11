import data from '@assets/pixel-art/sbg-icons.json';

export type SbgIconName = keyof typeof data.icons;
export type SbgTone = 'purple' | 'mint' | 'blue' | 'magenta' | 'white';

// Each official icon ships in every palette colour, so a tone picks one of those variants. Cells are merged by row.
export function SbgIcon({ name, tone = 'white', size = 32, label }: { name: SbgIconName; tone?: SbgTone; size?: number; label?: string }) {
  const rows = data.icons[name];
  const width = rows[0].length;
  const rects: { x: number; y: number; w: number }[] = [];
  rows.forEach((row, y) => {
    for (const match of row.matchAll(/#+/g)) rects.push({ x: match.index, y, w: match[0].length });
  });
  return (
    <svg
      viewBox={`0 0 ${width} ${rows.length}`}
      width={(size * width) / Math.max(width, rows.length)}
      height={(size * rows.length) / Math.max(width, rows.length)}
      shapeRendering="crispEdges"
      className={`sbg-icon sbg-tone-${tone}`}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      {rects.map(({ x, y, w }) => (
        <rect key={`${x},${y}`} x={x} y={y} width={w} height={1} />
      ))}
    </svg>
  );
}
