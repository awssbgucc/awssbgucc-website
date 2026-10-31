// Pure helpers behind <PixelGrid /> and <PixelMap />. Sizes are in viewBox units.

export const CELL = 18;
export const GAP = 2;
export const PITCH = CELL + GAP;

export type GridData = {
  cols: number;
  rows: number;
  grid: string[];
  palette?: Record<string, string>;
};

export type CellStyle = { fill: string; opacity?: number };
export type StyleFor = (row: number, col: number, char: string) => CellStyle | null;
export type RowPaths = { row: number; paths: (CellStyle & { d: string })[] };

export function gridSize(data: Pick<GridData, 'cols' | 'rows'>) {
  return { width: data.cols * PITCH - GAP, height: data.rows * PITCH - GAP };
}

/**
 * Groups each row's cells into one path per fill and opacity, so a 592 cell map
 * stays a small DOM and each row can fade as one element.
 */
export function buildRows(data: GridData, styleFor: StyleFor): RowPaths[] {
  return data.grid.map((line, row) => {
    const groups = new Map<string, CellStyle & { d: string }>();
    [...line].forEach((char, col) => {
      if (char === '.') return;
      const style = styleFor(row, col, char);
      if (!style) return;
      const key = `${style.fill}|${style.opacity ?? 1}`;
      const group = groups.get(key) ?? { ...style, d: '' };
      group.d += `M${col * PITCH} ${row * PITCH}h${CELL}v${CELL}h-${CELL}z`;
      groups.set(key, group);
    });
    return { row, paths: [...groups.values()] };
  });
}

/** Stable hash of a cell, so the texture matches on every load. */
export function cellHash(row: number, col: number) {
  let h = 2166136261;
  for (const value of [row, col]) {
    h = Math.imul(h ^ value, 16777619);
  }
  h = Math.imul(h ^ (h >>> 13), 1540483477);
  return (h ^ (h >>> 15)) >>> 0;
}

export function isTextureCell(row: number, col: number) {
  return cellHash(row, col) % 9 === 0;
}

/** Row colour from purple in the north, through lavender, to sky on the coast. */
export function mapRowFill(row: number, rows: number) {
  const t = rows > 1 ? row / (rows - 1) : 0;
  const [from, to, amount] =
    t < 0.5 ? ['--color-purple', '--color-lavender', t * 2] : ['--color-lavender', '--color-sky', (t - 0.5) * 2];
  const percent = Math.round(amount * 1000) / 10;
  return `color-mix(in srgb, var(${to}) ${percent}%, var(${from}))`;
}

/** The land cells among the 8 neighbours. Sea cells never get a halo. */
export function haloCells(grid: string[], row: number, col: number) {
  const cells: { row: number; col: number }[] = [];
  for (let r = row - 1; r <= row + 1; r++) {
    for (let c = col - 1; c <= col + 1; c++) {
      if ((r !== row || c !== col) && grid[r]?.[c] === '#') cells.push({ row: r, col: c });
    }
  }
  return cells;
}
