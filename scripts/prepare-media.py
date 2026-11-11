"""Writes web copies of the approved photos, flyers and brand files listed in content/media-manifest.json.

Dev tool, needs Pillow. Run from the repo root: python scripts/prepare-media.py
Originals are only read. Copies are re-encoded from pixels, so no EXIF, GPS or other metadata survives.
"""
import json
import re
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
KIT = ROOT / 'review/redesign/brand-kit/01- Creative Assets _ Fonts, Icons, Etc'


def webp(source: Path, target: Path, width: int, quality: int = 74):
    image = ImageOps.exif_transpose(Image.open(source)).convert('RGB')
    if image.width > width:
        image = image.resize((width, round(image.height * width / image.width)), Image.LANCZOS)
    target.parent.mkdir(parents=True, exist_ok=True)
    image.save(target, 'WEBP', quality=quality, method=6)
    return image.size


def trace_icon(source: Path, cell: int = 430):
    """Reads one official pixel icon PNG as rows of '#' and '.', sampling the centre of each 430 px cell."""
    image = Image.open(source).convert('RGBA')
    alpha = image.getchannel('A').point(lambda a: 255 if a > 128 else 0)
    x0, y0, x1, y1 = alpha.getbbox()
    cols, rows = round((x1 - x0) / cell), round((y1 - y0) / cell)
    return [''.join('#' if alpha.getpixel((int(x0 + (c + 0.5) * cell), int(y0 + (r + 0.5) * cell))) else '.' for c in range(cols)) for r in range(rows)]


def main():
    manifest = json.loads((ROOT / 'content/media-manifest.json').read_text())
    for photo in manifest['photos']:
        if photo['consent'] != 'approved': continue
        size = webp(ROOT / photo['source'], ROOT / f"public/media/community/{photo['id']}.webp", photo['width'])
        print('photo', photo['id'], size)
    for flyer in manifest['flyers']:
        if flyer['status'] != 'published': continue
        size = webp(ROOT / flyer['source'], ROOT / f"public/media/events/{flyer['id']}.webp", flyer['width'], 82)
        print('flyer', flyer['id'], size)

    if not KIT.exists():
        print('Brand kit not extracted to', KIT, '- skipping brand files')
        return
    brand = ROOT / 'public/brand'
    # Wordmark: the white-text brandmark. Its Grey 850 panel is dropped and the view box trimmed to the
    # lettering plus clear space. The letter outlines are copied unchanged.
    svg = (KIT / 'Brandmarks/Primary/SVG/AWS Student Builder Group_RGB_Brandmark_Mint.svg').read_text()
    paths = re.findall(r'<path [^>]*/>', svg)
    # The matching PNG shares the 3000 by 750 canvas, so its light pixels give the lettering bounds.
    raster = Image.open(KIT / 'Brandmarks/Primary/PNG/AWS Student Builder Group_RGB_Brandmark_Purple.png').convert('L')
    x0, y0, x1, y1 = raster.point(lambda v: 255 if v > 128 else 0).getbbox()
    pad = round((y1 - y0) / 2)
    view = f'{x0 - pad} {y0 - pad} {x1 - x0 + 2 * pad} {y1 - y0 + 2 * pad}'
    brand.mkdir(parents=True, exist_ok=True)
    (brand / 'sbg-wordmark-white.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}" fill="none">{"".join(paths)}</svg>\n')
    print('wordmark viewBox', view)
    for name, colour in [('White', 'purple'), ('Purple', 'mint'), ('Grey 850', 'blue'), ('Mint', 'magenta')]:
        source = (KIT / f'Program Icon/SVG/AWS Student Builder Group_RGB_Program Icon_{name}.svg').read_text()
        (brand / f'sbg-chip-{colour}.svg').write_text(source)
    # Every icon ships in every palette colour, and several files are misnamed, so each shape is stored
    # once as a cell grid and rendered in an official palette colour by the SbgIcon component.
    icons = {'bolt': 'Bolt_Mint', 'clock': 'Clock_Mint', 'brackets-double': 'Double Bracket Smile_Grey 850',
             'drop': 'Drop_Mint', 'key': 'Key_Mint', 'ladder': 'Ladder_White', 'brackets': 'Single Bracket Smile_White',
             'speaker': 'Speaker_White', 'teams': 'Teams_White', 'trophy': 'Trophy_Blue', 'wrench': 'Wrench_Magenta'}
    grids = {slug: trace_icon(KIT / f'Additional Icons/PNG/AWS Student Builder Group_RGB_Icons_{name}.png') for slug, name in icons.items()}
    out = ROOT / 'assets/pixel-art/sbg-icons.json'
    out.write_text(json.dumps({'source': 'AWS Student Builder Group creative assets, Additional Icons. Traced on the 430 px cell.', 'icons': grids}, indent=1) + '\n')
    for slug, rows in grids.items(): print('icon', slug, len(rows[0]), 'x', len(rows))


if __name__ == '__main__':
    main()
