import { clsx } from "@/lib/utils";

/**
 * OFG lockup.
 *
 * The mark is a hex nut — the single most recognisable object in any parts
 * catalogue — with a bolt slot cut into its face as negative space. The
 * wordmark is live HTML text rather than outlines so it stays crisp at every
 * size, is selectable, and inherits the loaded display font.
 *
 * NOTE: this is a stand-in. OFG has a real logo (serif "OFG", red/blue, with a
 * swoosh) visible in the client recording. Drop their asset into
 * `public/brand/` and swap `LogoMark` for an <Image> when it arrives.
 */

type LogoTone = "onLight" | "onBrand" | "onDark";

const TONES: Record<LogoTone, { nut: string; face: string; cut: string; word: string; accent: string }> = {
  // White backgrounds: black nut, yellow face.
  onLight: { nut: "#141413", face: "#ffd400", cut: "#141413", word: "text-ink-900", accent: "text-ink-900" },
  // The yellow header: invert so the mark reads as a cut-out.
  onBrand: { nut: "#141413", face: "#ffffff", cut: "#141413", word: "text-ink-950", accent: "text-ink-950" },
  // Dark footer: yellow nut, dark face.
  onDark: { nut: "#ffd400", face: "#141413", cut: "#ffd400", word: "text-white", accent: "text-brand-400" },
};

export function LogoMark({
  tone = "onLight",
  className,
}: {
  tone?: LogoTone;
  className?: string;
}) {
  const colors = TONES[tone];
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <polygon points="32,2 57.98,17 57.98,47 32,62 6.02,47 6.02,17" fill={colors.nut} />
      <polygon points="32,9 51.92,20.5 51.92,43.5 32,55 12.08,43.5 12.08,20.5" fill={colors.face} />
      <path
        d="M22 24 L42 24 M32 24 L32 46"
        fill="none"
        stroke={colors.cut}
        strokeWidth={7}
        strokeLinecap="square"
      />
    </svg>
  );
}

export function Logo({
  tone = "onLight",
  className,
  markClassName,
  showTagline = false,
}: {
  tone?: LogoTone;
  className?: string;
  markClassName?: string;
  showTagline?: boolean;
}) {
  const colors = TONES[tone];

  return (
    <span className={clsx("inline-flex items-center gap-2 sm:gap-2.5", className)}>
      <LogoMark tone={tone} className={clsx("h-8 w-8 shrink-0 sm:h-9 sm:w-9", markClassName)} />
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className={clsx(
            "font-display text-[1.35rem] font-extrabold tracking-[0.02em] uppercase sm:text-[1.6rem]",
            colors.word,
          )}
        >
          OFG
        </span>
        {showTagline ? (
          <span
            className={clsx(
              "mt-1 text-[0.6rem] font-semibold tracking-[0.18em] uppercase",
              tone === "onDark" ? "text-ink-400" : "text-ink-600",
            )}
          >
            Oto Klima Yedek Parça
          </span>
        ) : null}
      </span>
    </span>
  );
}
