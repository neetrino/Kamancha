"use client";

import { useEffect, useState } from "react";

/** Tailwind `xl` — 1280px. */
export const XL_MIN_WIDTH_QUERY = "(min-width: 1280px)";

/**
 * `true` on `xl+`, `false` below, `null` until the viewport is known.
 * Treat `null` as desktop so SSR/first paint still uses the checkout page.
 */
export function useIsXlDesktop(): boolean | null {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const media = window.matchMedia(XL_MIN_WIDTH_QUERY);
    function sync(): void {
      setIsDesktop(media.matches);
    }
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return isDesktop;
}
