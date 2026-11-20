"use client";

import { useEffect } from "react";
import type { AnalyticsEvent } from "@/lib/analytics/types";

/**
 * Client half of the analytics capture (requirement 16).
 *
 * Mounted once in the root layout. It sends four things:
 *
 *  - a page view per navigation,
 *  - the search term whenever a /arama URL carries one — including the typos
 *    the client specifically asked to see ("kasnak" yerine "kanak"),
 *  - a product view on /urun/… pages,
 *  - a WhatsApp hand-off, with the product it came from when there is one.
 *
 * WhatsApp clicks are caught by one delegated listener rather than by wiring a
 * handler into every link. There are WhatsApp links in the header, on every
 * card, in the buy box, in the cart, in the footer and in the floating button;
 * a listener on the document catches all of them, including ones added later
 * by someone who has never read this file.
 */

function send(event: Partial<AnalyticsEvent> & { type: AnalyticsEvent["type"] }) {
  const body = JSON.stringify(event);

  // sendBeacon survives the navigation that a WhatsApp click triggers; a
  // normal fetch is cancelled when the page goes away, which is exactly the
  // event we most want to record.
  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    navigator.sendBeacon("/api/olay", new Blob([body], { type: "application/json" }));
    return;
  }

  void fetch("/api/olay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Measurement failing must never surface to the visitor.
  });
}

export function AnalyticsTracker() {
  useEffect(() => {
    let lastPath = "";

    function report() {
      const path = window.location.pathname + window.location.search;
      // Guards against double-firing in React's development StrictMode and
      // against a replaceState that did not actually change the page.
      if (path === lastPath) return;
      lastPath = path;

      send({ type: "page_view", path });

      const params = new URLSearchParams(window.location.search);
      const term = params.get("q");
      if (window.location.pathname.startsWith("/arama") && term?.trim()) {
        send({ type: "search", term, path });
      }

      if (window.location.pathname.startsWith("/urun/")) {
        const holder = document.querySelector<HTMLElement>("[data-product-id]");
        send({
          type: "product_view",
          path,
          productId: holder?.dataset.productId,
          productName: holder?.dataset.productName,
        });
      }
    }

    report();

    /*
     * The App Router navigates without a page load, and there is no public
     * "route changed" event outside a component that reads the pathname —
     * which would opt the whole layout out of static rendering. Patching the
     * history methods plus popstate covers every navigation the router makes,
     * and costs nothing on routes that never navigate.
     */
    const { pushState, replaceState } = window.history;

    function patch<T extends typeof pushState>(original: T): T {
      return function patched(this: History, ...args: Parameters<T>) {
        const result = original.apply(this, args);
        // After the router has committed the URL, not during.
        queueMicrotask(report);
        return result;
      } as T;
    }

    window.history.pushState = patch(pushState);
    window.history.replaceState = patch(replaceState);
    window.addEventListener("popstate", report);

    function onClick(clickEvent: MouseEvent) {
      const target = clickEvent.target;
      if (!(target instanceof Element)) return;

      const link = target.closest<HTMLAnchorElement>('a[href*="wa.me"], a[href^="whatsapp:"]');
      if (!link) return;

      // Nearest product context, if the link sits inside a card or a buy box.
      const holder = link.closest<HTMLElement>("[data-product-id]");
      send({
        type: "whatsapp",
        path: window.location.pathname + window.location.search,
        productId: holder?.dataset.productId,
        productName: holder?.dataset.productName,
      });
    }

    document.addEventListener("click", onClick, true);

    return () => {
      window.history.pushState = pushState;
      window.history.replaceState = replaceState;
      window.removeEventListener("popstate", report);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return null;
}
