/** Figma catalog sidebar category icons (103:1277). */
export const CATALOG_CATEGORY_ICON_ALL =
  "/assets/brand/catalog/cat-all.svg" as const;
export const CATALOG_CATEGORY_ICON_BREAKFAST =
  "/assets/brand/catalog/cat-breakfast.svg" as const;
export const CATALOG_CATEGORY_ICON_APPETIZER =
  "/assets/brand/catalog/cat-appetizer.svg" as const;
export const CATALOG_CATEGORY_ICON_SALAD =
  "/assets/brand/catalog/cat-salad.svg" as const;
export const CATALOG_CATEGORY_ICON_SOUP =
  "/assets/brand/catalog/cat-soup.svg" as const;
export const CATALOG_CATEGORY_ICON_HOT =
  "/assets/brand/catalog/cat-hot.svg" as const;
export const CATALOG_CATEGORY_ICON_FAMILY =
  "/assets/brand/catalog/cat-family.svg" as const;
export const CATALOG_CATEGORY_ICON_BBQ =
  "/assets/brand/catalog/cat-bbq.svg" as const;
export const CATALOG_CATEGORY_ICON_DRINK =
  "/assets/brand/catalog/cat-drink.svg" as const;
export const CATALOG_CATEGORY_ICON_DESSERT =
  "/assets/brand/catalog/cat-dessert.svg" as const;

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
    pattern: /dessert|sweet|աղանդեր|քաղցր|десерт|выпеч|cake/i,
    icon: CATALOG_CATEGORY_ICON_DESSERT,
  },
  {
    pattern:
      /drink|beverage|bar|բար|ըմպել|напит|cocktail|sauce|սոուս|соус|side|խավարտ|гарнир|fish|ձուկ|рыб|տապակ/i,
    icon: CATALOG_CATEGORY_ICON_DRINK,
  },
];

/**
 * Resolve a sidebar icon from category slug/title (Figma 103:1277 icon set).
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
