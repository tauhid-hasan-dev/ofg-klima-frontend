# -*- coding: utf-8 -*-
"""
Generates the demo product imagery in public/parts/.

    python scripts/build-part-images.py

These are placeholder *renders*, not photographs — OFG's own product photos
should replace them before launch, by dropping files at the same paths. They
exist so the catalogue reads like a catalogue: every part family gets three
distinct views (main, angle, detail) with machined-metal shading and a soft
floor shadow, so a grid of compressors no longer looks like the same clip-art
repeated sixty times.

Output, per family:
    public/parts/<family>-1.svg   main view    — product card thumbnail
    public/parts/<family>-2.svg   angled view  — alternates as the thumbnail
    public/parts/<family>-3.svg   detail view  — gallery only, never the lead
    public/parts/<family>.svg     copy of -1   — category card and mega menu

`partFamily()` in src/lib/data/products.ts decides which family a category
maps to; keep the names here in step with it.

No dependencies beyond the standard library.
"""

import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "parts")

W = H = 800

# ── Shared defs ──────────────────────────────────────────────────────────────
# One palette for every part so a mixed grid reads as one photo shoot: cool
# machined aluminium, warm brass for fittings, near-black for rubber, and the
# brand red reserved for caps, labels and seals.

COMMON_DEFS = """
  <radialGradient id="bg" cx="50%" cy="42%" r="72%">
    <stop offset="0%" stop-color="#fbfbfa"/>
    <stop offset="100%" stop-color="#ececea"/>
  </radialGradient>

  <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stop-color="#b9bcc0"/>
    <stop offset="18%"  stop-color="#eef0f2"/>
    <stop offset="45%"  stop-color="#c8ccd1"/>
    <stop offset="72%"  stop-color="#8f949b"/>
    <stop offset="100%" stop-color="#6d727a"/>
  </linearGradient>

  <linearGradient id="steelX" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%"   stop-color="#80858d"/>
    <stop offset="22%"  stop-color="#dfe2e5"/>
    <stop offset="55%"  stop-color="#b4b9bf"/>
    <stop offset="100%" stop-color="#787d85"/>
  </linearGradient>

  <linearGradient id="alu" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stop-color="#d7dbe0"/>
    <stop offset="35%"  stop-color="#f3f5f7"/>
    <stop offset="70%"  stop-color="#bcc1c8"/>
    <stop offset="100%" stop-color="#90959d"/>
  </linearGradient>

  <linearGradient id="dark" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stop-color="#4a4d52"/>
    <stop offset="30%"  stop-color="#2e3135"/>
    <stop offset="100%" stop-color="#17191c"/>
  </linearGradient>

  <linearGradient id="brass" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stop-color="#e3c88b"/>
    <stop offset="35%"  stop-color="#c9a køb"/>
    <stop offset="100%" stop-color="#8d7332"/>
  </linearGradient>

  <linearGradient id="red" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stop-color="#f4585e"/>
    <stop offset="45%"  stop-color="#e71a21"/>
    <stop offset="100%" stop-color="#a30f15"/>
  </linearGradient>

  <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stop-color="#ffffff" stop-opacity="0.75"/>
    <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
  </linearGradient>

  <radialGradient id="hub" cx="38%" cy="32%" r="75%">
    <stop offset="0%"   stop-color="#f2f4f6"/>
    <stop offset="55%"  stop-color="#b6bbc1"/>
    <stop offset="100%" stop-color="#70757d"/>
  </radialGradient>

  <filter id="drop" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="16"/>
  </filter>

  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="4"/>
  </filter>
"""

# The brass gradient above had a stray character; define it cleanly instead.
COMMON_DEFS = COMMON_DEFS.replace('stop-color="#c9a køb"', 'stop-color="#c9a95b"')

STROKE = '#5a5f66'


def doc(body, extra_defs=""):
    """Wraps a drawing in an 800x800 canvas with a transparent background.

    Transparent rather than a studio gradient: the same file is used on a white
    product page, on an ink-50 category card and inside the mega menu, and a
    baked-in background shows up as a visible lighter tile on every one of
    them. The soft floor shadow does the work the gradient would have.
    """
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" '
        'width="%d" height="%d" role="img">\n'
        "<defs>%s%s</defs>\n"
        "%s\n</svg>\n"
    ) % (W, H, W, H, COMMON_DEFS, extra_defs, body)


def shadow(cx, cy, rx, ry, opacity=0.28):
    """Soft contact shadow on the studio floor."""
    return (
        '<ellipse cx="%g" cy="%g" rx="%g" ry="%g" fill="#1b1d20" '
        'opacity="%g" filter="url(#drop)"/>' % (cx, cy, rx, ry, opacity)
    )


def pulley(cx, cy, r, grooves=5):
    """A belt pulley seen face-on: rim, V-grooves, clutch plate, hub."""
    out = ['<circle cx="%g" cy="%g" r="%g" fill="url(#hub)" stroke="%s" stroke-width="3"/>'
           % (cx, cy, r, STROKE)]
    for i in range(grooves):
        rr = r - 10 - i * (r * 0.052)
        out.append('<circle cx="%g" cy="%g" r="%g" fill="none" stroke="#6b7079" '
                   'stroke-width="3" opacity="0.65"/>' % (cx, cy, rr))
    inner = r * 0.56
    out.append('<circle cx="%g" cy="%g" r="%g" fill="url(#alu)" stroke="%s" stroke-width="3"/>'
               % (cx, cy, inner, STROKE))
    out.append('<circle cx="%g" cy="%g" r="%g" fill="url(#red)" opacity="0.9"/>'
               % (cx, cy, inner * 0.52))
    out.append('<circle cx="%g" cy="%g" r="%g" fill="url(#dark)"/>' % (cx, cy, inner * 0.22))
    # Three clutch-plate rivets.
    for ang in (0, 120, 240):
        import math
        a = math.radians(ang - 90)
        out.append('<circle cx="%g" cy="%g" r="7" fill="#50555c"/>'
                   % (cx + math.cos(a) * inner * 0.78, cy + math.sin(a) * inner * 0.78))
    out.append('<path d="M %g %g a %g %g 0 0 1 %g %g" fill="none" stroke="#ffffff" '
               'stroke-width="10" stroke-linecap="round" opacity="0.5"/>'
               % (cx - r * 0.72, cy - r * 0.42, r, r, r * 0.52, -r * 0.44))
    return "\n".join(out)


