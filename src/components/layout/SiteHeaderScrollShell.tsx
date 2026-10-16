"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";

import {
  SITE_HEADER_SCROLLED_STROKE,
  SITE_HEADER_SCROLLED_SURFACE,
} from "@/components/layout/site-header-classes";
import {
  isDeliveryHomePath,
  isNavbarDropPath,
} from "@/features/home/hub-experience-path";
import {
  commitStorefrontPathname,
  isPendingDeliveryNavbarDrop,
  peekStorefrontPathname,
} from "@/features/home/storefront-path-memory";
import {
  HUB_INTRO_STATE_ATTR,
  readHubIntroState,
} from "@/features/home/hub-intro-document";
import { HUB_INTRO_SPRING } from "@/features/home/hub-intro-timing";
import type { Locale } from "@/lib/i18n/config";

/** Scroll distance over which the chrome eases fully in. */
const SCROLL_FADE_RANGE_PX = 88;

type SiteHeaderScrollShellProps = {
  locale: Locale;
  children: ReactNode;
};

type HubRevealState = {
  path: string;
  shown: boolean;
  springIn: boolean;
};

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function useHubHeaderReveal(locale: Locale): {
  shown: boolean;
  springIn: boolean;
} {
  const pathname = usePathname() ?? "";
  const reduceMotion = useReducedMotion() === true;
  const shouldDrop =
    !reduceMotion &&
    (isNavbarDropPath(pathname, locale, peekStorefrontPathname()) ||
      (isDeliveryHomePath(pathname, locale) &&
        isPendingDeliveryNavbarDrop()));
  const [reveal, setReveal] = useState<HubRevealState>({
    path: pathname,
    shown: !shouldDrop,
    springIn: shouldDrop,
  });

  if (pathname !== reveal.path) {
    setReveal({
      path: pathname,
      shown: !shouldDrop,
      springIn: shouldDrop,
    });
  }

  useLayoutEffect(() => {
    commitStorefrontPathname(pathname);
  }, [pathname]);

  useLayoutEffect(() => {
    if (!reveal.springIn) {
      setReveal((prev) => ({ ...prev, shown: true }));
      return;
    }

    function sync(): void {
      setReveal((prev) => ({
        ...prev,
        shown: readHubIntroState() === "done",
      }));
    }

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [HUB_INTRO_STATE_ATTR],
    });
    return () => observer.disconnect();
  }, [reveal.springIn]);

  return { shown: reveal.shown, springIn: reveal.springIn };
}

/**
 * Sticky storefront header shell. On scroll, reveals the frosted green bar
 * with rounded bottom corners and pale gradient edge stroke (Figma 173:143).
 * On hub home the bar stays off-screen until the hands leave, then drops
 * in from the top with the cards. The sticky shell is not transformed.
 */
export function SiteHeaderScrollShell({
  locale,
  children,
}: SiteHeaderScrollShellProps) {
  const [progress, setProgress] = useState(0);
  const { shown, springIn } = useHubHeaderReveal(locale);
  const [dropDone, setDropDone] = useState(!springIn);

  if (!shown && dropDone) {
    setDropDone(false);
  }

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
  const clipNav = springIn && !dropDone;
  const chromeClassName =
    "pointer-events-none absolute inset-0 will-change-[opacity]";

  return (
    <div
      className={`site-header relative sticky top-0 z-[80] shrink-0 bg-transparent pt-6 pb-2 xl:pt-6 xl:pb-2.5 ${shown ? "" : "pointer-events-none"} ${clipNav ? "overflow-hidden" : ""}`}
      data-site-header
      data-scrolled={scrolled ? "true" : "false"}
      data-hub-header={shown ? "shown" : "hidden"}
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
      <motion.div
        className="relative z-10"
        initial={false}
        animate={{ y: shown ? "0%" : "-120%" }}
        transition={
          springIn && shown ? HUB_INTRO_SPRING : { duration: 0 }
        }
        onAnimationComplete={() => {
          if (shown) {
            setDropDone(true);
          }
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
