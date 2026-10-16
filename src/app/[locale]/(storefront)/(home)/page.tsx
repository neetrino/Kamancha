import { notFound } from "next/navigation";

import { HubFirstPage } from "@/features/home/ui/HubFirstPage";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Brand first page — hands intro, then hub banners.
 */
export default async function HomePage({ params }: HomePageProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale: Locale = rawLocale;
  const dictionary = getDictionary(locale);

  return (
    <HubFirstPage locale={locale} labels={dictionary.home.hub} />
  );
}