def ribs(x, y, w, h, count, opacity=0.5):
    out = []
    for i in range(1, count):
        xx = x + w * i / count
        out.append('<line x1="%g" y1="%g" x2="%g" y2="%g" stroke="#6f747c" '
                   'stroke-width="4" opacity="%g"/>' % (xx, y, xx, y + h, opacity))
    return "\n".join(out)


def port(cx, cy, r=26, h=46, fill="url(#steelX)"):
    """A short cylindrical service port standing proud of a body."""
    return (
        '<rect x="%g" y="%g" width="%g" height="%g" rx="6" fill="%s" stroke="%s" stroke-width="3"/>'
        '<ellipse cx="%g" cy="%g" rx="%g" ry="%g" fill="url(#alu)" stroke="%s" stroke-width="3"/>'
        '<ellipse cx="%g" cy="%g" rx="%g" ry="%g" fill="url(#dark)"/>'
    ) % (cx - r, cy, r * 2, h, fill, STROKE,
         cx, cy, r, r * 0.42, STROKE,
         cx, cy, r * 0.52, r * 0.22)


def label(x, y, w, h, text_rows):
    """A red product label with a couple of blank text bars."""
    out = ['<rect x="%g" y="%g" width="%g" height="%g" rx="8" fill="url(#red)"/>' % (x, y, w, h)]
    for i, frac in enumerate(text_rows):
        out.append('<rect x="%g" y="%g" width="%g" height="%g" rx="4" fill="#ffffff" opacity="%g"/>'
                   % (x + w * 0.1, y + h * (0.22 + i * 0.26), w * 0.8 * frac, h * 0.14,
                      0.9 if i == 0 else 0.55))
    return "\n".join(out)


# ── Part renderers ───────────────────────────────────────────────────────────
# Each returns a list of three SVG documents: main, angle, detail.


def kompresor():
    main = "\n".join([
        shadow(410, 630, 250, 36),
        # Body
        '<rect x="300" y="285" width="310" height="240" rx="48" fill="url(#steel)" stroke="%s" stroke-width="4"/>' % STROKE,
        ribs(320, 300, 270, 210, 9),
        '<rect x="312" y="296" width="286" height="58" rx="28" fill="url(#gloss)"/>',
        # Rear head
        '<rect x="590" y="272" width="96" height="266" rx="26" fill="url(#alu)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<rect x="600" y="286" width="76" height="40" rx="18" fill="url(#gloss)"/>',
        # Ports
        port(620, 258, 24, 36),
        port(668, 268, 20, 28),
        # Mounting feet
        '<rect x="330" y="515" width="92" height="52" rx="12" fill="url(#alu)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<rect x="498" y="515" width="92" height="52" rx="12" fill="url(#alu)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<circle cx="376" cy="541" r="13" fill="url(#dark)"/>',
        '<circle cx="544" cy="541" r="13" fill="url(#dark)"/>',
        # Pulley
        pulley(238, 405, 132),
        '<rect x="356" y="330" width="4" height="150" fill="#ffffff" opacity="0.35"/>',
    ])

    angle = "\n".join([
        shadow(420, 640, 230, 34),
        # Barrel seen at an angle: elliptical front face + swept body
        '<path d="M 300 300 L 560 268 Q 640 262 640 330 L 640 480 Q 640 548 560 542 L 300 512 Z" '
        'fill="url(#steelX)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<ellipse cx="300" cy="406" rx="72" ry="106" fill="url(#alu)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<ellipse cx="300" cy="406" rx="44" ry="68" fill="url(#hub)" stroke="%s" stroke-width="3"/>' % STROKE,
        '<ellipse cx="300" cy="406" rx="18" ry="28" fill="url(#red)"/>',
        ribs(380, 290, 230, 220, 7, 0.4),
        port(560, 248, 22, 34),
        port(612, 250, 18, 30),
        '<path d="M 330 312 Q 470 288 620 300" fill="none" stroke="#ffffff" stroke-width="12" '
        'opacity="0.4" stroke-linecap="round"/>',
        '<rect x="420" y="500" width="150" height="46" rx="12" fill="url(#alu)" stroke="%s" stroke-width="4"/>' % STROKE,
    ])

    detail = "\n".join([
        shadow(400, 660, 200, 28),
        pulley(400, 380, 250, 7),
        '<rect x="300" y="596" width="200" height="54" rx="14" fill="url(#alu)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<rect x="326" y="610" width="148" height="12" rx="6" fill="#6f747c" opacity="0.6"/>',
    ])
    return [main, angle, detail]


