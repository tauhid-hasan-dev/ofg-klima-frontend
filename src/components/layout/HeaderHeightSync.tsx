"use client";

import { useEffect } from "react";

/**
 * Keeps `--header-h` equal to the sticky header's real height.
 *
 * The hero sizes itself as `100dvh - var(--header-h)`, so that value has to be
 * exact or the first screen either overshoots (spurious scrollbar) or falls
 * short (gap under the fold). A static CSS value cannot be correct, because the
 * header's height genuinely changes:
 *
 *   - the nav links wrap to two lines between lg and xl;
 *   - the dark utility bar only exists from lg up;
 *   - web fonts load with `display: swap`, which re-flows the header after
 *     first paint.
 *
 * globals.css keeps sensible per-breakpoint fallbacks so server-rendered HTML
 * is already close; this refines it on the client and tracks it from then on.
 */
export function HeaderHeightSync() {
  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;

    const apply = () => {
      const { height } = header.getBoundingClientRect();
      if (height > 0) {
        document.documentElement.style.setProperty("--header-h", `${height}px`);
      }
    };

    apply();

    const observer = new ResizeObserver(apply);
    observer.observe(header);

    // Font swap changes the header's height after the observer's first read.
    document.fonts?.ready.then(apply).catch(() => {});

    return () => observer.disconnect();
  }, []);

  return null;
}
