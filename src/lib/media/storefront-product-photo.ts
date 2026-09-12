import { staticAssetUrl } from "@/lib/media/static-asset-url";

/**
 * Fallback photo when a product has no READY primary media.
 * Same green Kamancha mark used for link / Open Graph previews.
 */
export const STOREFRONT_PRODUCT_PHOTO = staticAssetUrl(
  "/assets/brand/og-share.png",
);

/** Product photo URL, or the brand placeholder when none is stored. */
export function storefrontProductImageSrc(
  imageUrl: string | null | undefined,
): string {
  if (typeof imageUrl === "string" && imageUrl.length > 0) {
    return imageUrl;
  }
  return STOREFRONT_PRODUCT_PHOTO;
}