def kondenser():
    def core(x, y, w, h, fins=26):
        out = ['<rect x="%g" y="%g" width="%g" height="%g" fill="#cfd4d9" stroke="%s" stroke-width="4"/>'
               % (x, y, w, h, STROKE)]
        for i in range(1, fins):
            xx = x + w * i / fins
            out.append('<line x1="%g" y1="%g" x2="%g" y2="%g" stroke="#9aa0a7" stroke-width="5"/>'
                       % (xx, y + 4, xx, y + h - 4))
        for i in range(1, 7):
            yy = y + h * i / 7
            out.append('<line x1="%g" y1="%g" x2="%g" y2="%g" stroke="#7e848c" stroke-width="3" opacity="0.5"/>'
                       % (x + 4, yy, x + w - 4, yy))
        return "\n".join(out)

    main = "\n".join([
        shadow(400, 636, 262, 32),
        core(190, 218, 420, 348),
        '<rect x="152" y="206" width="48" height="372" rx="14" fill="url(#alu)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<rect x="600" y="206" width="48" height="372" rx="14" fill="url(#alu)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<rect x="162" y="220" width="18" height="120" rx="9" fill="url(#gloss)"/>',
        port(176, 186, 22, 34),
        port(624, 186, 22, 34),
        '<rect x="612" y="470" width="80" height="26" rx="13" fill="url(#brass)" stroke="%s" stroke-width="3"/>' % STROKE,
    ])

    angle = "\n".join([
        shadow(410, 630, 240, 30),
        '<path d="M 180 250 L 620 198 L 620 520 L 180 572 Z" fill="#cfd4d9" stroke="%s" stroke-width="4"/>' % STROKE,
        "\n".join('<line x1="%g" y1="%g" x2="%g" y2="%g" stroke="#9aa0a7" stroke-width="5"/>'
                  % (180 + 440 * i / 22, 572 - 52 * i / 22, 180 + 440 * i / 22, 250 - 52 * i / 22)
                  for i in range(1, 22)),
        '<path d="M 148 258 L 180 250 L 180 572 L 148 580 Z" fill="url(#alu)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<path d="M 620 198 L 652 206 L 652 528 L 620 520 Z" fill="url(#steelX)" stroke="%s" stroke-width="4"/>' % STROKE,
        port(164, 228, 20, 32),
        '<path d="M 200 262 L 600 214" stroke="#ffffff" stroke-width="10" opacity="0.4" stroke-linecap="round"/>',
    ])

    detail = "\n".join([
        shadow(400, 650, 210, 28),
        core(176, 250, 300, 320, 14),
        '<rect x="476" y="236" width="56" height="348" rx="16" fill="url(#alu)" stroke="%s" stroke-width="4"/>' % STROKE,
        port(504, 212, 26, 40),
        '<rect x="490" y="256" width="20" height="150" rx="10" fill="url(#gloss)"/>',
        label(548, 300, 110, 150, [1.0, 0.7, 0.85]),
    ])
    return [main, angle, detail]


def kasnak():
    main = "\n".join([shadow(400, 648, 210, 30), pulley(400, 380, 236, 6)])

    angle = "\n".join([
        shadow(400, 646, 230, 30),
        '<ellipse cx="400" cy="400" rx="236" ry="150" fill="url(#hub)" stroke="%s" stroke-width="4"/>' % STROKE,
        "\n".join('<ellipse cx="400" cy="400" rx="%g" ry="%g" fill="none" stroke="#6b7079" '
                  'stroke-width="3" opacity="0.6"/>' % (226 - i * 13, 143 - i * 8) for i in range(5)),
        '<ellipse cx="400" cy="400" rx="128" ry="82" fill="url(#alu)" stroke="%s" stroke-width="3"/>' % STROKE,
        '<ellipse cx="400" cy="400" rx="60" ry="38" fill="url(#red)"/>',
        '<ellipse cx="400" cy="400" rx="24" ry="15" fill="url(#dark)"/>',
        '<path d="M 230 330 a 236 150 0 0 1 150 -82" fill="none" stroke="#ffffff" stroke-width="12" '
        'opacity="0.5" stroke-linecap="round"/>',
    ])

    # Detail: the set — pulley, coil and plate side by side, which is what a
    # "kasnak seti" actually is.
    detail = "\n".join([
        shadow(400, 614, 262, 26),
        pulley(236, 352, 136, 5),
        '<circle cx="520" cy="300" r="112" fill="url(#dark)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<circle cx="520" cy="300" r="62" fill="url(#bg)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<path d="M 520 188 l 46 -34 l 18 26" fill="none" stroke="#b9801f" stroke-width="9" stroke-linecap="round"/>',
        '<circle cx="430" cy="516" r="96" fill="url(#alu)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<circle cx="430" cy="516" r="30" fill="url(#dark)"/>',
        '<circle cx="430" cy="516" r="66" fill="none" stroke="#7e848c" stroke-width="4" opacity="0.7"/>',
    ])
    return [main, angle, detail]


def fan():
    import math

    def blades(cx, cy, r, count=7, skew=28):
        out = []
        for i in range(count):
            a = math.radians(i * 360.0 / count)
            a2 = a + math.radians(skew)
            x1, y1 = cx + math.cos(a) * r * 0.26, cy + math.sin(a) * r * 0.26
            x2, y2 = cx + math.cos(a2) * r, cy + math.sin(a2) * r
            x3, y3 = cx + math.cos(a2 + 0.42) * r, cy + math.sin(a2 + 0.42) * r
            x4, y4 = cx + math.cos(a + 0.5) * r * 0.26, cy + math.sin(a + 0.5) * r * 0.26
            out.append('<path d="M %g %g Q %g %g %g %g L %g %g Q %g %g %g %g Z" fill="url(#dark)" '
                       'stroke="%s" stroke-width="3" opacity="0.95"/>'
                       % (x1, y1, (x1 + x2) / 2 + 18, (y1 + y2) / 2, x2, y2, x3, y3,
                          (x4 + x3) / 2 + 18, (y4 + y3) / 2, x4, y4, STROKE))
        return "\n".join(out)

    main = "\n".join([
        shadow(400, 650, 236, 30),
        '<rect x="128" y="128" width="544" height="544" rx="40" fill="#d9dde1" stroke="%s" stroke-width="5"/>' % STROKE,
        '<circle cx="400" cy="400" r="246" fill="url(#bg)" stroke="%s" stroke-width="5"/>' % STROKE,
        blades(400, 400, 232),
        '<circle cx="400" cy="400" r="78" fill="url(#hub)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<circle cx="400" cy="400" r="34" fill="url(#red)"/>',
        "\n".join('<circle cx="%g" cy="%g" r="16" fill="url(#dark)"/>' % (x, y)
                  for x, y in ((178, 178), (622, 178), (178, 622), (622, 622))),
    ])

    angle = "\n".join([
        shadow(400, 648, 220, 28),
        '<ellipse cx="400" cy="400" rx="256" ry="168" fill="#d9dde1" stroke="%s" stroke-width="5"/>' % STROKE,
        '<ellipse cx="400" cy="400" rx="222" ry="142" fill="url(#bg)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<g transform="translate(400 400) scale(1 0.64) translate(-400 -400)">%s</g>' % blades(400, 400, 212, 7, 34),
        '<ellipse cx="400" cy="400" rx="76" ry="48" fill="url(#hub)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<ellipse cx="400" cy="400" rx="32" ry="20" fill="url(#red)"/>',
        '<path d="M 200 348 a 256 168 0 0 1 150 -92" fill="none" stroke="#ffffff" stroke-width="12" '
        'opacity="0.5" stroke-linecap="round"/>',
    ])

    detail = "\n".join([
        shadow(400, 634, 180, 26),
        '<rect x="262" y="176" width="276" height="300" rx="26" fill="url(#dark)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<rect x="286" y="200" width="60" height="150" rx="24" fill="url(#gloss)" opacity="0.5"/>',
        '<circle cx="400" cy="508" r="110" fill="url(#hub)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<circle cx="400" cy="508" r="48" fill="url(#alu)" stroke="%s" stroke-width="3"/>' % STROKE,
        '<circle cx="400" cy="508" r="18" fill="url(#red)"/>',
        '<rect x="330" y="140" width="140" height="44" rx="12" fill="url(#alu)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<path d="M 300 476 l -78 46 M 500 476 l 78 46" stroke="#3b3f45" stroke-width="12" stroke-linecap="round"/>',
    ])
    return [main, angle, detail]


