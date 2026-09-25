import type { AttributeTranslations } from "@/db/schema";
import type { Locale } from "@/lib/i18n/config";

/** Storefront/admin label with Armenian, then English, then Russian fallback. */
export function attributeTitle(
  translations: AttributeTranslations,
  locale: Locale,
): string {
  return (
    translations[locale]?.title ??
    translations.hy?.title ??
    translations.en?.title ??
    translations.ru?.title ??
    ""
  );
}

/** Fills empty locales from Armenian so every storefront language has a label. */
export function withFallbackTitles(titles: {
  hy: string;
  en: string;
  ru: string;
}): AttributeTranslations {
  const hy = titles.hy.trim();
  return {
    hy: { title: hy },
    en: { title: titles.en.trim() || hy },
    ru: { title: titles.ru.trim() || hy },
  };
}
