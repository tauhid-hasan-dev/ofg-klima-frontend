# -*- coding: utf-8 -*-
"""
Downloads the storefront imagery listed in scripts/reference-media.json.

    python scripts/fetch-reference-media.py

PROVENANCE — read this before launch.

Most of what this script fetches is hosted by kafkasotoyedekparca.com and is
their copyright, not OFG's. It is here so the build has real photographs of
real parts while the site is being designed. It is NOT cleared for a live
commercial storefront. The exception is public/brands/: those are each
manufacturer's own wordmark, which a parts reseller displays as a matter of
course.

Replacing the rest is a file drop, not a code change. Put OFG's own (or the
manufacturer's supplied) photography at the same paths:

    public/banners/hero-1.jpg .. hero-3.jpg      hero slider
    public/banners/theme-1.png, theme-2.png      the two brand banners
    public/categories/<family>.jpg               category cards, mega menu

and re-run `python scripts/build-media-manifest.py` to regenerate the index at
src/lib/data/media.ts. Nothing in src/ names an individual photo.

AFTER FETCHING, RUN THESE TWO

    python scripts/strip-watermark.py        # takes the shop's name off the heroes
    python scripts/build-media-manifest.py   # regenerates src/lib/data/media.ts

The hero banners arrive with "KAFKAS / Oto Klima Yedek Parça" burned into the
top-right corner. The first script patches it out; until it has run, the home
page carries another shop's wordmark across the top of the fold.

WHY THERE ARE NO PER-PRODUCT PHOTOS HERE

The source catalogue's per-product shots were evaluated and rejected. Every
one carries a four-part KAFKAS overlay: a keyline, a corner logo, a snowflake,
and a large translucent wordmark running corner to corner *across the part
itself*. scripts/strip-product-watermark.py removes the first three and cannot
remove the fourth — where the wordmark crosses the product there is nothing
left to recover from. Shipping them would put another shop's name on every
card in the grid.

So the catalogue grid stays on the generated renders from build-part-images.py
until OFG supplies photography, and the real photographs fetched here are used
only where one image stands for a whole group: the hero, the two brand
banners, and the category cards.

PACING — measured, not guessed.

The host rate-limits images as hard as it does pages: roughly six requests in
quick succession, then 429 for minutes. Backing off after the ban is the wrong
shape — it costs ~150s per asset and turns a 120-file fetch into five hours.
Staying under the limit in the first place costs 12s per asset and finishes in
twenty-odd minutes, so `PAUSE` is deliberately large and the retry budget
deliberately small. Run it in the background and leave it alone.

Already-downloaded files are skipped, so an interrupted run resumes by simply
being re-run.

No dependencies beyond the standard library.
"""

import json
import os
import ssl
import sys
import time
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = os.path.join(ROOT, "scripts", "reference-media.json")
PUBLIC = os.path.join(ROOT, "public")

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)
HEADERS = {
    "User-Agent": UA,
    "Accept": "image/avif,image/webp,image/png,image/jpeg,*/*;q=0.8",
    "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
    "Referer": "https://www.kafkasotoyedekparca.com/",
}

# The host serves a self-signed chain on some edges; the payload is public
# imagery either way, so a verification failure should not abort the run.
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

PAUSE = 12  # seconds between requests — see PACING above
MIN_BYTES = 1024  # anything smaller is an error page, not a photograph


def log(message):
    """Print and flush — output is redirected to a file on every real run."""
    print(message)
    sys.stdout.flush()


def fetch(url, attempts=2):
    """GET `url`. Returns bytes, or None."""
    for attempt in range(1, attempts + 1):
        try:
            request = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(request, timeout=45, context=CTX) as response:
                return response.read()
        except urllib.error.HTTPError as error:
            if error.code == 429:
                # One long cool-off, then give up on this asset and keep the
                # run moving. A re-run picks up whatever was missed.
                log(f"    429, cooling off 90s (attempt {attempt})")
                time.sleep(90)
                continue
            if error.code == 404:
                return None
            log(f"    HTTP {error.code}")
            return None
        except Exception as error:  # noqa: BLE001 - network, keep going
            log(f"    {type(error).__name__}: {error}")
            time.sleep(10)
    return None


def save(data, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as handle:
        handle.write(data)


def download(url, dest, label):
    """
    Fetch one asset, preferring the full-size original.

    Their product thumbnails are named `<slug>_min.webp`; the same path without
    the suffix is the full-resolution upload. The product page gallery renders
    at ~900px, where the thumbnail is visibly soft, so try the original first
    and only fall back when it is missing.
    """
    if os.path.exists(dest) and os.path.getsize(dest) > MIN_BYTES:
        return "skip"

    candidates = [url.replace("_min.", ".")] if "_min." in url else []
    candidates.append(url)

    for candidate in candidates:
        data = fetch(candidate)
        time.sleep(PAUSE)
        if data and len(data) > MIN_BYTES:
            save(data, dest)
            size = "full" if candidate != url else "thumb"
            log(f"  {label}  {len(data) // 1024}KB ({size})")
            return "ok"

    log(f"  {label}  FAILED")
    return "fail"


def main():
    with open(MANIFEST, encoding="utf-8") as handle:
        manifest = json.load(handle)

    stats = {"ok": 0, "skip": 0, "fail": 0}

    log("== banners ==")
    for name, url in manifest["banners"].items():
        extension = os.path.splitext(url.split("?")[0])[1] or ".jpg"
        dest = os.path.join(PUBLIC, "banners", f"{name}{extension}")
        stats[download(url, dest, f"banners/{name}{extension}")] += 1

    log("== categories ==")
    for family, url in manifest["categories"].items():
        extension = os.path.splitext(url.split("?")[0])[1] or ".jpg"
        dest = os.path.join(PUBLIC, "categories", f"{family}{extension}")
        stats[download(url, dest, f"categories/{family}{extension}")] += 1

    log("== brands ==")
    for slug, url in manifest["brands"].items():
        dest = os.path.join(PUBLIC, "brands", f"{slug}.png")
        stats[download(url, dest, f"brands/{slug}.png")] += 1

    log(f"\ndownloaded {stats['ok']}, already present {stats['skip']}, failed {stats['fail']}")
    if stats["fail"]:
        log("Re-run to retry the failures; existing files are not re-fetched.")


if __name__ == "__main__":
    main()
