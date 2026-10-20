import { Suspense } from "react";
import { notFound } from "next/navigation";

import { HomePageChrome } from "@/features/home/ui/HomePageChrome";
import { HomeStorefront } from "@/features/home/ui/HomeStorefront";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type DeliveryPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Former home storefront — opened from the hub Delivery banner.
 */
export default async function DeliveryPage({ params }: DeliveryPageProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale: Locale = rawLocale;
  const dictionary = getDictionary(locale);

  return (
    <HomePageChrome locale={locale} dictionary={dictionary}>
      <Suspense fallback={null}>
        <HomeStorefront locale={locale} dictionary={dictionary} />
      </Suspense>
    </HomePageChrome>
  );
}
