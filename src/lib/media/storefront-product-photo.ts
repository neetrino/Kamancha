import { staticAssetUrl } from "@/lib/media/static-asset-url";

/**
 * Fallback photo when a product has no READY primary media in the database.
 */
export const STOREFRONT_PRODUCT_PHOTO = staticAssetUrl(
  "/assets/brand/products/placeholder-tolma.webp",
);

/** Returns product media URL only when one is actually stored. */
export function storefrontProductImageSrc(
  imageUrl: string | null | undefined,
): string | null {
  if (typeof imageUrl === "string" && imageUrl.length > 0) {
    return imageUrl;
  }
  return null;
}
