/** Figma catalog sidebar category icons (103:1277). */
export const CATALOG_CATEGORY_ICON_ALL =
  "/assets/brand/catalog/cat-all.svg" as const;
export const CATALOG_CATEGORY_ICON_GRILL =
  "/assets/brand/catalog/cat-grill.svg" as const;
export const CATALOG_CATEGORY_ICON_BURGER =
  "/assets/brand/catalog/cat-burger.svg" as const;
export const CATALOG_CATEGORY_ICON_SALAD =
  "/assets/brand/catalog/cat-salad.svg" as const;

const ICON_RULES: ReadonlyArray<{ pattern: RegExp; icon: string }> = [
  { pattern: /grill|գրիլ|барбек|bbq/i, icon: CATALOG_CATEGORY_ICON_GRILL },
  { pattern: /burger|բուրգ|бургер/i, icon: CATALOG_CATEGORY_ICON_BURGER },
  { pattern: /salad|աղցան|салат/i, icon: CATALOG_CATEGORY_ICON_SALAD },
  { pattern: /soup|ապուր|суп/i, icon: CATALOG_CATEGORY_ICON_BURGER },
  {
    pattern: /sweet|dessert|քաղցր|десерт|выпеч/i,
    icon: CATALOG_CATEGORY_ICON_GRILL,
  },
  {
    pattern: /drink|beverage|ըմպել|напит/i,
    icon: CATALOG_CATEGORY_ICON_BURGER,
  },
];

/**
 * Resolve a sidebar icon from category slug/title (Figma reuses a small icon set).
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