def valf():
    main = "\n".join([
        shadow(400, 636, 180, 28),
        '<rect x="276" y="236" width="248" height="300" rx="26" fill="url(#alu)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<rect x="296" y="256" width="60" height="150" rx="22" fill="url(#gloss)"/>',
        port(340, 206, 26, 40),
        port(460, 206, 26, 40),
        '<rect x="276" y="382" width="248" height="22" fill="#9aa0a7" opacity="0.65"/>',
        '<rect x="520" y="300" width="96" height="44" rx="12" fill="url(#brass)" stroke="%s" stroke-width="3"/>' % STROKE,
        '<rect x="184" y="300" width="96" height="44" rx="12" fill="url(#brass)" stroke="%s" stroke-width="3"/>' % STROKE,
        '<circle cx="400" cy="560" r="34" fill="url(#dark)"/>',
        '<rect x="384" y="520" width="32" height="40" fill="url(#steelX)"/>',
    ])

    angle = "\n".join([
        shadow(400, 628, 170, 26),
        '<path d="M 280 268 L 500 230 L 560 278 L 560 528 L 500 568 L 280 530 Z" fill="url(#steelX)" '
        'stroke="%s" stroke-width="4"/>' % STROKE,
        '<path d="M 280 268 L 500 230 L 560 278 L 340 316 Z" fill="url(#alu)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<path d="M 280 268 L 340 316 L 340 574 L 280 530 Z" fill="#b9bec4" stroke="%s" stroke-width="4"/>' % STROKE,
        port(400, 230, 22, 34),
        '<rect x="556" y="340" width="84" height="38" rx="10" fill="url(#brass)" stroke="%s" stroke-width="3"/>' % STROKE,
        '<path d="M 300 282 L 490 248" stroke="#ffffff" stroke-width="10" opacity="0.45" stroke-linecap="round"/>',
    ])

    detail = "\n".join([
        shadow(400, 640, 150, 24),
        '<rect x="320" y="300" width="160" height="300" rx="20" fill="url(#alu)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<rect x="336" y="318" width="40" height="140" rx="16" fill="url(#gloss)"/>',
        '<circle cx="400" cy="236" r="96" fill="url(#hub)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<circle cx="400" cy="236" r="58" fill="url(#bg)" stroke="%s" stroke-width="3"/>' % STROKE,
        '<path d="M 400 236 l 0 -44" stroke="#e71a21" stroke-width="8" stroke-linecap="round"/>',
        '<path d="M 400 236 l 34 22" stroke="#2e3135" stroke-width="8" stroke-linecap="round"/>',
        '<rect x="300" y="430" width="200" height="20" fill="#9aa0a7" opacity="0.6"/>',
    ])
    return [main, angle, detail]


def hortum():
    main = "\n".join([
        shadow(400, 646, 240, 28),
        '<path d="M 170 250 Q 400 110 540 300 Q 640 440 470 560" fill="none" stroke="url(#dark)" '
        'stroke-width="62" stroke-linecap="round"/>',
        '<path d="M 170 250 Q 400 110 540 300 Q 640 440 470 560" fill="none" stroke="#5c6066" '
        'stroke-width="40" stroke-linecap="round" opacity="0.5"/>',
        '<path d="M 186 238 Q 400 104 530 286" fill="none" stroke="#ffffff" stroke-width="10" '
        'opacity="0.28" stroke-linecap="round"/>',
        # Crimped fittings at each end
        '<g transform="rotate(-28 170 250)"><rect x="94" y="214" width="112" height="72" rx="14" '
        'fill="url(#steelX)" stroke="%s" stroke-width="4"/>%s</g>'
        % (STROKE, ribs(104, 220, 92, 60, 5, 0.5)),
        '<g transform="rotate(-28 170 250)"><rect x="60" y="222" width="44" height="56" rx="10" '
        'fill="url(#brass)" stroke="%s" stroke-width="3"/></g>' % STROKE,
        '<g transform="rotate(34 470 560)"><rect x="414" y="524" width="112" height="72" rx="14" '
        'fill="url(#steelX)" stroke="%s" stroke-width="4"/>%s</g>'
        % (STROKE, ribs(424, 530, 92, 60, 5, 0.5)),
        '<g transform="rotate(34 470 560)"><rect x="526" y="532" width="44" height="56" rx="10" '
        'fill="url(#brass)" stroke="%s" stroke-width="3"/></g>' % STROKE,
    ])

    angle = "\n".join([
        shadow(400, 640, 230, 26),
        '<path d="M 150 420 Q 300 180 450 420 Q 600 660 680 420" fill="none" stroke="url(#dark)" '
        'stroke-width="56" stroke-linecap="round"/>',
        '<path d="M 150 420 Q 300 180 450 420 Q 600 660 680 420" fill="none" stroke="#5c6066" '
        'stroke-width="34" stroke-linecap="round" opacity="0.45"/>',
        '<path d="M 170 400 Q 300 196 436 404" fill="none" stroke="#ffffff" stroke-width="9" '
        'opacity="0.26" stroke-linecap="round"/>',
        '<rect x="104" y="384" width="96" height="72" rx="14" fill="url(#steelX)" stroke="%s" stroke-width="4"/>' % STROKE,
        ribs(112, 390, 80, 60, 4, 0.5),
        '<rect x="636" y="384" width="96" height="72" rx="14" fill="url(#steelX)" stroke="%s" stroke-width="4"/>' % STROKE,
        ribs(644, 390, 80, 60, 4, 0.5),
    ])

    detail = "\n".join([
        shadow(400, 626, 190, 26),
        '<path d="M 120 400 L 420 400" stroke="url(#dark)" stroke-width="96" stroke-linecap="round"/>',
        '<path d="M 120 364 L 420 364" stroke="#ffffff" stroke-width="12" opacity="0.22" stroke-linecap="round"/>',
        '<rect x="396" y="330" width="160" height="140" rx="20" fill="url(#steelX)" stroke="%s" stroke-width="5"/>' % STROKE,
        ribs(408, 340, 136, 120, 6, 0.55),
        '<rect x="548" y="344" width="72" height="112" rx="16" fill="url(#brass)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<ellipse cx="620" cy="400" rx="18" ry="56" fill="url(#alu)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<ellipse cx="620" cy="400" rx="8" ry="32" fill="url(#dark)"/>',
    ])
    return [main, angle, detail]


