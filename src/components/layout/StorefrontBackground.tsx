/**
 * Storefront paint texture (Figma `background 1`).
 *
 * Plain CSS background — no Next image optimizer, no blend mode, so the
 * texture matches the source photo brightness.
 */
import { staticAssetBackground } from "@/lib/media/static-asset-url";

export function StorefrontBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
      style={{
        backgroundImage: staticAssetBackground("/assets/brand/storefront-texture.webp"),
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top center",
        backgroundSize: "cover",
      }}
    />
  );
}
