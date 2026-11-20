import type { ElementType, ReactNode } from "react";
import { clsx } from "@/lib/utils";

/**
 * The single page gutter. Every full-width band on the site wraps its contents
 * in this so vertical edges line up from the header to the footer.
 */
export function Container({
  as: Tag = "div",
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return <Tag className={clsx("mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8", className)}>{children}</Tag>;
}

/** Section heading with the brand's navy underscore rule. */
export function SectionHeading({
  title,
  href,
  hrefLabel = "Tümünü Gör",
  className,
}: {
  title: string;
  href?: string;
  hrefLabel?: string;
  className?: string;
}) {
  return (
    <div className={clsx("mb-6 flex items-end justify-between gap-4", className)}>
      <h2 className="relative pb-3 font-display text-xl font-extrabold tracking-tight uppercase sm:text-2xl">
        {title}
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-1 w-16 bg-navy-600"
        />
      </h2>
      {href ? (
        <a
          href={href}
          className="shrink-0 border-b border-transparent pb-0.5 text-sm font-semibold text-ink-600 transition-colors hover:border-ink-900 hover:text-ink-900"
        >
          {hrefLabel}
        </a>
      ) : null}
    </div>
  );
}
