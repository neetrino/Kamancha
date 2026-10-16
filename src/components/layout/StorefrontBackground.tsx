"use client";

import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";

import {
  staticAssetBackground,
  staticAssetUrl,
} from "@/lib/media/static-asset-url";

const TEXTURE_STYLE: CSSProperties = {
  backgroundImage: staticAssetBackground(
    "/assets/brand/storefront-texture.webp",
  ),
  backgroundRepeat: "no-repeat",
  backgroundPosition: "top center",
  backgroundSize: "cover",
};

/** Desktop paint (Figma 505:174) — local until the file is on the asset CDN. */
const DESKTOP_TEXTURE_STYLE: CSSProperties = {
  backgroundImage: `url(${staticAssetUrl("/assets/brand/storefront-texture-desktop.webp", { sameOrigin: true })})`,
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
      <>
        <div
          className="pointer-events-none fixed inset-0 z-0 xl:hidden"
          aria-hidden="true"
          style={TEXTURE_STYLE}
          data-storefront-background="catalog"
        />
        <div
          className="pointer-events-none fixed inset-0 z-0 hidden mix-blend-overlay xl:block"
          aria-hidden="true"
          style={DESKTOP_TEXTURE_STYLE}
          data-node-id="505:174"
          data-storefront-background="catalog-desktop"
        />
      </>
    );
  }

  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden xl:hidden"
        aria-hidden="true"
        style={TEXTURE_STYLE}
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden mix-blend-overlay xl:block"
        aria-hidden="true"
        style={DESKTOP_TEXTURE_STYLE}
        data-node-id="505:174"
      />
    </>
  );
}
