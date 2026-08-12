"use client";

import { useEffect, useState, type ReactNode } from "react";

import {
  SITE_HEADER_SCROLLED_STROKE,
  SITE_HEADER_SCROLLED_SURFACE,
} from "@/components/layout/site-header-classes";

/** Start showing the scrolled chrome after a short scroll (Figma 173:143). */
const SCROLL_THRESHOLD_PX = 12;

type SiteHeaderScrollShellProps = {
  children: ReactNode;
};

/**
 * Sticky storefront header shell. On scroll, reveals the frosted green bar
 * with rounded bottom corners and pale gradient edge stroke (Figma 173:143).
 */
export function SiteHeaderScrollShell({ children }: SiteHeaderScrollShellProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;

    function readScroll(): void {
      frame = 0;
      setScrolled(window.scrollY > SCROLL_THRESHOLD_PX);
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

  const chromeVisibility = `pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out motion-reduce:transition-none ${
    scrolled ? "opacity-100" : "opacity-0"
  }`;

  return (
    <div
      className="site-header relative sticky top-0 z-[80] shrink-0 bg-transparent pt-8 pb-2 md:pt-10 md:pb-2.5"
      data-site-header
      data-scrolled={scrolled ? "true" : "false"}
    >
      <div
        aria-hidden="true"
        data-node-id="173:143"
        className={`${chromeVisibility} ${SITE_HEADER_SCROLLED_SURFACE}`}
      />
      <div
        aria-hidden="true"
        className={`${chromeVisibility} ${SITE_HEADER_SCROLLED_STROKE}`}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