def gaz():
    main = "\n".join([
        shadow(400, 664, 150, 26),
        '<rect x="276" y="212" width="248" height="432" rx="32" fill="url(#red)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<rect x="296" y="236" width="56" height="200" rx="24" fill="url(#gloss)"/>',
        '<rect x="276" y="330" width="248" height="150" fill="#ffffff" opacity="0.92"/>',
        '<rect x="306" y="356" width="188" height="20" rx="10" fill="#2b2a29" opacity="0.8"/>',
        '<rect x="306" y="392" width="140" height="14" rx="7" fill="#2b2a29" opacity="0.45"/>',
        '<rect x="306" y="420" width="166" height="14" rx="7" fill="#2b2a29" opacity="0.45"/>',
        '<rect x="330" y="160" width="140" height="56" rx="12" fill="url(#alu)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<rect x="364" y="112" width="72" height="56" rx="14" fill="url(#brass)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<ellipse cx="400" cy="644" rx="124" ry="22" fill="#a30f15"/>',
    ])

    angle = "\n".join([
        shadow(400, 660, 160, 26),
        '<rect x="248" y="236" width="300" height="408" rx="30" fill="url(#red)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<ellipse cx="398" cy="236" rx="150" ry="40" fill="#f4585e" stroke="%s" stroke-width="4"/>' % STROKE,
        '<rect x="268" y="260" width="54" height="190" rx="24" fill="url(#gloss)"/>',
        '<path d="M 248 360 L 548 360 L 548 500 L 248 500 Z" fill="#ffffff" opacity="0.9"/>',
        '<rect x="282" y="388" width="200" height="18" rx="9" fill="#2b2a29" opacity="0.75"/>',
        '<rect x="282" y="422" width="150" height="12" rx="6" fill="#2b2a29" opacity="0.45"/>',
        '<ellipse cx="398" cy="644" rx="150" ry="36" fill="#a30f15" stroke="%s" stroke-width="4"/>' % STROKE,
        '<rect x="346" y="150" width="104" height="90" rx="16" fill="url(#alu)" stroke="%s" stroke-width="4"/>' % STROKE,
    ])

    detail = "\n".join([
        shadow(400, 650, 140, 24),
        '<rect x="300" y="330" width="200" height="320" rx="26" fill="url(#red)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<rect x="318" y="350" width="44" height="150" rx="20" fill="url(#gloss)"/>',
        '<rect x="330" y="206" width="140" height="130" rx="18" fill="url(#alu)" stroke="%s" stroke-width="5"/>' % STROKE,
        '<circle cx="400" cy="256" r="46" fill="url(#hub)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<circle cx="400" cy="256" r="18" fill="url(#dark)"/>',
        '<path d="M 470 270 L 560 270" stroke="#3b3f45" stroke-width="22" stroke-linecap="round"/>',
        '<rect x="548" y="246" width="56" height="48" rx="10" fill="url(#brass)" stroke="%s" stroke-width="3"/>' % STROKE,
    ])
    return [main, angle, detail]


