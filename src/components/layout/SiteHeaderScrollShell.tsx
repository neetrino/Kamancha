"use client";

import { useEffect, useState, type ReactNode } from "react";

import {
  SITE_HEADER_SCROLLED_STROKE,
  SITE_HEADER_SCROLLED_SURFACE,
} from "@/components/layout/site-header-classes";

/** Scroll distance over which the chrome eases fully in. */
const SCROLL_FADE_RANGE_PX = 88;

type SiteHeaderScrollShellProps = {
  children: ReactNode;
};

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/**
 * Sticky storefront header shell. On scroll, reveals the frosted green bar
 * with rounded bottom corners and pale gradient edge stroke (Figma 173:143).
 */
export function SiteHeaderScrollShell({ children }: SiteHeaderScrollShellProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    function readScroll(): void {
      frame = 0;
      const next = easeOutCubic(
        Math.min(1, Math.max(0, window.scrollY / SCROLL_FADE_RANGE_PX)),
      );
      setProgress((prev) => (Math.abs(prev - next) < 0.003 ? prev : next));
    }

    function onScroll(): void {
      if (frame !== 0) return;
      frame = window.requestAnimationFrame(readScroll);
    }

    readScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  const scrolled = progress > 0.02;
  const chromeClassName =
    "pointer-events-none absolute inset-0 will-change-[opacity]";

  return (
    <div
      className="site-header relative sticky top-0 z-[80] shrink-0 bg-transparent pt-8 pb-2 md:pt-10 md:pb-2.5"
      data-site-header
      data-scrolled={scrolled ? "true" : "false"}
    >
      <div
        aria-hidden="true"
        data-node-id="173:143"
        className={`${chromeClassName} ${SITE_HEADER_SCROLLED_SURFACE}`}
        style={{ opacity: progress }}
      />
      <div
        aria-hidden="true"
        className={`${chromeClassName} ${SITE_HEADER_SCROLLED_STROKE}`}
        style={{ opacity: progress }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
