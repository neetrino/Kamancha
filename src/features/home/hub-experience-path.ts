import type { Locale } from "@/lib/i18n/config";

/**
 * Hub first-page and restaurants list — storefront chrome waits until delivery.
 */
export function isHubExperiencePath(pathname: string, locale: Locale): boolean {
  const base = `/${locale}`;
  if (pathname === base || pathname === `${base}/`) {
    return true;
  }
  return (
    pathname === `${base}/restaurants` ||
    pathname.startsWith(`${base}/restaurants/`)
  );
}
