"""Turns an image into a pixel-art grid JSON for the site's pixel components.

Usage:
    pip install pillow
    python3 scripts/pixelate-image.py <image> <cols> <out.json> [--palette r=#ed1c24,b=#2f3192,...]

Each cell is mapped to the nearest palette colour (one letter per colour),
transparent areas become ".", stray single pixels are cleaned up, and the
empty border is trimmed. This is how assets/pixel-art/ucc-crest.json was made:

    python3 scripts/pixelate-image.py ucc-crest.png 44 assets/pixel-art/ucc-crest.json \
        --palette r=#ed1c24,b=#2f3192,y=#fff700,w=#fffdf2,k=#28181e
"""
import json
import sys
from collections import Counter

from PIL import Image


def parse_palette(arg):
    pal = {}
    for part in arg.split(','):
        key, hexv = part.split('=')
        hexv = hexv.lstrip('#')
        pal[key] = tuple(int(hexv[i:i + 2], 16) for i in (0, 2, 4))
    return pal


def pixelate(path, cols, palette):
    im = Image.open(path).convert('RGBA')
    w, h = im.size
    rows = round(h * cols / w)
    small = im.resize((cols, rows), Image.BOX)
    grid = []
    for y in range(rows):
        row = []
        for x in range(cols):
            r, g, b, a = small.getpixel((x, y))
            if a < 140:
                row.append('.')
                continue
            row.append(min(palette, key=lambda k: sum((p - q) ** 2 for p, q in zip(palette[k], (r, g, b)))))
        grid.append(row)
    return grid


def despeckle(grid, passes=2):
    rows, cols = len(grid), len(grid[0])
    for _ in range(passes):
        new = [r[:] for r in grid]
        for y in range(rows):
            for x in range(cols):
                ch = grid[y][x]
                if ch == '.':
                    continue
                around = []
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        if not (dy or dx):
                            continue
                        yy, xx = y + dy, x + dx
                        around.append(grid[yy][xx] if 0 <= yy < rows and 0 <= xx < cols else '.')
                if around.count(ch) <= 1:
                    new[y][x] = Counter(c for c in around if c != ch).most_common(1)[0][0]
        grid = new
    return grid


def trim(grid):
    rows = [i for i, r in enumerate(grid) if any(c != '.' for c in r)]
    cols = [j for j in range(len(grid[0])) if any(r[j] != '.' for r in grid)]
    return [r[cols[0]:cols[-1] + 1] for r in grid[rows[0]:rows[-1] + 1]]


def main():
    if len(sys.argv) < 4:
        print(__doc__)
        sys.exit(1)
    path, cols, out = sys.argv[1], int(sys.argv[2]), sys.argv[3]
    palette = parse_palette(sys.argv[sys.argv.index('--palette') + 1]) if '--palette' in sys.argv else {
        'r': (237, 28, 36), 'b': (47, 49, 146), 'y': (255, 247, 0), 'w': (255, 253, 242), 'k': (40, 24, 30)}
    grid = trim(despeckle(pixelate(path, cols, palette)))
    data = {
        'cols': len(grid[0]),
        'rows': len(grid),
        'palette': {k: '#%02x%02x%02x' % v for k, v in palette.items()},
        'legend': {'.': 'empty'},
        'grid': [''.join(r) for r in grid],
    }
    with open(out, 'w') as f:
        json.dump(data, f, indent=1)
    print(f"{data['cols']}x{data['rows']} written to {out}")


if __name__ == '__main__':
    main()
