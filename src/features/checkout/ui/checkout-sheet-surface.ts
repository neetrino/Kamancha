import type { CSSProperties } from "react";

import { staticAssetBackground } from "@/lib/media/static-asset-url";

/** Matches `BottomSheet` checkout panel height. */
export const CHECKOUT_SHEET_PANEL_HEIGHT_CLASS = "h-[min(93dvh,100dvh)]";

/** Spacer so the last card can scroll fully above the overlay sticky. */
export const CHECKOUT_SHEET_STICKY_SPACER_CLASS =
  "h-[calc(6.5rem+env(safe-area-inset-bottom))] shrink-0";

export const CHECKOUT_SHEET_TEXTURE: CSSProperties = {
  backgroundImage: staticAssetBackground(
    "/assets/brand/storefront-texture.webp",
  ),
  backgroundRepeat: "no-repeat",
  backgroundPosition: "top center",
  backgroundSize: "cover",
};
