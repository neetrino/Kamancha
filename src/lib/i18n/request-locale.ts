import { headers } from "next/headers";

import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";

/** First path segment when it is a supported locale (`/hy/...`). */
export function localeFromPathname(value: string): Locale | null {
  const path = value.startsWith("http")
    ? safeUrlPathname(value)
    : value;
  const segment = path.split("/").filter(Boolean)[0];
  return segment && isLocale(segment) ? segment : null;
}

function safeUrlPathname(value: string): string {
  try {
    return new URL(value).pathname;
  } catch {
    return value;
  }
}

/** Locale of the current App Router request (pathname header, then Referer). */
export async function getRequestLocale(): Promise<Locale> {
  const headerList = await headers();
  return (
    localeFromPathname(headerList.get("x-pathname") ?? "") ??
    localeFromPathname(headerList.get("referer") ?? "") ??
    defaultLocale
  );
}
