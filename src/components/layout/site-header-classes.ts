/** Figma 173:143 scrolled header chrome — frosted green bar, rounded bottom. */
export const SITE_HEADER_SCROLLED_SURFACE =
  "rounded-b-[28px] bg-[linear-gradient(180deg,rgba(20,37,20,0.66)_0%,rgba(40,95,42,0.48)_100%)] backdrop-blur-[10px] lg:rounded-b-[40px]";

/** Figma 173:143 pale gradient rim along L/R/bottom edge. */
export const SITE_HEADER_SCROLLED_STROKE = "site-header-scrolled-stroke";

/** Figma 22:393 header content width (page inset ≈ 54px on 1440). */
export const SITE_HEADER_INNER =
  "mx-auto w-full max-w-[1332px] px-4 lg:px-[18px]";

/** Icon rail: cart + wishlist + account — nudged slightly below / left of optical center. */
export const SITE_HEADER_ICON_RAIL =
  "flex h-12 shrink-0 -translate-x-px translate-y-1 items-center gap-3";

/** Cart trigger hit area — centered in the 48px rail. */
export const SITE_HEADER_CART_TRIGGER =
  "relative inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-white transition-opacity duration-150 hover:opacity-80";

/** Count badge on cart / wishlist header icons. */
export const SITE_HEADER_CART_BADGE =
  "absolute -top-0.5 -right-0.5 flex size-5 min-w-5 items-center justify-center rounded-full border border-solid border-white bg-brand-forest p-px text-center text-[10px] font-bold leading-none text-white";

/** Desktop search pill — slightly longer than the «Որոնել» label. */
export const SITE_HEADER_SEARCH_PILL =
  "h-12 w-fit min-w-[120px] shrink-0 items-center justify-center gap-2 rounded-full bg-[rgba(255,255,255,0.31)] px-6 text-sm font-bold leading-6 whitespace-nowrap text-white transition-colors hover:bg-[rgba(255,255,255,0.4)]";

/** Group-order CTA — same 48× pill chrome as the locale switcher. */
export const SITE_HEADER_GROUP_ORDER =
  "inline-flex h-12 min-w-[159px] shrink-0 items-center justify-center whitespace-nowrap rounded-[70px] bg-white px-4 font-big-fat-boii text-base leading-none text-brand-forest transition-colors hover:bg-white/95";

/** Group-order CTA on the light mobile menu panel. */
export const SITE_HEADER_GROUP_ORDER_ON_LIGHT =
  "flex w-full items-center justify-center rounded-full bg-brand-forest px-6 py-3.5 font-big-fat-boii text-sm text-white transition-opacity hover:opacity-90";
