"use client";

import { useReducedMotion } from "motion/react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

import { scrollStorefrontToTop } from "@/lib/navigation/storefront-scroll";

function StorefrontScrollToTopInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const previousRouteKey = useRef<string | null>(null);

  const routeKey = `${pathname}?${searchParams.toString()}`;

  useEffect(() => {
    const isFirst = previousRouteKey.current === null;
    previousRouteKey.current = routeKey;
    if (isFirst) {
      return;
    }

    scrollStorefrontToTop(!reduceMotion);
  }, [routeKey, reduceMotion]);

  return null;
}

/**
 * Smooth scroll to top after storefront route / query changes (menu, pagination).
 */
export function StorefrontScrollToTop() {
  return (
    <Suspense fallback={null}>
      <StorefrontScrollToTopInner />
    </Suspense>
  );
}
