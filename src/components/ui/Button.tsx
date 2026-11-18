import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "whatsapp" | "danger";
type Size = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap rounded-md " +
  "transition-[background-color,color,border-color,box-shadow,transform] duration-150 " +
  "active:translate-y-px disabled:pointer-events-none disabled:opacity-50";

const VARIANTS: Record<Variant, string> = {
  // Yellow is the brand's loudest surface — reserve it for the single primary
  // action in any view.
  primary: "bg-brand-400 text-ink-950 hover:bg-brand-300 shadow-[inset_0_-2px_0_rgba(0,0,0,0.12)]",
  secondary: "bg-ink-900 text-white hover:bg-ink-800",
  outline: "border border-ink-300 bg-white text-ink-800 hover:border-ink-900 hover:bg-ink-50",
  ghost: "text-ink-700 hover:bg-ink-100 hover:text-ink-900",
  whatsapp: "bg-whatsapp text-white hover:bg-whatsapp-dark",
  danger: "bg-signal-500 text-white hover:bg-signal-600",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-[0.95rem]",
  lg: "h-13 px-7 text-base",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  external,
  ...rest
}: CommonProps & {
  href: string;
  external?: boolean;
  rel?: string;
  target?: string;
  "aria-label"?: string;
}) {
  const classes = clsx(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className);

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}
