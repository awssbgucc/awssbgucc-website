import type { CSSProperties, ReactNode } from 'react';
import { buildRows, gridSize, type GridData, type StyleFor } from '@/lib/pixel/grid';

const FADE_MS = 900;

type PixelGridProps = {
  data: GridData;
  label: string;
  /** Defaults to the grid's own palette. */
  styleFor?: StyleFor;
  /** Fades cells in row by row, top to bottom. */
  fade?: boolean;
  className?: string;
  /** Extra SVG content drawn over the cells. */
  children?: ReactNode;
};

export function PixelGrid({ data, label, styleFor, fade = false, className = '', children }: PixelGridProps) {
  const { width, height } = gridSize(data);
  const palette = data.palette ?? {};
  const rows = buildRows(data, styleFor ?? ((_row, _col, char) => ({ fill: palette[char] })));
  const fadeStyle = { '--row-step': `${Math.round(FADE_MS / data.rows)}ms` } as CSSProperties;

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${width} ${height}`}
      className={`block h-auto w-full overflow-visible ${fade ? 'pixel-fade' : ''} ${className}`}
      style={fade ? fadeStyle : undefined}
    >
      {rows.map(({ row, paths }) => (
        <g key={row} className="pixel-row" style={{ '--row': row } as CSSProperties}>
          {paths.map((path) => (
            <path key={`${path.fill}${path.opacity}`} d={path.d} fill={path.fill} opacity={path.opacity} />
          ))}
        </g>
      ))}
      {children}
    </svg>
  );
}
