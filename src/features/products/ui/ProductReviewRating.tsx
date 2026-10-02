/** Storefront display value when a product has no approved reviews. */
export const PRODUCT_RATING_DISPLAY_FALLBACK = 5;

/** Resolves the rating shown on product cards; missing or zero → 5. */
export function displayProductRating(
  rating: number | null | undefined,
): number {
  return rating != null && rating > 0
    ? rating
    : PRODUCT_RATING_DISPLAY_FALLBACK;
}
