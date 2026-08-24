import { notFound } from "next/navigation";

import { HomePageChrome } from "@/features/home/ui/HomePageChrome";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type HomeLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Home shell (hero + ornament / mobile promo) lives in layout so it does not
 * remount when the route `loading.tsx` boundary swaps to `page.tsx`.
 */
export default async function HomeLayout({ children, params }: HomeLayoutProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale: Locale = rawLocale;
  const dictionary = getDictionary(locale);

  return (
    <HomePageChrome locale={locale} dictionary={dictionary}>
      {children}
    </HomePageChrome>
  );
}
