// Regenerates assets/pixel-map/ghana.json from Natural Earth data.
// Usage: pnpm add -D world-atlas topojson-client d3-geo
//        node scripts/generate-pixel-map.mjs [cols=24]
// Data: Natural Earth 1:10m countries via the world-atlas package (public domain).
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';
import { geoContains } from 'd3-geo';

const require = createRequire(import.meta.url);
const topo = require('world-atlas/countries-10m.json');
const countries = feature(topo, topo.objects.countries);
const ghana = countries.features.find((f) => f.id === '288'); // ISO 3166 numeric for Ghana

const COLS = Number(process.argv[2] || 24);
const CAPE_COAST = { lon: -1.2466, lat: 5.1053 };

let minX = 180, maxX = -180, minY = 90, maxY = -90;
const walk = (c) => {
  if (typeof c[0] === 'number') {
    minX = Math.min(minX, c[0]); maxX = Math.max(maxX, c[0]);
    minY = Math.min(minY, c[1]); maxY = Math.max(maxY, c[1]);
  } else c.forEach(walk);
};
walk(ghana.geometry.coordinates);

const cell = (maxX - minX) / COLS;
const ROWS = Math.ceil((maxY - minY) / cell);
const grid = [];

// A cell is land when at least 3 of 9 sample points fall inside the border.
for (let r = 0; r < ROWS; r++) {
  let row = '';
  for (let c = 0; c < COLS; c++) {
    let hits = 0;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const lon = minX + (c + (i + 0.5) / 3) * cell;
        const lat = maxY - (r + (j + 0.5) / 3) * cell;
        if (geoContains(ghana, [lon, lat])) hits++;
      }
    }
    row += hits >= 3 ? '#' : '.';
  }
  grid.push(row);
}

// Cape Coast sits on the coast; walk up until we hit a land cell.
const ccCol = Math.floor((CAPE_COAST.lon - minX) / cell);
let ccRow = Math.floor((maxY - CAPE_COAST.lat) / cell);
while (ccRow >= 0 && grid[ccRow][ccCol] !== '#') ccRow--;

const out = {
  name: 'ghana',
  source: 'Natural Earth 1:10m via world-atlas (public domain)',
  legend: { '#': 'land', '.': 'empty' },
  cols: COLS,
  rows: ROWS,
  bbox: { minLon: minX, maxLon: maxX, minLat: minY, maxLat: maxY },
  capeCoast: { col: ccCol, row: ccRow, lat: CAPE_COAST.lat, lon: CAPE_COAST.lon },
  grid,
};

fs.mkdirSync('assets/pixel-map', { recursive: true });
fs.writeFileSync('assets/pixel-map/ghana.json', JSON.stringify(out, null, 1));
console.log(`${COLS}x${ROWS}, Cape Coast at col ${ccCol} row ${ccRow}`);
