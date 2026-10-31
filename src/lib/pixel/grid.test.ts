import { describe, expect, it } from 'vitest';
import ghana from '@assets/pixel-map/ghana.json';
import crest from '@assets/pixel-art/ucc-crest.json';
import chip from '@assets/pixel-art/sbg-chip.json';
import { buildRows, cellHash, gridSize, haloCells, isTextureCell, mapRowFill } from './grid';

describe('grid data', () => {
  it.each([
    ['ghana', ghana, 24, 35],
    ['crest', crest, 37, 44],
    ['chip', chip, 9, 9],
  ])('%s matches its declared size', (_name, data, cols, rows) => {
    expect([data.cols, data.rows]).toEqual([cols, rows]);
    expect(data.grid).toHaveLength(rows);
    expect(data.grid.every((line) => line.length === cols)).toBe(true);
  });

  it('places Cape Coast on land', () => {
    expect(ghana.grid[ghana.capeCoast.row][ghana.capeCoast.col]).toBe('#');
  });
});

describe('gridSize', () => {
  it('leaves no trailing gap', () => {
    expect(gridSize(ghana)).toEqual({ width: 478, height: 698 });
  });
});

describe('texture', () => {
  it('is stable across calls', () => {
    expect(cellHash(12, 7)).toBe(cellHash(12, 7));
  });

  it('marks roughly 1 in 9 land cells', () => {
    let land = 0;
    let textured = 0;
    ghana.grid.forEach((line, row) =>
      [...line].forEach((char, col) => {
        if (char !== '#') return;
        land++;
        if (isTextureCell(row, col)) textured++;
      }),
    );
    expect(land).toBe(592);
    expect(textured / land).toBeGreaterThan(0.08);
    expect(textured / land).toBeLessThan(0.15);
  });
});

describe('mapRowFill', () => {
  it('runs purple to lavender to sky, never cyan', () => {
    expect(mapRowFill(0, 35)).toBe('color-mix(in srgb, var(--color-lavender) 0%, var(--color-purple))');
    expect(mapRowFill(17, 35)).toBe('color-mix(in srgb, var(--color-sky) 0%, var(--color-lavender))');
    expect(mapRowFill(34, 35)).toBe('color-mix(in srgb, var(--color-sky) 100%, var(--color-lavender))');
    for (let row = 0; row < 35; row++) expect(mapRowFill(row, 35)).not.toContain('cyan');
  });
});

describe('haloCells', () => {
  it('returns only the land neighbours of Cape Coast', () => {
    const { row, col } = ghana.capeCoast;
    const cells = haloCells(ghana.grid, row, col);
    expect(cells).toHaveLength(5);
    expect(cells.every((cell) => ghana.grid[cell.row][cell.col] === '#')).toBe(true);
  });

  it('handles the edge of the grid', () => {
    expect(haloCells(['#.', '..'], 0, 0)).toEqual([]);
  });
});

describe('buildRows', () => {
  it('skips empty cells and groups by style', () => {
    const rows = buildRows({ cols: 3, rows: 1, grid: ['#.#'] }, () => ({ fill: 'red' }));
    expect(rows[0].paths).toEqual([{ fill: 'red', d: 'M0 0h18v18h-18zM40 0h18v18h-18z' }]);
  });

  it('drops cells the style function rejects', () => {
    expect(buildRows({ cols: 1, rows: 1, grid: ['#'] }, () => null)[0].paths).toEqual([]);
  });
});
