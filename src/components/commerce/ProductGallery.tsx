"use client";

import Image from "next/image";
import { useState } from "react";
import { clsx } from "@/lib/utils";

/**
 * Product image gallery: one large frame plus a thumbnail strip, matching the
 * client's product page.
 *
 * Thumbnails are real buttons in a `tablist`, so the gallery is keyboard
 * operable and announced correctly — a plain row of clickable images is the
 * usual way this pattern ends up inaccessible.
 */
export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const safe = images.length > 0 ? images : ["/parts/kompresor.svg"];
  const current = safe[Math.min(active, safe.length - 1)];

  return (
    <div>
      <div className="overflow-hidden rounded-card bg-ink-50 ring-1 ring-ink-200">
        <Image
          src={current}
          alt={alt}
          width={800}
          height={800}
          priority
          sizes="(min-width: 1024px) 45vw, 100vw"
          // The artwork carries its own margin inside an 800x800 canvas, so the
          // container adds only a little — p-10 on top of that left the part
          // floating in the middle of a very large empty frame.
          className="h-auto w-full object-contain p-4"
        />
      </div>

      {safe.length > 1 ? (
        <div role="tablist" aria-label="Ürün görselleri" className="mt-3 flex flex-wrap gap-2">
          {safe.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={`${index + 1}. görsel`}
              onClick={() => setActive(index)}
              className={clsx(
                "grid h-16 w-16 place-items-center overflow-hidden rounded-md bg-ink-50 ring-1 transition-all",
                index === active ? "ring-2 ring-ink-950" : "ring-ink-200 hover:ring-ink-400",
              )}
            >
              <Image src={image} alt="" width={120} height={120} className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      ) : null}

      <p className="mt-2 text-xs text-ink-400">
        Görsel temsilidir. Ürün, araç modeline göre farklılık gösterebilir.
      </p>
    </div>
  );
}
