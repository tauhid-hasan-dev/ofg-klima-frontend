# -*- coding: utf-8 -*-
"""
Removes the upstream shop's overlay from the harvested product photography.

    python scripts/strip-product-watermark.py --dry-run   # estimate only
    python scripts/strip-product-watermark.py             # rewrite in place

Every photo fetched from the source catalogue carries the same four marks:

    a blue keyline around the whole frame
    a large translucent "KAFKAS / Oto Klima Yedek Parça" diagonally across it
    a translucent snowflake bottom-left
    an opaque KAFKAS logo bottom-right

The manufacturer's own badge (SANDEN, DENSO, …) in the top-left is left alone:
that one belongs on a parts listing.

HOW IT WORKS

The overlay is byte-identical on every image, which is what makes this
solvable. Composite it over a white background and you get

    M = (1 - a)·255 + a·C

for per-pixel alpha `a` and overlay colour `C`. Almost every one of these
photos is a part shot on a white sweep, so for any given pixel *some* image in
the collection has white behind the overlay — and the brightest value observed
at that pixel across the whole collection is therefore a good estimate of M.
A high percentile rather than the true maximum, so one blown-out specular
highlight cannot poison the estimate.

Given M, the overlay is undone as a multiply: `out = in · 255 / M`. That is
exact where the background is white (it returns 255), approximately right over
the part itself while `a` is small — which it is for the diagonal type — and
it conveniently saturates the opaque corner logo to white, since M there is
dark and the gain hits its ceiling.

WHAT IT CANNOT DO

Where the opaque logo or the snowflake sits *on top of the part* rather than
on the sweep, there is no information left to recover and that area is simply
brightened. It is good enough for a catalogue grid and not good enough for a
hero crop. These photographs are stand-ins for OFG's own in any case — see
scripts/fetch-reference-media.py.

Images are grouped by pixel size, because the overlay is composited after
resizing and only images of the same size share an estimate. A group needs
MIN_SAMPLES images before its estimate is trustworthy; smaller groups are
reported and skipped rather than guessed at.

Requires Pillow and numpy.
"""

import os
import shutil
import sys
from collections import defaultdict

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PARTS = os.path.join(ROOT, "public", "parts")
BACKUP = os.path.join(ROOT, "public", "parts", ".original")

EXTENSIONS = (".webp", ".jpg", ".jpeg", ".png")

# Percentile used as the "white behind the overlay" estimate.
PERCENTILE = 96

# A group smaller than this cannot support a reliable percentile.
MIN_SAMPLES = 6

# Gain ceiling. 8 is enough to drive the opaque corner logo (which sits around
# 30-60) to white, without amplifying sensor noise in the darker parts of a
# photo to the point where it shows.
MAX_GAIN = 8.0

# Pixels at or above this are treated as unmarked, so untouched areas pass
# through bit-for-bit instead of picking up a half-percent gain.
CLEAN = 250

# The blue keyline. Measured at 8px on the 1080 originals; trimmed as a
# fraction so it holds if a future batch arrives at another size.
BORDER_FRACTION = 0.009


def load_group(paths):
    return np.stack([np.asarray(Image.open(p).convert("RGB"), dtype=np.float32) for p in paths])


def estimate_overlay(stack):
    """Per-pixel, per-channel estimate of the overlay composited over white."""
    return np.percentile(stack, PERCENTILE, axis=0)


def unmark(image, gain):
    out = image * gain
    return np.clip(out, 0, 255).astype(np.uint8)


def trim(image):
    """Crop the keyline off, then restore the original dimensions."""
    height, width = image.shape[:2]
    inset = max(1, int(round(min(height, width) * BORDER_FRACTION)))
    cropped = image[inset : height - inset, inset : width - inset]
    return np.asarray(
        Image.fromarray(cropped).resize((width, height), Image.LANCZOS),
        dtype=np.uint8,
    )


def main():
    dry_run = "--dry-run" in sys.argv

    if not os.path.isdir(PARTS):
        raise SystemExit(f"missing {PARTS} — run fetch-reference-media.py first")

    groups = defaultdict(list)
    for family in sorted(os.listdir(PARTS)):
        directory = os.path.join(PARTS, family)
        if not os.path.isdir(directory) or family.startswith("."):
            continue
        for name in sorted(os.listdir(directory)):
            if not name.lower().endswith(EXTENSIONS):
                continue
            path = os.path.join(directory, name)
            with Image.open(path) as probe:
                groups[probe.size].append(path)

    if not groups:
        raise SystemExit(f"no product photos under {PARTS}")

    total = 0
    for size, paths in sorted(groups.items(), key=lambda item: -len(item[1])):
        label = f"{size[0]}x{size[1]}"

        if len(paths) < MIN_SAMPLES:
            print(f"  {label:<12} {len(paths):>3} images — too few to estimate, skipped")
            continue

        stack = load_group(paths)
        overlay = estimate_overlay(stack)

        marked = (overlay < CLEAN).any(axis=2)
        coverage = 100 * marked.mean()
        print(f"  {label:<12} {len(paths):>3} images — overlay covers {coverage:.1f}% of the frame")

        if dry_run:
            continue

        # Gain of exactly 1 wherever the estimate says the pixel is clean, so
        # the untouched majority of the photo is not re-encoded through a
        # multiply at all.
        gain = np.where(overlay < CLEAN, 255.0 / np.maximum(overlay, 1.0), 1.0)
        np.clip(gain, 1.0, MAX_GAIN, out=gain)

        for path in paths:
            if not os.path.exists(BACKUP):
                os.makedirs(BACKUP, exist_ok=True)
            backup = os.path.join(BACKUP, os.path.relpath(path, PARTS).replace(os.sep, "__"))
            if not os.path.exists(backup):
                shutil.copy2(path, backup)

            source = np.asarray(Image.open(path).convert("RGB"), dtype=np.float32)
            Image.fromarray(trim(unmark(source, gain))).save(path, quality=92, lossless=False)
            total += 1

    print(f"\n{'estimated' if dry_run else 'cleaned'} {total} images")
    if not dry_run:
        print(f"originals kept in {BACKUP}")


if __name__ == "__main__":
    main()
