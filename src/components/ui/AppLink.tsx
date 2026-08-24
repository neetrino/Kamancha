"use client";

import Link from "next/link";
import { forwardRef, type ComponentProps } from "react";

/**
 * Selective prefetch for storefront navigation (TECH_CARD + docs/06).
 *
 * - `intent` — header/footer/CTAs: full route + data as soon as eligible
 * - `auto` — Next default; with `loading.tsx`, dynamic routes get a partial shell prefetch in viewport
 * - `none` — disable viewport/hover prefetch (rare; prefer `auto` for catalogs)
 *
 * `scroll` defaults to `false` — `StorefrontScrollToTop` handles one smooth scroll
 * after navigation (avoids fighting Next.js / duplicate scroll animations).
 *
 * Prefetch runs in production only; `next dev` will not show the same latency win.
 */
export type AppLinkPrefetchPolicy = "intent" | "auto" | "none";

type AppLinkProps = Omit<ComponentProps<typeof Link>, "prefetch"> & {
  prefetchPolicy?: AppLinkPrefetchPolicy;
};

export const AppLink = forwardRef<HTMLAnchorElement, AppLinkProps>(
  function AppLink({ prefetchPolicy = "auto", scroll = false, ...props }, ref) {
    if (prefetchPolicy === "intent") {
      return <Link ref={ref} scroll={scroll} {...props} prefetch />;
    }

    if (prefetchPolicy === "none") {
      return <Link ref={ref} scroll={scroll} {...props} prefetch={false} />;
    }

    return <Link ref={ref} scroll={scroll} {...props} prefetch="auto" />;
  },
);
