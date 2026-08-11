import { headers } from "next/headers";

import { HomePageChrome } from "@/features/home/ui/HomePageChrome";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

function localeFromPathname(pathname: string): Locale {
  const segment = pathname.split("/").filter(Boolean)[0];
  return isLocale(segment) ? segment : defaultLocale;
}

/**
 * Home loading shell — forest background + navbar come from layout;
 * hero animates from the sides + center immediately (no gray boxes).
 */
export default async function HomeLoading() {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const locale = localeFromPathname(pathname);
  const dictionary = getDictionary(locale);

  return <HomePageChrome locale={locale} dictionary={dictionary} />;
}
