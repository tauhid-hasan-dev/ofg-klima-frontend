"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { clsx } from "@/lib/utils";

export interface Slide {
  eyebrow: string;
  title: string;
  text: string;
  href: string;
  cta: string;
  /** Full-bleed background photograph. Landscape, 1600px wide or more. */
  image: string;
  /**
   * `object-position` for the photograph.
   *
   * The copy sits over the left of the frame, so a photo whose subject is on
   * the left needs pushing right or the headline lands on top of it. Plain
   * CSS, e.g. "70% center".
   */
  focus?: string;
}

const INTERVAL = 6000;

/**
 * Full-bleed photographic hero.
 *
 * The section spans the full viewport width (it sits outside the page
 * Container) and fills exactly one screen below the sticky header via
 * `100dvh - --header-h`. `dvh` rather than `vh` so mobile browsers that
 * collapse their chrome on scroll do not leave a gap.
 *
 * Each slide is a photograph rather than a cut-out render, which is what the
 * reference storefront does and what a parts buyer responds to: a compressor
 * photographed on a bench reads as stock on a shelf, where the same part
 * floating on a gradient reads as a catalogue illustration.
 *
 * Legibility over photography is the whole problem here, and it is solved in
 * `.photo-scrim` (globals.css) rather than with a flat black overlay — these
 * photos run from bright studio white to a dark engine bay, and no single
 * opacity serves both.
 */
const FILL_SCREEN = "min-h-[calc(100dvh-var(--header-h))]";

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback(
    (next: number) => setIndex(((next % slides.length) + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (paused || slides.length < 2) return;

    // Respect the OS setting — an auto-advancing hero is exactly the kind of
    // motion `prefers-reduced-motion` exists to suppress.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    timer.current = setInterval(() => setIndex((current) => (current + 1) % slides.length), INTERVAL);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, slides.length]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Öne çıkan kampanyalar"
      className={clsx("relative isolate w-full overflow-hidden bg-navy-950", FILL_SCREEN)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* The workshop hazard rule, pinned to the bottom edge. */}
      <div aria-hidden="true" className="hazard-rule absolute inset-x-0 bottom-0 z-30 h-1.5 opacity-80" />

      {slides.map((slide, position) => {
        const isActive = position === index;

        return (
          <div
            key={slide.title}
            role="group"
            aria-roledescription="slide"
            aria-label={`${position + 1} / ${slides.length}`}
            aria-hidden={!isActive}
            className={clsx(
              "transition-opacity duration-700 motion-reduce:transition-none",
              // The active slide is in flow and so sets the section's height;
              // the rest stack underneath it. Both are positioned, which is
              // what `fill` on the photograph needs.
              isActive ? "relative" : "pointer-events-none absolute inset-0 opacity-0",
            )}
          >
            <Image
              src={slide.image}
              alt=""
              fill
              priority={position === 0}
              // Full-bleed at every breakpoint, so the browser should always
              // take the widest candidate it can justify.
              sizes="100vw"
              className="-z-10 object-cover"
              style={{ objectPosition: slide.focus ?? "center" }}
            />
            <div aria-hidden="true" className="photo-scrim pointer-events-none absolute inset-0 -z-10" />

            <Container
              className={clsx(
                FILL_SCREEN,
                "flex flex-col items-start justify-end pb-20 short:pb-14 sm:pb-24",
                "lg:justify-center lg:pb-24",
              )}
            >
              <div className="w-full max-w-2xl lg:max-w-[38rem] xl:max-w-[42rem]">
                <span className="inline-block bg-brand-500 px-2.5 py-1 font-display text-[0.7rem] font-bold tracking-[0.14em] text-white uppercase sm:text-xs">
                  {slide.eyebrow}
                </span>

                <h2 className="mt-4 font-display text-[clamp(1.9rem,6vw,4rem)] short:mt-2.5 short:text-[clamp(1.6rem,5vw,2.6rem)] leading-[1.04] font-extrabold tracking-tight text-white [text-shadow:0_2px_24px_rgba(17,16,42,0.55)]">
                  {slide.title}
                </h2>

                <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-navy-100 short:mt-2.5 short:text-sm sm:mt-5 sm:text-base lg:text-lg">
                  {slide.text}
                </p>

                <Link
                  href={slide.href}
                  tabIndex={isActive ? 0 : -1}
                  className="mt-7 inline-flex h-12 items-center gap-2 rounded-md bg-brand-500 px-6 short:mt-4 short:h-11 font-display text-sm font-bold tracking-wide text-white uppercase shadow-[0_10px_30px_-10px_rgba(231,26,33,0.85)] transition-transform hover:-translate-y-0.5 sm:mt-9 sm:h-14 sm:px-8 sm:text-base"
                >
                  {slide.cta}
                  <ChevronRightIcon className="h-5 w-5" />
                </Link>
              </div>
            </Container>
          </div>
        );
      })}

      {/*
        All three controls sit together at the bottom.

        The arrows used to be pinned to the left and right edges at the
        vertical centre, which is exactly where the headline is: at 1440px the
        left arrow landed on top of the body copy and ate the first two
        characters of every line it crossed. Grouping them with the dots keeps
        them off the copy at any width, and puts the three things that do the
        same job in the same place.
      */}
      {slides.length > 1 ? (
        <div className="absolute inset-x-0 bottom-7 z-20 flex items-center justify-center gap-4 sm:bottom-9">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Önceki slayt"
            className={ARROW}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            {slides.map((slide, position) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => go(position)}
                aria-label={`${position + 1}. slayta git`}
                aria-current={position === index}
                className={clsx(
                  "h-1.5 rounded-full transition-all duration-300",
                  position === index ? "w-10 bg-brand-500" : "w-3 bg-white/40 hover:bg-white/70",
                )}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Sonraki slayt"
            className={ARROW}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      ) : null}
    </section>
  );
}

const ARROW =
  "grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white backdrop-blur " +
  "transition-colors hover:bg-brand-500 hover:text-white";
