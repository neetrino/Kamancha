import { notFound } from "next/navigation";

import { ClearFocusOnEscape } from "@/components/layout/ClearFocusOnEscape";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams(): Array<{ locale: Locale }> {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale: Locale = rawLocale;

  return (
    <div lang={locale} className="flex min-h-dvh flex-1 flex-col bg-brand-forest">
      <ClearFocusOnEscape />
      {children}
    </div>
  );
}
