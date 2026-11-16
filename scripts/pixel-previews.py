"""Writes content/pixel-previews.json: three tiny pixel versions of each approved photo, for the hero's pixel to picture reveal.

Dev tool, needs Pillow. Run from the repo root after prepare-media.py: python scripts/pixel-previews.py
Reads only the published derivatives in public/media, so nothing from the originals can leak.

Level 0 maps each cell to the nearest official SBG colour (Grey 850, Purple, Blue, Magenta, Mint, White), so the first frame
looks like the brand panels. Levels 1 and 2 keep the photo's own colours at a coarse and a finer grid.
"""
import base64
import io
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PALETTE = [(0x16, 0x1D, 0x26), (0xAD, 0x5C, 0xFF), (0x42, 0xB4, 0xFF), (0xFF, 0x57, 0xE9), (0x00, 0xE5, 0x82), (0xFF, 0xFF, 0xFF)]
COLUMNS = (4, 8, 16)


def nearest(rgb):
    # Dark and low-saturation cells go to Grey 850, so the photo's shadows read as the page itself.
    r, g, b = rgb
    if max(rgb) < 70 or (max(rgb) - min(rgb) < 28 and max(rgb) < 150):
        return PALETTE[0]
    return min(PALETTE[1:], key=lambda p: (p[0] - r) ** 2 + (p[1] - g) ** 2 + (p[2] - b) ** 2)


def data_url(image):
    buffer = io.BytesIO()
    image.save(buffer, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(buffer.getvalue()).decode()


def levels(path: Path):
    image = Image.open(path).convert('RGB')
    out = []
    for index, cols in enumerate(COLUMNS):
        rows = max(1, round(cols * image.height / image.width))
        small = image.resize((cols, rows), Image.BOX)
        if index == 0:
            small.putdata([nearest(p) for p in getattr(small, 'get_flattened_data', small.getdata)()])
        out.append(data_url(small))
    return out


def main():
    manifest = json.loads((ROOT / 'content/media-manifest.json').read_text())
    previews = {}
    for photo in manifest['photos']:
        if photo['consent'] != 'approved':
            continue
        source = ROOT / f"public/media/community/{photo['id']}.webp"
        previews[photo['id']] = levels(source)
        print(photo['id'], sum(len(u) for u in previews[photo['id']]), 'bytes')
    for photo in manifest['eventPhotos']:
        if photo['consent'] != 'approved':
            continue
        previews[photo['id']] = levels(ROOT / f"public/media/events/{photo['event']}/{photo['id']}.webp")
        print(photo['id'], sum(len(u) for u in previews[photo['id']]), 'bytes')
    (ROOT / 'content/pixel-previews.json').write_text(json.dumps(previews, indent=1) + '\n')


if __name__ == '__main__':
    main()
