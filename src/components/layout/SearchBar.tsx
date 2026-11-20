"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { SearchIcon, CloseIcon } from "@/components/ui/icons";
import { clsx } from "@/lib/utils";

/**
 * Compact search index handed down from the server. Keeping it to four short
 * fields means the whole catalogue costs a few KB and suggestions resolve
 * instantly, with no API round-trip — which is what a parts counter needs when
 * someone is reading a code off a box over the phone.
 */
export interface SearchIndexEntry {
  slug: string;
  name: string;
  oem: string;
  brand: string;
}

const MAX_SUGGESTIONS = 7;

function normaliseCode(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function score(entry: SearchIndexEntry, term: string, codeTerm: string): number {
  const name = entry.name.toLowerCase();
  const code = normaliseCode(entry.oem);

  // Exact code hits win outright — that is almost always what was typed.
  if (codeTerm.length >= 3 && code === codeTerm) return 0;
  if (codeTerm.length >= 3 && code.startsWith(codeTerm)) return 1;
  if (codeTerm.length >= 3 && code.includes(codeTerm)) return 2;
  if (name.startsWith(term)) return 3;

  const tokens = term.split(/\s+/).filter(Boolean);
  const haystack = `${name} ${entry.brand.toLowerCase()}`;
  if (tokens.every((token) => haystack.includes(token))) return 4;

  return Number.POSITIVE_INFINITY;
}

export function SearchBar({
  index,
  className,
  autoFocus = false,
  onNavigate,
}: {
  index: SearchIndexEntry[];
  className?: string;
  autoFocus?: boolean;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const listboxId = useId();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const trimmed = term.trim().toLowerCase();
    if (trimmed.length < 2) return [];
    const codeTerm = normaliseCode(trimmed);

    return index
      .map((entry) => ({ entry, rank: score(entry, trimmed, codeTerm) }))
      .filter((hit) => Number.isFinite(hit.rank))
      .sort((a, b) => a.rank - b.rank || a.entry.name.length - b.entry.name.length)
      .slice(0, MAX_SUGGESTIONS)
      .map((hit) => hit.entry);
  }, [index, term]);

  /** Any change to the term invalidates the highlighted row. */
  function updateTerm(next: string) {
    setTerm(next);
    setActiveIndex(-1);
  }

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function go(href: string) {
    setOpen(false);
    setActiveIndex(-1);
    onNavigate?.();
    router.push(href);
  }

  function submit() {
    const trimmed = term.trim();
    if (!trimmed) return;
    go(`/arama?q=${encodeURIComponent(trimmed)}`);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (suggestions.length === 0) return;
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => {
        const next = event.key === "ArrowDown" ? current + 1 : current - 1;
        if (next < -1) return suggestions.length - 1;
        if (next >= suggestions.length) return -1;
        return next;
      });
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const active = suggestions[activeIndex];
      if (active) go(`/urun/${active.slug}`);
      else submit();
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  const showPanel = open && suggestions.length > 0;

  return (
    <div ref={rootRef} className={clsx("relative", className)}>
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        /*
          `outline` for the focus state, not `ring`. Tailwind's ring is itself
          a box-shadow, and it would replace the four-layer shadow that gives
          `.control-surface` its relief rather than sitting on top of it.
        */
        className="control-surface flex h-12 items-stretch overflow-hidden rounded-lg focus-within:outline-2 focus-within:outline-offset-0 focus-within:outline-navy-600"
      >
        <label htmlFor={`${listboxId}-input`} className="sr-only">
          Ürün ara
        </label>
        <input
          id={`${listboxId}-input`}
          type="search"
          value={term}
          autoFocus={autoFocus}
          onChange={(event) => {
            updateTerm(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Aradığınız ürünü veya parça kodunu yazın…"
          autoComplete="off"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={showPanel ? listboxId : undefined}
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
          className="min-w-0 flex-1 bg-transparent px-4 text-[0.95rem] text-ink-900 outline-none placeholder:text-ink-400 [&::-webkit-search-cancel-button]:hidden"
        />

        {term ? (
          <button
            type="button"
            onClick={() => {
              updateTerm("");
              setOpen(false);
            }}
            className="grid w-9 place-items-center text-ink-400 transition-colors hover:text-ink-900"
            aria-label="Aramayı temizle"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        ) : null}

        {/*
          Red, and the only red in the header — it is the one control that
          commits an action. Icon alone: a magnifier inside a red block is
          already unambiguous, and the label was the widest thing in the row.
          `aria-label` keeps it announced.
        */}
        <button
          type="submit"
          className="grid w-14 place-items-center bg-brand-500 text-white transition-colors hover:bg-brand-600"
          aria-label="Ara"
        >
          <SearchIcon className="h-5 w-5" />
        </button>
      </form>

      {showPanel ? (
        <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-lg bg-white shadow-menu ring-1 ring-navy-900/10">
          <ul id={listboxId} role="listbox" aria-label="Ürün önerileri" className="max-h-[22rem] overflow-y-auto py-1">
            {suggestions.map((entry, position) => (
              <li key={entry.slug} role="none">
                <Link
                  id={`${listboxId}-option-${position}`}
                  role="option"
                  aria-selected={position === activeIndex}
                  href={`/urun/${entry.slug}`}
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                  }}
                  onMouseEnter={() => setActiveIndex(position)}
                  className={clsx(
                    "flex items-start gap-3 px-4 py-2.5 transition-colors",
                    position === activeIndex ? "bg-brand-100" : "hover:bg-ink-50",
                  )}
                >
                  <span className="mt-0.5 shrink-0 rounded bg-ink-100 px-1.5 py-0.5 font-mono text-[0.68rem] font-medium tracking-tight text-ink-700 tabular">
                    {entry.oem}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink-900">{entry.name}</span>
                    <span className="block text-xs text-ink-500">{entry.brand}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={submit}
            className="block w-full border-t border-ink-200 bg-ink-50 px-4 py-2.5 text-left text-sm font-semibold text-ink-800 transition-colors hover:bg-ink-100"
          >
            &ldquo;{term.trim()}&rdquo; için tüm sonuçları gör
          </button>
        </div>
      ) : null}
    </div>
  );
}
