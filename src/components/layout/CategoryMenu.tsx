"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronRightIcon, MenuIcon } from "@/components/ui/icons";
import type { Category } from "@/lib/types";
import { clsx } from "@/lib/utils";

export interface CategoryNode {
  category: Category;
  children: Category[];
}

/**
 * The "KATEGORİLER" mega menu.
 *
 * Opens on hover for pointer users (fast browsing) but is fully operable from
 * the keyboard: the trigger toggles on click/Enter, Escape closes and returns
 * focus, and the panel is a plain list of links so Tab order is linear.
 */
export function CategoryMenu({ tree }: { tree: CategoryNode[] }) {
  const [open, setOpen] = useState(false);
  const [activeSlug, setActiveSlug] = useState(tree[0]?.category.slug ?? "");
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const active = tree.find((node) => node.category.slug === activeSlug) ?? tree[0];

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    }
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  // A short grace period stops the panel snapping shut when the pointer
  // crosses the gap between the trigger and the panel.
  function scheduleClose() {
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  }
  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="true"
        className={clsx(
          "flex h-12 w-full items-center gap-3 rounded-lg bg-ink-950 pr-5 pl-2 text-left text-white transition-colors",
          "hover:bg-ink-800",
        )}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-brand-400 text-ink-950">
          <MenuIcon className="h-5 w-5" />
        </span>
        <span className="font-display text-[0.8rem] leading-tight font-bold tracking-wide uppercase">
          Oto Klima Yedek Parça
          <span className="block text-brand-400">Kategoriler</span>
        </span>
      </button>

      {open ? (
        <div
          className="absolute top-[calc(100%+0.5rem)] left-0 z-50 flex w-[min(62rem,calc(100vw-2rem))] overflow-hidden rounded-lg bg-white shadow-menu ring-1 ring-ink-950/10"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          {/* Column 1 — top-level categories */}
          <ul className="w-[19rem] shrink-0 border-r border-ink-200 bg-ink-50 py-2">
            {tree.map((node) => {
              const isActive = node.category.slug === active?.category.slug;
              return (
                <li key={node.category.slug}>
                  <Link
                    href={`/kategori/${node.category.slug}`}
                    onMouseEnter={() => setActiveSlug(node.category.slug)}
                    onFocus={() => setActiveSlug(node.category.slug)}
                    onClick={() => setOpen(false)}
                    className={clsx(
                      "flex items-center justify-between gap-2 border-l-[3px] px-4 py-2.5 text-sm font-semibold transition-colors",
                      isActive
                        ? "border-brand-400 bg-white text-ink-950"
                        : "border-transparent text-ink-700 hover:bg-white hover:text-ink-950",
                    )}
                  >
                    {node.category.name}
                    <ChevronRightIcon
                      className={clsx("h-4 w-4 shrink-0 transition-opacity", isActive ? "opacity-100" : "opacity-30")}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Column 2 — children of the hovered category */}
          {active ? (
            <div className="flex min-w-0 flex-1 gap-6 p-6">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/kategori/${active.category.slug}`}
                  onClick={() => setOpen(false)}
                  className="font-display text-lg font-extrabold tracking-tight text-ink-950 uppercase hover:underline"
                >
                  {active.category.name}
                </Link>
                {active.category.description ? (
                  <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-ink-600">
                    {active.category.description}
                  </p>
                ) : null}

                {active.children.length > 0 ? (
                  <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1">
                    {active.children.map((child) => (
                      <li key={child.slug}>
                        <Link
                          href={`/kategori/${child.slug}`}
                          onClick={() => setOpen(false)}
                          className="group flex items-center gap-2 py-1.5 text-sm text-ink-700 transition-colors hover:text-ink-950"
                        >
                          <span className="h-1 w-1 rounded-full bg-ink-300 transition-colors group-hover:bg-brand-500" />
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <Link
                  href={`/kategori/${active.category.slug}`}
                  onClick={() => setOpen(false)}
                  className="mt-5 inline-flex items-center gap-1.5 border-b-2 border-brand-400 pb-0.5 text-sm font-bold text-ink-950 uppercase"
                >
                  Tüm ürünleri gör
                  <ChevronRightIcon className="h-4 w-4" />
                </Link>
              </div>

              <div className="hidden w-44 shrink-0 self-center lg:block">
                <Image
                  src={active.category.image}
                  alt=""
                  width={400}
                  height={300}
                  className="h-auto w-full"
                />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
