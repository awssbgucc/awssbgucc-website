import type { CSSProperties } from 'react';
import ghana from '@assets/pixel-map/ghana.json';
import { PixelGrid } from '@/components/ui/PixelGrid';
import { CELL, GAP, gridSize, haloCells, isTextureCell, mapRowFill, PITCH, type StyleFor } from '@/lib/pixel/grid';

const LIME = 'var(--color-lime)';
const { row: markerRow, col: markerCol } = ghana.capeCoast;
const halo = new Set(haloCells(ghana.grid, markerRow, markerCol).map((cell) => `${cell.row},${cell.col}`));

const styleFor: StyleFor = (row, col) => {
  // The marker is drawn on its own below, so it can flash.
  if (row === markerRow && col === markerCol) return null;
  if (halo.has(`${row},${col}`)) return { fill: LIME, opacity: 0.4 };
  return { fill: mapRowFill(row, ghana.rows), opacity: isTextureCell(row, col) ? 0.5 : 0.7 };
};

const { width, height } = gridSize(ghana);
const markerX = markerCol * PITCH;
const markerY = markerRow * PITCH;
const markerCentreY = markerY + CELL / 2;

// The ring sits in the gap around the 5 by 5 block; the pulse starts around the 3 by 3 block.
const ringSize = 5 * PITCH;
const ringX = markerX - 2 * PITCH - GAP / 2;
const ringY = markerY - 2 * PITCH - GAP / 2;
const ringStyle = { '--ring-from': (3 * PITCH) / ringSize } as CSSProperties;

const lineEndX = width + 24;

export function PixelMap() {
  return (
    <figure className="mx-auto w-4/5 max-w-[420px] xl:mr-0 xl:w-full xl:max-w-[560px] xl:pr-40">
      <div className="relative">
        <PixelGrid data={ghana} label="Map of Ghana with Cape Coast highlighted" styleFor={styleFor} fade>
          <rect className="pixel-marker" x={markerX} y={markerY} width={CELL} height={CELL} fill={LIME} />
          <rect
            className="pixel-ring-static pixel-ring"
            style={ringStyle}
            x={ringX}
            y={ringY}
            width={ringSize}
            height={ringSize}
            fill="none"
            stroke={LIME}
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
          <line
            className="hidden xl:block"
            x1={ringX + ringSize}
            y1={markerCentreY}
            x2={lineEndX}
            y2={markerCentreY}
            stroke={LIME}
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
        </PixelGrid>
        <figcaption
          className="pixel-map-label mt-4 text-center font-display text-sm whitespace-pre xl:absolute xl:mt-0 xl:ml-2 xl:-translate-y-2.5 xl:text-left"
          style={{ '--label-left': `${(lineEndX / width) * 100}%`, '--label-top': `${(markerCentreY / height) * 100}%` } as CSSProperties}
        >
          <span className="block font-bold text-lime">CAPE COAST</span>
          <span className="block text-text-muted">5.10 N  1.25 W</span>
        </figcaption>
      </div>
    </figure>
  );
}
