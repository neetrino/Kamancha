export const STOREFRONT_PREVIEW_COOKIE_NAME = "storefront_preview";

export const STOREFRONT_PREVIEW_COOKIE_VALUE = "granted";

export const STOREFRONT_PREVIEW_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function isStorefrontPreviewCookie(value: string | undefined): boolean {
  return value === STOREFRONT_PREVIEW_COOKIE_VALUE;
}
