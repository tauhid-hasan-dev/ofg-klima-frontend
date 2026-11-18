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
  image: string;
}

const INTERVAL = 6000;

/**
 * Full-bleed hero.
 *
 * The section spans the full viewport width (it sits outside the page
 * Container) and fills exactly one screen below the sticky header via
 * `100dvh - --header-h`. `dvh` rather than `vh` so mobile browsers that
 * collapse their chrome on scroll do not leave a gap.
 *
 * Only the inner content is width-constrained, so on ultrawide displays the
 * background runs edge to edge while the text stays aligned with the rest of
 * the page.
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
      className={clsx("relative isolate w-full overflow-hidden bg-ink-950", FILL_SCREEN)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Atmosphere: a warm pool of light behind the part, plus the workshop
          hazard rule pinned to the bottom edge. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_75%_45%,rgba(255,212,0,0.16),transparent_70%)]"
      />
      <div aria-hidden="true" className="hazard-rule absolute inset-x-0 bottom-0 z-20 h-1.5 opacity-70" />

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
              "transition-opacity duration-500 motion-reduce:transition-none",
              isActive ? "relative" : "pointer-events-none absolute inset-0 opacity-0",
            )}
          >
            <Container
              className={clsx(
                FILL_SCREEN,
                "flex flex-col items-start justify-center gap-5 short:gap-3 sm:gap-8",
                "pt-6 pb-16 short:pt-4 short:pb-12 sm:pt-10 sm:pb-24",
                "lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:pb-20",
              )}
            >
              {/* Copy — second on mobile so the part image leads the screen */}
              <div className="order-2 w-full max-w-2xl lg:order-1">
                <span className="inline-block bg-brand-400 px-2.5 py-1 font-display text-[0.7rem] font-bold tracking-[0.14em] text-ink-950 uppercase sm:text-xs">
                  {slide.eyebrow}
                </span>

                <h2 className="mt-4 font-display text-[clamp(2rem,7vw,4.5rem)] short:mt-2.5 short:text-[clamp(1.6rem,6vw,3rem)] leading-[1.03] font-extrabold tracking-tight text-white">
                  {slide.title}
                </h2>

                <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-ink-300 short:mt-2.5 short:text-sm sm:mt-5 sm:text-base lg:text-lg">
                  {slide.text}
                </p>

                <Link
                  href={slide.href}
                  tabIndex={isActive ? 0 : -1}
                  className="mt-7 inline-flex h-12 items-center gap-2 rounded-md bg-brand-400 px-6 short:mt-4 short:h-11 font-display text-sm font-bold tracking-wide text-ink-950 uppercase transition-transform hover:-translate-y-0.5 sm:mt-9 sm:h-14 sm:px-8 sm:text-base"
                >
                  {slide.cta}
                  <ChevronRightIcon className="h-5 w-5" />
                </Link>
              </div>

              {/* Part illustration */}
              <div className="order-1 flex w-full justify-center lg:order-2 lg:justify-end">
                <Image
                  src={slide.image}
                  alt=""
                  width={620}
                  height={465}
                  priority={position === 0}
                  sizes="(min-width: 1024px) 45vw, 80vw"
                  className="h-auto max-h-[21vh] w-auto max-w-[17rem] short:max-h-[15vh] [filter:drop-shadow(0_24px_48px_rgba(0,0,0,0.5))] sm:max-h-[30vh] sm:max-w-[28rem] lg:max-h-[52vh] lg:max-w-full"
                />
              </div>
            </Container>
          </div>
        );
      })}

      {slides.length > 1 ? (
        <>
          <div className="absolute inset-x-0 bottom-7 z-20 flex items-center justify-center gap-2 sm:bottom-9">
            {slides.map((slide, position) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => go(position)}
                aria-label={`${position + 1}. slayta git`}
                aria-current={position === index}
                className={clsx(
                  "h-1.5 rounded-full transition-all duration-300",
                  position === index ? "w-10 bg-brand-400" : "w-3 bg-white/30 hover:bg-white/60",
                )}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Önceki slayt"
            className="absolute top-1/2 left-3 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-brand-400 hover:text-ink-950 xl:grid"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Sonraki slayt"
            className="absolute top-1/2 right-3 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-brand-400 hover:text-ink-950 xl:grid"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </>
      ) : null}
    </section>
  );
}
