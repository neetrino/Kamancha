/** Figma 173:143 scrolled header chrome — frosted green bar, rounded bottom. */
export const SITE_HEADER_SCROLLED_SURFACE =
  "rounded-b-[28px] bg-[linear-gradient(180deg,rgba(20,37,20,0.66)_0%,rgba(40,95,42,0.48)_100%)] backdrop-blur-[10px] md:rounded-b-[40px]";

/** Figma 173:143 pale gradient rim along L/R/bottom edge. */
export const SITE_HEADER_SCROLLED_STROKE = "site-header-scrolled-stroke";

/** Figma 22:393 header content width (page inset ≈ 54px on 1440). */
export const SITE_HEADER_INNER =
  "mx-auto w-full max-w-[1332px] px-4 md:px-[18px]";

/** Icon rail: cart + wishlist + account — nudged slightly below / left of optical center. */
export const SITE_HEADER_ICON_RAIL =
  "flex h-12 shrink-0 -translate-x-px translate-y-1 items-center gap-3";

/** Cart trigger hit area — centered in the 48px rail. */
export const SITE_HEADER_CART_TRIGGER =
  "relative inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-white transition-opacity duration-150 hover:opacity-80";

/** Cart badge — scaled with larger cart glyph. */
export const SITE_HEADER_CART_BADGE =
  "absolute -top-1 right-0 flex size-6 min-w-6 items-center justify-center rounded-full border border-solid border-white bg-brand-forest p-px text-center text-[12px] font-bold leading-4 text-white";

/** Desktop search pill (Figma 22:394 — lengthened toward available header space). */
export const SITE_HEADER_SEARCH_PILL =
  "h-12 w-[300px] shrink-0 items-center gap-2 rounded-full bg-[rgba(255,255,255,0.31)] px-4 text-sm font-bold leading-6 text-white transition-colors hover:bg-[rgba(255,255,255,0.4)]";