def kimyasal():
    main = "\n".join([
        shadow(400, 662, 140, 24),
        '<path d="M 300 300 L 500 300 L 520 640 Q 520 660 496 660 L 304 660 Q 280 660 280 640 Z" '
        'fill="#e8ebee" stroke="%s" stroke-width="4"/>' % STROKE,
        '<path d="M 300 420 L 506 420 L 518 630 Q 518 646 500 646 L 300 646 Z" fill="url(#red)" opacity="0.85"/>',
        '<rect x="312" y="326" width="40" height="230" rx="18" fill="url(#gloss)"/>',
        '<rect x="352" y="228" width="96" height="76" rx="10" fill="#d4d8dc" stroke="%s" stroke-width="4"/>' % STROKE,
        '<rect x="340" y="166" width="120" height="68" rx="14" fill="url(#dark)" stroke="%s" stroke-width="4"/>' % STROKE,
        ribs(348, 174, 104, 52, 8, 0.4),
        '<rect x="306" y="452" width="188" height="20" rx="10" fill="#ffffff" opacity="0.9"/>',
        '<rect x="306" y="490" width="140" height="14" rx="7" fill="#ffffff" opacity="0.6"/>',
        '<rect x="306" y="518" width="164" height="14" rx="7" fill="#ffffff" opacity="0.6"/>',
    ])

    angle = "\n".join([
        shadow(400, 656, 150, 24),
        '<path d="M 282 318 L 488 290 L 520 630 Q 520 652 494 654 L 306 654 Q 282 652 282 630 Z" '
        'fill="#e8ebee" stroke="%s" stroke-width="4"/>' % STROKE,
        '<ellipse cx="385" cy="312" rx="104" ry="26" fill="#f2f4f6" stroke="%s" stroke-width="4"/>' % STROKE,
        '<path d="M 288 440 L 504 416 L 518 626 Q 518 644 496 646 L 300 646 Z" fill="url(#red)" opacity="0.85"/>',
        '<rect x="296" y="344" width="36" height="200" rx="16" fill="url(#gloss)"/>',
        '<rect x="340" y="186" width="104" height="120" rx="16" fill="url(#dark)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<rect x="306" y="472" width="170" height="18" rx="9" fill="#ffffff" opacity="0.9"/>',
        '<rect x="306" y="506" width="124" height="12" rx="6" fill="#ffffff" opacity="0.6"/>',
    ])

    detail = "\n".join([
        shadow(400, 630, 180, 26),
        label(236, 268, 328, 300, [1.0, 0.72, 0.88]),
        '<rect x="266" y="296" width="80" height="80" rx="12" fill="#ffffff" opacity="0.92"/>',
        '<path d="M 306 316 l 0 40 M 286 336 l 40 0" stroke="#e71a21" stroke-width="10" stroke-linecap="round"/>',
        '<rect x="236" y="574" width="328" height="40" rx="10" fill="url(#dark)"/>',
        ribs(252, 582, 296, 24, 14, 0.35),
    ])
    return [main, angle, detail]


def evaporator():
    def finned(x, y, w, h, n):
        out = ['<rect x="%g" y="%g" width="%g" height="%g" rx="10" fill="#ced3d8" stroke="%s" stroke-width="4"/>'
               % (x, y, w, h, STROKE)]
        for i in range(1, n):
            yy = y + h * i / n
            out.append('<line x1="%g" y1="%g" x2="%g" y2="%g" stroke="#959ba2" stroke-width="5"/>'
                       % (x + 5, yy, x + w - 5, yy))
        return "\n".join(out)

    main = "\n".join([
        shadow(400, 630, 230, 30),
        finned(190, 230, 420, 330, 20),
        '<rect x="170" y="216" width="36" height="358" rx="12" fill="url(#alu)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<rect x="594" y="216" width="36" height="358" rx="12" fill="url(#alu)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<path d="M 188 216 q 0 -70 70 -70 l 90 0" fill="none" stroke="url(#steelX)" stroke-width="30" stroke-linecap="round"/>',
        '<path d="M 612 216 q 0 -70 -70 -70 l -60 0" fill="none" stroke="url(#steelX)" stroke-width="30" stroke-linecap="round"/>',
        '<rect x="326" y="118" width="60" height="56" rx="10" fill="url(#brass)" stroke="%s" stroke-width="3"/>' % STROKE,
        '<rect x="446" y="118" width="60" height="56" rx="10" fill="url(#brass)" stroke="%s" stroke-width="3"/>' % STROKE,
    ])

    angle = "\n".join([
        shadow(400, 624, 220, 28),
        '<path d="M 200 266 L 600 214 L 600 526 L 200 578 Z" fill="#ced3d8" stroke="%s" stroke-width="4"/>' % STROKE,
        "\n".join('<path d="M 200 %g L 600 %g" stroke="#959ba2" stroke-width="5"/>'
                  % (266 + 312 * i / 16, 214 + 312 * i / 16) for i in range(1, 16)),
        '<path d="M 168 274 L 200 266 L 200 578 L 168 586 Z" fill="url(#alu)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<path d="M 600 214 L 632 222 L 632 534 L 600 526 Z" fill="url(#steelX)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<path d="M 184 270 q 0 -64 64 -72 l 110 -14" fill="none" stroke="url(#steelX)" stroke-width="26" stroke-linecap="round"/>',
        '<rect x="340" y="156" width="56" height="48" rx="10" fill="url(#brass)" stroke="%s" stroke-width="3"/>' % STROKE,
    ])

    detail = "\n".join([
        shadow(400, 640, 190, 26),
        finned(230, 280, 300, 300, 9),
        '<rect x="206" y="266" width="34" height="328" rx="12" fill="url(#alu)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<path d="M 540 300 q 70 0 70 70 l 0 120" fill="none" stroke="url(#steelX)" stroke-width="34" stroke-linecap="round"/>',
        '<rect x="580" y="480" width="62" height="56" rx="12" fill="url(#brass)" stroke="%s" stroke-width="3"/>' % STROKE,
        '<rect x="222" y="292" width="14" height="110" rx="7" fill="url(#gloss)"/>',
    ])
    return [main, angle, detail]


