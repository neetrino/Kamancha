"use client";

import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";

import { staticAssetBackground } from "@/lib/media/static-asset-url";

const TEXTURE_STYLE: CSSProperties = {
  backgroundImage: staticAssetBackground(
    "/assets/brand/storefront-texture.webp",
  ),
  backgroundRepeat: "no-repeat",
  backgroundPosition: "top center",
  backgroundSize: "cover",
};

/** Catalog list only — not PDP `/products/[slug]`. */
function isCatalogMenuPath(pathname: string): boolean {
  return /\/products\/?$/.test(pathname);
}

/**
 * Storefront paint texture (Figma `background 1`).
 *
 * Other pages: classic `absolute inset-0` cover (unchanged).
 * Menu (`/products`): `fixed` viewport cover so “see more” does not re-zoom.
 */
export function StorefrontBackground() {
  const pathname = usePathname() ?? "";
  const catalogMenu = isCatalogMenuPath(pathname);

  if (catalogMenu) {
    return (
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
        style={TEXTURE_STYLE}
        data-storefront-background="catalog"
      />
    );
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
      style={TEXTURE_STYLE}
    />
  );
}
