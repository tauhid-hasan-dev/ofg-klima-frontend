import Image from "next/image";
import { clsx } from "@/lib/utils";
import { site } from "@/lib/site";

/**
 * OFG lockup — the client's own artwork.
 *
 * Three colour variants are derived from the single PNG they supplied, because
 * one file cannot sit on all three of the surfaces this site has:
 *
 *   onLight  the artwork as supplied — navy "OF G" over red, black tagline
 *   onDark   navy and tagline go white, red lightens, for the ink-950 footer
 *   onBrand  everything goes white, for the brand-red mobile drawer header
 *
 * The source is 281x81 with a transparent background, so it is rendered at or
 * below half its pixel width (≈140 CSS px) and stays crisp on 2x screens. If
 * OFG ever supplies vector artwork, swap the four `src` values for .svg and
 * delete the width/height pair — nothing else here changes.
 */

type LogoTone = "onLight" | "onBrand" | "onDark";

const SOURCES: Record<LogoTone, { full: string; mark: string }> = {
  onLight: { full: "/brand/ofg-logo.png", mark: "/brand/ofg-mark.png" },
  onBrand: { full: "/brand/ofg-logo-white.png", mark: "/brand/ofg-mark-white.png" },
  onDark: { full: "/brand/ofg-logo-light.png", mark: "/brand/ofg-mark-light.png" },
};

/** Intrinsic pixel sizes, needed so Next can reserve the box before load. */
const SIZES = {
  full: { width: 281, height: 81 },
  mark: { width: 167, height: 57 },
};

export function Logo({
  tone = "onLight",
  className,
  /** Drops the "OTO KLİMA YEDEK PARÇA" line, leaving the arc and the letters. */
  showTagline = true,
  priority = false,
}: {
  tone?: LogoTone;
  /** Must include a height utility, e.g. "h-11". */
  className: string;
  showTagline?: boolean;
  priority?: boolean;
}) {
  const variant = showTagline ? "full" : "mark";
  const { width, height } = SIZES[variant];

  return (
    <Image
      src={SOURCES[tone][variant]}
      alt={site.legalName}
      width={width}
      height={height}
      priority={priority}
      /*
       * The caller sets the height and the width follows the aspect ratio.
       * `w-auto` is required alongside it or Next's width attribute wins and
       * the logo stretches. No default height here on purpose: a default would
       * sit in the same class list as the caller's `h-*`, and which one wins
       * would then depend on Tailwind's stylesheet order rather than on
       * anything written at the call site.
       */
      className={clsx("w-auto", className)}
    />
  );
}
