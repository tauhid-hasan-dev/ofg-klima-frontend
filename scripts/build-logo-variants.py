"""
Derives the logo variants the site needs from OFG's single supplied PNG.

    python scripts/build-logo-variants.py [source.png]

Source default: public/brand/ofg-logo.png (the artwork as supplied — 281x81
RGBA, transparent background, three ink colours: #e31e24 red, #393185 navy,
#2b2a29 for the tagline).

One file cannot sit on all three surfaces this site has, so the script writes:

    public/brand/ofg-logo.png          as supplied            light surfaces
    public/brand/ofg-logo-light.png    navy + tagline white   the ink-950 footer
    public/brand/ofg-logo-white.png    everything white       the brand-red drawer
    public/brand/ofg-mark*.png         the same three, tagline cropped off
    src/app/icon.png, apple-icon.png   square app icons

Re-run it if OFG supplies new artwork; do not hand-edit the derived files.

Requires Pillow (`pip install pillow`). It is a build-time tool, not a runtime
dependency, which is why it is not in package.json.
"""

import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRAND = os.path.join(ROOT, "public", "brand")
APP = os.path.join(ROOT, "src", "app")
DEFAULT_SRC = os.path.join(BRAND, "ofg-logo.png")

RED = (227, 30, 36)
NAVY = (57, 49, 133)
DARK = (43, 42, 41)

# On a near-black surface the navy disappears and the tagline is invisible, so
# both go white; the red lightens to brand-400 so it still clears 4.5:1.
ON_DARK = {RED: (244, 88, 94), NAVY: (255, 255, 255), DARK: (255, 255, 255)}

# On the brand red itself the logo's own red would vanish into the background,
# so the whole lockup goes solid white.
ON_BRAND = {RED: (255, 255, 255), NAVY: (255, 255, 255), DARK: (255, 255, 255)}

# The wordmark (arc + OFG) ends at y=56; the tagline runs y=59..81.
MARK_BOX = (58, 0, 225, 57)


def nearest(colour):
    r, g, b = colour
    best, best_d = None, None
    for base in (RED, NAVY, DARK):
        d = (r - base[0]) ** 2 + (g - base[1]) ** 2 + (b - base[2]) ** 2
        if best_d is None or d < best_d:
            best, best_d = base, d
    return best


def recolour(im, mapping):
    """Maps each visible pixel to the target of its nearest base colour.

    Alpha is preserved untouched. The source antialiases against a transparent
    background, so its soft edges live in the alpha channel rather than in
    blended RGB — which is why nearest-colour classification is enough here and
    does not produce fringing.
    """
    out = im.copy()
    px = out.load()
    w, h = out.size
    cache = {}
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            key = (r, g, b)
            if key not in cache:
                cache[key] = mapping[nearest(key)]
            nr, ng, nb = cache[key]
            px[x, y] = (nr, ng, nb, a)
    return out


def square_icon(mark, size, background):
    """Centres the wordmark on a square canvas.

    The lockup is 3:1, so a square *crop* would cut letters off; it is centred
    with margins instead, which is how OFG already uses it on paperwork.
    """
    canvas = Image.new("RGBA", (size, size), background)
    margin = round(size * 0.08)
    target_w = size - margin * 2
    scale = target_w / mark.width
    scaled = mark.resize((target_w, max(1, round(mark.height * scale))), Image.LANCZOS)
    canvas.alpha_composite(scaled, (margin, (size - scaled.height) // 2))
    return canvas


def main():
    source = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SRC
    if not os.path.exists(source):
        raise SystemExit("source not found: %s" % source)

    os.makedirs(BRAND, exist_ok=True)
    src = Image.open(source).convert("RGBA")
    mark = src.crop(MARK_BOX)

    assets = {
        os.path.join(BRAND, "ofg-logo.png"): src,
        os.path.join(BRAND, "ofg-logo-light.png"): recolour(src, ON_DARK),
        os.path.join(BRAND, "ofg-logo-white.png"): recolour(src, ON_BRAND),
        os.path.join(BRAND, "ofg-mark.png"): mark,
        os.path.join(BRAND, "ofg-mark-light.png"): recolour(mark, ON_DARK),
        os.path.join(BRAND, "ofg-mark-white.png"): recolour(mark, ON_BRAND),
    }

    for path, image in assets.items():
        image.save(path, "PNG", optimize=True)
        print("wrote %-44s %dx%d" % (os.path.relpath(path, ROOT), image.width, image.height))

    for name, size in (("icon.png", 512), ("apple-icon.png", 180)):
        path = os.path.join(APP, name)
        icon = square_icon(mark, size, (255, 255, 255, 255))
        icon.save(path, "PNG", optimize=True)
        print("wrote %-44s %dx%d" % (os.path.relpath(path, ROOT), icon.width, icon.height))


if __name__ == "__main__":
    main()