def drayer():
    main = "\n".join([
        shadow(400, 662, 130, 24),
        '<rect x="300" y="190" width="200" height="460" rx="40" fill="url(#steel)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<rect x="318" y="214" width="44" height="220" rx="20" fill="url(#gloss)"/>',
        '<ellipse cx="400" cy="190" rx="100" ry="26" fill="url(#alu)" stroke="%s" stroke-width="4"/>' % STROKE,
        port(348, 160, 22, 34),
        port(452, 160, 22, 34),
        '<rect x="268" y="330" width="264" height="26" rx="8" fill="url(#dark)" opacity="0.85"/>',
        '<rect x="256" y="300" width="36" height="86" rx="10" fill="url(#alu)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<circle cx="274" cy="343" r="11" fill="url(#dark)"/>',
        '<circle cx="400" cy="520" r="30" fill="url(#bg)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<circle cx="400" cy="520" r="14" fill="url(#red)"/>',
    ])

    angle = "\n".join([
        shadow(400, 656, 140, 24),
        '<rect x="282" y="222" width="236" height="420" rx="36" fill="url(#steelX)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<ellipse cx="400" cy="222" rx="118" ry="34" fill="url(#alu)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<ellipse cx="400" cy="642" rx="118" ry="30" fill="#8f949b" stroke="%s" stroke-width="4"/>' % STROKE,
        '<rect x="300" y="250" width="42" height="200" rx="18" fill="url(#gloss)"/>',
        port(352, 190, 20, 32),
        port(452, 196, 18, 28),
        '<rect x="258" y="370" width="284" height="24" rx="8" fill="url(#dark)" opacity="0.8"/>',
        label(330, 452, 140, 120, [1.0, 0.7, 0.85]),
    ])

    detail = "\n".join([
        shadow(400, 636, 160, 24),
        '<rect x="320" y="330" width="160" height="300" rx="28" fill="url(#steel)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<ellipse cx="400" cy="330" rx="80" ry="24" fill="url(#alu)" stroke="%s" stroke-width="4"/>' % STROKE,
        port(400, 236, 42, 96),
        '<circle cx="400" cy="236" r="56" fill="none" stroke="#9aa0a7" stroke-width="5" opacity="0.6"/>',
        '<rect x="332" y="356" width="24" height="120" rx="12" fill="url(#gloss)"/>',
    ])
    return [main, angle, detail]


def oring():
    import math

    def ring(cx, cy, r, t, colour="url(#dark)"):
        return ('<circle cx="%g" cy="%g" r="%g" fill="none" stroke="%s" stroke-width="%g"/>'
                '<circle cx="%g" cy="%g" r="%g" fill="none" stroke="#ffffff" stroke-width="%g" '
                'opacity="0.22" transform="rotate(-35 %g %g)" stroke-dasharray="%g %g"/>'
                % (cx, cy, r, colour, t, cx, cy, r, t * 0.3, cx, cy, r * 1.1, r * 5))

    main = "\n".join([
        shadow(400, 630, 230, 30),
        ring(300, 320, 150, 42),
        ring(520, 430, 110, 34, "url(#red)"),
        ring(330, 540, 80, 26),
        ring(560, 230, 62, 22, "url(#red)"),
        '<circle cx="190" cy="520" r="44" fill="none" stroke="url(#brass)" stroke-width="18"/>',
        '<circle cx="640" cy="560" r="36" fill="none" stroke="url(#brass)" stroke-width="16"/>',
    ])

    angle = "\n".join([
        shadow(400, 620, 240, 28),
        "\n".join('<ellipse cx="400" cy="%g" rx="%g" ry="%g" fill="none" stroke="%s" stroke-width="30"/>'
                  % (250 + i * 68, 190 - i * 22, 54 - i * 7,
                     "url(#red)" if i % 2 else "url(#dark)")
                  for i in range(5)),
        '<ellipse cx="400" cy="250" rx="190" ry="54" fill="none" stroke="#ffffff" stroke-width="7" '
        'opacity="0.25" stroke-dasharray="120 420"/>',
    ])

    detail = "\n".join([
        shadow(400, 640, 180, 26),
        ring(400, 380, 220, 58),
        '<circle cx="400" cy="380" r="220" fill="none" stroke="#ffffff" stroke-width="14" '
        'opacity="0.2" stroke-dasharray="180 1200" transform="rotate(-40 400 380)"/>',
        '<circle cx="400" cy="380" r="92" fill="url(#alu)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<circle cx="400" cy="380" r="48" fill="url(#bg)" stroke="%s" stroke-width="3"/>' % STROKE,
    ])
    return [main, angle, detail]


def servis():
    def gauge(cx, cy, r, accent):
        import math
        out = ['<circle cx="%g" cy="%g" r="%g" fill="url(#hub)" stroke="%s" stroke-width="5"/>'
               % (cx, cy, r, STROKE),
               '<circle cx="%g" cy="%g" r="%g" fill="#fbfbfa" stroke="%s" stroke-width="3"/>'
               % (cx, cy, r * 0.84, STROKE)]
        for i in range(12):
            a = math.radians(i * 30 - 90)
            out.append('<line x1="%g" y1="%g" x2="%g" y2="%g" stroke="#4a4d52" stroke-width="4"/>'
                       % (cx + math.cos(a) * r * 0.74, cy + math.sin(a) * r * 0.74,
                          cx + math.cos(a) * r * 0.62, cy + math.sin(a) * r * 0.62))
        out.append('<path d="M %g %g A %g %g 0 0 1 %g %g" fill="none" stroke="%s" stroke-width="9" '
                   'stroke-linecap="round"/>'
                   % (cx - r * 0.56, cy - r * 0.44, r * 0.7, r * 0.7,
                      cx + r * 0.1, cy - r * 0.69, accent))
        out.append('<line x1="%g" y1="%g" x2="%g" y2="%g" stroke="#e71a21" stroke-width="6" '
                   'stroke-linecap="round"/>' % (cx, cy, cx + r * 0.5, cy - r * 0.42))
        out.append('<circle cx="%g" cy="%g" r="9" fill="#2e3135"/>' % (cx, cy))
        return "\n".join(out)

    main = "\n".join([
        shadow(400, 640, 240, 28),
        '<rect x="232" y="396" width="336" height="130" rx="22" fill="url(#alu)" stroke="%s" stroke-width="5"/>' % STROKE,
        gauge(300, 330, 128, "#2f6fb0"),
        gauge(512, 330, 128, "#e71a21"),
        '<circle cx="300" cy="500" r="34" fill="url(#dark)"/>',
        '<circle cx="512" cy="500" r="34" fill="url(#dark)"/>',
        '<path d="M 232 462 L 150 462 Q 110 462 110 500 L 110 600" fill="none" stroke="url(#dark)" '
        'stroke-width="26" stroke-linecap="round"/>',
        '<path d="M 568 462 L 650 462 Q 690 462 690 500 L 690 600" fill="none" stroke="#2f6fb0" '
        'stroke-width="26" stroke-linecap="round"/>',
        '<path d="M 400 526 L 400 620" stroke="url(#dark)" stroke-width="26" stroke-linecap="round"/>',
    ])

    angle = "\n".join([
        shadow(400, 630, 220, 28),
        '<rect x="252" y="250" width="300" height="340" rx="30" fill="url(#dark)" stroke="%s" stroke-width="5"/>' % STROKE,
        '<rect x="276" y="276" width="252" height="180" rx="16" fill="#d9dde1" stroke="%s" stroke-width="4"/>' % STROKE,
        '<rect x="298" y="300" width="208" height="30" rx="8" fill="#2f6fb0" opacity="0.8"/>',
        '<rect x="298" y="344" width="150" height="20" rx="6" fill="#4a4d52" opacity="0.6"/>',
        '<rect x="298" y="378" width="180" height="20" rx="6" fill="#4a4d52" opacity="0.6"/>',
        '<circle cx="330" cy="520" r="32" fill="url(#red)"/>',
        '<circle cx="430" cy="520" r="32" fill="url(#alu)" stroke="%s" stroke-width="3"/>' % STROKE,
        '<circle cx="520" cy="520" r="20" fill="url(#brass)"/>',
        '<path d="M 252 420 L 150 440" stroke="url(#dark)" stroke-width="24" stroke-linecap="round"/>',
    ])

    detail = "\n".join([
        shadow(400, 650, 190, 26),
        gauge(400, 360, 230, "#2f6fb0"),
        '<rect x="330" y="580" width="140" height="70" rx="16" fill="url(#alu)" stroke="%s" stroke-width="5"/>' % STROKE,
        '<circle cx="400" cy="615" r="22" fill="url(#dark)"/>',
    ])
    return [main, angle, detail]


