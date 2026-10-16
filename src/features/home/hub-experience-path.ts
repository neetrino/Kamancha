import type { Locale } from "@/lib/i18n/config";

/**
 * Hub first-page and restaurants list — storefront chrome waits until delivery.
 */
export function isHubHomePath(pathname: string, locale: Locale): boolean {
  const base = `/${locale}`;
  return pathname === base || pathname === `${base}/`;
}

export function isDeliveryHomePath(pathname: string, locale: Locale): boolean {
  const base = `/${locale}/delivery`;
  return pathname === base || pathname === `${base}/`;
}

export function isNavbarDropPath(
  pathname: string,
  locale: Locale,
  previousPathname: string,
): boolean {
  if (isHubHomePath(pathname, locale)) {
    return true;
  }
  if (!isDeliveryHomePath(pathname, locale)) {
    return false;
  }
  return isHubHomePath(previousPathname, locale);
}

export function isHubExperiencePath(pathname: string, locale: Locale): boolean {
  const base = `/${locale}`;
  if (isHubHomePath(pathname, locale)) {
    return true;
  }
  return (
    pathname === `${base}/restaurants` ||
    pathname.startsWith(`${base}/restaurants/`)
  );
}
