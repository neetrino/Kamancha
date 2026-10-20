import { notFound } from "next/navigation";

import { RestaurantsPageView } from "@/features/home/ui/RestaurantsPageView";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type RestaurantsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function RestaurantsPage({ params }: RestaurantsPageProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale: Locale = rawLocale;
  const dictionary = getDictionary(locale);

  return (
    <RestaurantsPageView locale={locale} labels={dictionary.home.hub} />
  );
}