def isitici():
    main = "\n".join([
        shadow(400, 640, 230, 28),
        '<rect x="214" y="280" width="372" height="250" rx="60" fill="url(#steel)" stroke="%s" stroke-width="4"/>' % STROKE,
        ribs(236, 296, 328, 218, 10, 0.4),
        '<rect x="228" y="294" width="344" height="56" rx="28" fill="url(#gloss)"/>',
        '<circle cx="214" cy="405" r="92" fill="url(#alu)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<circle cx="214" cy="405" r="54" fill="url(#dark)"/>',
        '<circle cx="586" cy="405" r="74" fill="url(#alu)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<circle cx="586" cy="405" r="40" fill="url(#bg)" stroke="%s" stroke-width="3"/>' % STROKE,
        '<path d="M 400 280 l 0 -80 l 90 0" fill="none" stroke="url(#steelX)" stroke-width="34" stroke-linecap="round"/>',
        '<rect x="300" y="530" width="200" height="46" rx="12" fill="url(#alu)" stroke="%s" stroke-width="4"/>' % STROKE,
        label(330, 352, 140, 110, [1.0, 0.68]),
    ])

    angle = "\n".join([
        shadow(400, 636, 215, 28),
        '<path d="M 230 310 L 540 268 Q 610 262 610 330 L 610 470 Q 610 538 540 532 L 230 490 Z" '
        'fill="url(#steelX)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<ellipse cx="230" cy="400" rx="70" ry="98" fill="url(#alu)" stroke="%s" stroke-width="4"/>' % STROKE,
        '<ellipse cx="230" cy="400" rx="38" ry="56" fill="url(#dark)"/>',
        ribs(300, 296, 260, 200, 8, 0.35),
        '<path d="M 420 280 q 0 -70 70 -76 l 70 -8" fill="none" stroke="url(#steelX)" stroke-width="28" stroke-linecap="round"/>',
        '<rect x="548" y="176" width="62" height="54" rx="12" fill="url(#brass)" stroke="%s" stroke-width="3"/>' % STROKE,
        '<rect x="340" y="496" width="180" height="42" rx="12" fill="url(#alu)" stroke="%s" stroke-width="4"/>' % STROKE,
    ])

    detail = "\n".join([
        shadow(400, 646, 170, 26),
        '<circle cx="400" cy="380" r="210" fill="url(#alu)" stroke="%s" stroke-width="5"/>' % STROKE,
        '<circle cx="400" cy="380" r="152" fill="url(#dark)" stroke="%s" stroke-width="4"/>' % STROKE,
        "\n".join('<path d="M 400 380 L %g %g" stroke="#6f747c" stroke-width="10" stroke-linecap="round"/>'
                  % (400 + 140 * __import__("math").cos(__import__("math").radians(i * 45)),
                     380 + 140 * __import__("math").sin(__import__("math").radians(i * 45)))
                  for i in range(8)),
        '<circle cx="400" cy="380" r="56" fill="url(#red)"/>',
        '<circle cx="400" cy="380" r="24" fill="url(#hub)"/>',
        '<rect x="300" y="580" width="200" height="54" rx="14" fill="url(#steelX)" stroke="%s" stroke-width="4"/>' % STROKE,
    ])
    return [main, angle, detail]


PARTS = {
    "kompresor": kompresor,
    "kondenser": kondenser,
    "kasnak": kasnak,
    "fan": fan,
    "valf": valf,
    "hortum": hortum,
    "gaz": gaz,
    "kimyasal": kimyasal,
    "evaporator": evaporator,
    "drayer": drayer,
    "oring": oring,
    "servis": servis,
    "isitici": isitici,
}


def main():
    os.makedirs(OUT, exist_ok=True)
    total = 0
    for name, fn in sorted(PARTS.items()):
        views = fn()
        for index, body in enumerate(views, start=1):
            path = os.path.join(OUT, "%s-%d.svg" % (name, index))
            with open(path, "w", encoding="utf-8") as fh:
                fh.write(doc(body))
            total += 1
        # The un-suffixed name is the category illustration (mega menu, category
        # cards). Writing view 1 to it keeps categories.ts untouched and means
        # the category art and the product art are the same drawing.
        with open(os.path.join(OUT, "%s.svg" % name), "w", encoding="utf-8") as fh:
            fh.write(doc(views[0]))
        total += 1
    print("wrote %d svg files to %s" % (total, os.path.relpath(OUT, ROOT)))


if __name__ == "__main__":
    main()
