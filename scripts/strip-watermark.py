# -*- coding: utf-8 -*-
"""
Removes the upstream shop's wordmark from the harvested hero banners.

    python scripts/strip-watermark.py                 # patch public/banners
    python scripts/strip-watermark.py --preview       # write *.preview.jpg only

The hero banners fetched by fetch-reference-media.py carry "KAFKAS / Oto Klima
Yedek Parça" burned into the top-right corner. Shipping that would put another
shop's name across OFG's home page, so it comes off before the image is used.

WHY A FIXED BOX, NOT DETECTION

The first version of this script looked for pixels brighter than their row's
background. On these particular photographs that does not work: the subject is
polished aluminium under a hard light, so the brightest things in the top-right
corner are the compressor's own highlights, and the detected box swallowed part
of the product. Measured across all three banners, the wordmark is a fixed-size
overlay composited at a fixed offset from the top-right corner — so the offset
is what is encoded here. It is checked against the known banner geometry and
skips anything that is not that shape, rather than guessing.

HOW THE FILL WORKS

A Coons patch: the replacement is interpolated from the single ring of pixels
around the box — vertically from the rows above and below, horizontally from
the columns either side, minus the bilinear corner term so the two agree at the
edges. The corner these sit in is a smooth dark gradient, which is the case
this is exact for. A straight copy-paste or a blur would leave a visible seam.

The patch is noise-free where the surrounding photo has faint grain. At this
size, in the darkest corner of the frame, that does not read. A future banner
that puts the wordmark over texture would need retouching by hand instead.

Not idempotent by detection — it patches the same box every run, which is
harmless (the second run interpolates an already-interpolated gradient) but
pointless. Re-fetch from scratch if you need to start over.

Requires Pillow.
"""

import os
import shutil
import sys

from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BANNERS = os.path.join(ROOT, "public", "banners")

# Untouched copies live OUTSIDE public/. Keeping them under public/banners/
# would publish the watermarked originals at a real URL, which is the one
# outcome this whole script exists to prevent.
ORIGINALS = os.path.join(ROOT, ".cache", "banner-originals")

# The banner format the overlay was composited onto. Anything else is left
# alone: the category banners are plain product shots with no wordmark, and
# patching a fixed box into one would delete part of the product.
BANNER_SIZE = (2560, 1080)

# Offsets of the patch area, in pixels. x is measured from the right edge
# because that is the edge the overlay is anchored to.
RIGHT_FROM = 690  # left side of the box, as a distance from the right edge
RIGHT_TO = 80  # right side of the box, likewise
TOP = 16
BOTTOM = 136


def box_for(width, height):
    return (width - RIGHT_FROM, TOP, width - RIGHT_TO, BOTTOM)


def coons_fill(pixels, box):
    """Replace `box` with a Coons patch built from the ring around it."""
    x0, y0, x1, y1 = box
    span_x = x1 - x0 + 2
    span_y = y1 - y0 + 2

    # Sample the whole ring up front, so the fill is never computed from
    # pixels it has already overwritten.
    top = {x: pixels[x, y0 - 1] for x in range(x0, x1 + 1)}
    bottom = {x: pixels[x, y1 + 1] for x in range(x0, x1 + 1)}
    left = {y: pixels[x0 - 1, y] for y in range(y0, y1 + 1)}
    right = {y: pixels[x1 + 1, y] for y in range(y0, y1 + 1)}

    tl = pixels[x0 - 1, y0 - 1]
    tr = pixels[x1 + 1, y0 - 1]
    bl = pixels[x0 - 1, y1 + 1]
    br = pixels[x1 + 1, y1 + 1]

    for y in range(y0, y1 + 1):
        v = (y - y0 + 1) / span_y
        for x in range(x0, x1 + 1):
            u = (x - x0 + 1) / span_x
            channels = []
            for c in range(3):
                vertical = (1 - v) * top[x][c] + v * bottom[x][c]
                horizontal = (1 - u) * left[y][c] + u * right[y][c]
                bilinear = (
                    (1 - u) * (1 - v) * tl[c]
                    + u * (1 - v) * tr[c]
                    + (1 - u) * v * bl[c]
                    + u * v * br[c]
                )
                channels.append(max(0, min(255, round(vertical + horizontal - bilinear))))
            pixels[x, y] = tuple(channels)


# How hard to soften the patch, and how wide the fade back into the photo is.
BLUR_RADIUS = 9
FEATHER = 14


def soften(image, box):
    """
    Blur the patched area, fading out at its edges.

    A Coons patch is piecewise-linear, which on a background with any
    curvature to its gradient shows up as faint straight-line banding — plainly
    visible on the banner whose corner carries a warm falloff. Blurring the
    patch removes the banding without touching anything outside it, because the
    mask is zero at the box boundary and only reaches full strength well
    inside.
    """
    x0, y0, x1, y1 = box
    pad = FEATHER + BLUR_RADIUS
    region = (
        max(0, x0 - pad),
        max(0, y0 - pad),
        min(image.width, x1 + pad),
        min(image.height, y1 + pad),
    )

    crop = image.crop(region)
    blurred = crop.filter(ImageFilter.GaussianBlur(BLUR_RADIUS))

    mask = Image.new("L", crop.size, 0)
    ImageDraw.Draw(mask).rectangle(
        (
            x0 - region[0] + FEATHER,
            y0 - region[1] + FEATHER,
            x1 - region[0] - FEATHER,
            y1 - region[1] - FEATHER,
        ),
        fill=255,
    )
    mask = mask.filter(ImageFilter.GaussianBlur(FEATHER))

    image.paste(Image.composite(blurred, crop, mask), region)


def main():
    preview = "--preview" in sys.argv

    if not os.path.isdir(BANNERS):
        raise SystemExit(f"missing {BANNERS} — run fetch-reference-media.py first")

    names = sorted(
        name
        for name in os.listdir(BANNERS)
        if name.lower().endswith((".jpg", ".jpeg", ".png"))
        and ".preview." not in name
    )

    patched = 0
    for name in names:
        path = os.path.join(BANNERS, name)
        image = Image.open(path).convert("RGB")

        if image.size != BANNER_SIZE:
            print(f"  {name:<20} skipped ({image.width}x{image.height}, not a hero banner)")
            continue

        box = box_for(image.width, image.height)
        coons_fill(image.load(), box)
        soften(image, box)

        if preview:
            stem, extension = os.path.splitext(name)
            out = os.path.join(BANNERS, f"{stem}.preview{extension}")
        else:
            # Keep the untouched download the first time through, so a bad
            # box can be undone without re-fetching.
            original = os.path.join(ORIGINALS, name)
            if not os.path.exists(original):
                os.makedirs(ORIGINALS, exist_ok=True)
                shutil.copy2(path, original)
            out = path

        image.save(out, quality=94, subsampling=0)
        print(f"  {name:<20} patched {box}")
        patched += 1

    print(f"\npatched {patched} of {len(names)}")


if __name__ == "__main__":
    main()
