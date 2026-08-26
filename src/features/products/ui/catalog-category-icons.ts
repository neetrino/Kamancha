import { staticAssetUrl } from "@/lib/media/static-asset-url";

/** Figma catalog sidebar category icons (103:1283). Same-origin — used as CSS masks. */
export const CATALOG_CATEGORY_ICON_ALL = staticAssetUrl(
  "/assets/brand/catalog/cat-all.svg",
  { sameOrigin: true },
);
export const CATALOG_CATEGORY_ICON_BREAKFAST = staticAssetUrl(
  "/assets/brand/catalog/cat-breakfast.svg",
  { sameOrigin: true },
);
export const CATALOG_CATEGORY_ICON_APPETIZER = staticAssetUrl(
  "/assets/brand/catalog/cat-appetizer.svg",
  { sameOrigin: true },
);
export const CATALOG_CATEGORY_ICON_SALAD = staticAssetUrl(
  "/assets/brand/catalog/cat-salad.svg",
  { sameOrigin: true },
);
export const CATALOG_CATEGORY_ICON_SOUP = staticAssetUrl(
  "/assets/brand/catalog/cat-soup.svg",
  { sameOrigin: true },
);
export const CATALOG_CATEGORY_ICON_HOT = staticAssetUrl(
  "/assets/brand/catalog/cat-hot.svg",
  { sameOrigin: true },
);
export const CATALOG_CATEGORY_ICON_FAMILY = staticAssetUrl(
  "/assets/brand/catalog/cat-family.svg",
  { sameOrigin: true },
);
export const CATALOG_CATEGORY_ICON_BBQ = staticAssetUrl(
  "/assets/brand/catalog/cat-bbq.svg",
  { sameOrigin: true },
);
export const CATALOG_CATEGORY_ICON_FISH = staticAssetUrl(
  "/assets/brand/catalog/cat-fish.svg",
  { sameOrigin: true },
);
export const CATALOG_CATEGORY_ICON_SIDE = staticAssetUrl(
  "/assets/brand/catalog/cat-side.svg",
  { sameOrigin: true },
);
export const CATALOG_CATEGORY_ICON_TAPAKA = staticAssetUrl(
  "/assets/brand/catalog/cat-tapaka.svg",
  { sameOrigin: true },
);
export const CATALOG_CATEGORY_ICON_SAUCE = staticAssetUrl(
  "/assets/brand/catalog/cat-sauce.svg",
  { sameOrigin: true },
);
export const CATALOG_CATEGORY_ICON_DESSERT = staticAssetUrl(
  "/assets/brand/catalog/cat-dessert.svg",
  { sameOrigin: true },
);
export const CATALOG_CATEGORY_ICON_BAR = staticAssetUrl(
  "/assets/brand/catalog/cat-bar.svg",
  { sameOrigin: true },
);

const ICON_RULES: ReadonlyArray<{ pattern: RegExp; icon: string }> = [
  {
    pattern: /breakfast|նախաճաշ|завтрак/i,
    icon: CATALOG_CATEGORY_ICON_BREAKFAST,
  },
  {
    pattern: /appetizer|starter|նախուտեստ|закуск/i,
    icon: CATALOG_CATEGORY_ICON_APPETIZER,
  },
  { pattern: /salad|աղցան|салат/i, icon: CATALOG_CATEGORY_ICON_SALAD },
  { pattern: /soup|ապուր|суп/i, icon: CATALOG_CATEGORY_ICON_SOUP },
  {
    pattern: /tapaka|տապակ|армавир|armavir/i,
    icon: CATALOG_CATEGORY_ICON_TAPAKA,
  },
  {
    pattern: /hot|տաք|горяч|main.?dish|entree/i,
    icon: CATALOG_CATEGORY_ICON_HOT,
  },
  {
    pattern: /family|ընտանեկան|семейн|combo|կոմբո/i,
    icon: CATALOG_CATEGORY_ICON_FAMILY,
  },
  {
    pattern: /bbq|grill|խորոված|գրիլ|шашл|барбек/i,
    icon: CATALOG_CATEGORY_ICON_BBQ,
  },
  {
    pattern: /fish|ձուկ|рыб/i,
    icon: CATALOG_CATEGORY_ICON_FISH,
  },
  {
    pattern: /side|խավարտ|гарнир/i,
    icon: CATALOG_CATEGORY_ICON_SIDE,
  },
  {
    pattern: /sauce|սոուս|соус/i,
    icon: CATALOG_CATEGORY_ICON_SAUCE,
  },
  {
    pattern: /dessert|sweet|աղանդեր|քաղցր|десерт|выпеч|cake/i,
    icon: CATALOG_CATEGORY_ICON_DESSERT,
  },
  {
    pattern: /bar.?menu|բար.?մենյու|bar|բար|drink|beverage|ըմպել|напит|cocktail/i,
    icon: CATALOG_CATEGORY_ICON_BAR,
  },
];

/**
 * Resolve a sidebar icon from category slug/title (Figma 103:1283 icon set).
 */
export function resolveCatalogCategoryIcon(
  slug: string,
  title: string,
): string {
  const haystack = `${slug} ${title}`;
  for (const rule of ICON_RULES) {
    if (rule.pattern.test(haystack)) {
      return rule.icon;
    }
  }
  return CATALOG_CATEGORY_ICON_ALL;
}
