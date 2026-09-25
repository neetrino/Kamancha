"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { loadStorefrontPlainLines } from "@/features/cart/storefront-cart-mutations";
import { hydrateCartProductLines } from "@/features/cart/ui/cart-product-lines-store";
import { logger } from "@/lib/observability/logger";

function pullPlainLines(): void {
  void loadStorefrontPlainLines()
    .then((lines) => {
      hydrateCartProductLines(lines);
    })
    .catch((error: unknown) => {
      logger.warn("Failed to load plain cart lines", {
        error: error instanceof Error ? error.message : "unknown",
      });
    });
}

/** Keeps product-card quantities aligned with the bag across navigations. */
export function CartProductLinesHydrator(): null {
  const pathname = usePathname();

  useEffect(() => {
    pullPlainLines();
  }, [pathname]);

  useEffect(() => {
    function onFocus(): void {
      pullPlainLines();
    }
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return null;
}
