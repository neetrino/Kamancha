import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { MobileBottomNavIsland } from "@/components/layout/MobileBottomNavIsland";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StorefrontScrollToTop } from "@/components/layout/StorefrontScrollToTop";
import { StorefrontBackground } from "@/components/layout/StorefrontBackground";
import { LiquidGlassOptics } from "@/components/ui/LiquidGlassOptics";
import { MaintenanceGate } from "@/components/layout/MaintenanceGate";
import { getActiveGroupOrderBanner } from "@/features/group-orders/application/active-banner";
import { ActiveGroupOrderBanner } from "@/features/group-orders/ui/ActiveGroupOrderBanner";
import { PromoPopupIsland } from "@/features/popups/ui/PromoPopupIsland";
import { StorefrontAlertHost } from "@/features/storefront-chrome/StorefrontAlertHost";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  CURRENCY_COOKIE_NAME,
  parseCurrencyCookie,
} from "@/lib/money/currency-cookie";

type StorefrontLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function StorefrontLayout({
  children,
  params,
}: StorefrontLayoutProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale: Locale = rawLocale;
  const dictionary = getDictionary(locale);
  const cookieStore = await cookies();
  const currency = parseCurrencyCookie(
    cookieStore.get(CURRENCY_COOKIE_NAME)?.value,
  );
  const groupBanner = await getActiveGroupOrderBanner();

  return (
    <div className="storefront-shell relative flex min-h-dvh flex-1 flex-col overflow-x-clip overflow-y-visible overscroll-x-none bg-brand-forest text-white">
      <StorefrontScrollToTop />
      <StorefrontBackground />
      <LiquidGlassOptics />
      <div className="relative z-10 flex min-h-dvh flex-1 flex-col">
        <SiteHeader
          locale={locale}
          currency={currency}
          dictionary={dictionary}
        />
        {groupBanner ? (
          <ActiveGroupOrderBanner
            locale={locale}
            labels={dictionary.groupOrder}
            organizerDisplayName={groupBanner.organizerDisplayName}
            inviteToken={groupBanner.inviteToken}
            isOrganizer={groupBanner.isOrganizer}
          />
        ) : null}
        <main className="storefront-main mx-auto w-full max-w-7xl flex-1 px-4 py-10 pb-3 sm:px-6 xl:px-8 xl:pb-10">
          <MaintenanceGate>{children}</MaintenanceGate>
        </main>
        <SiteFooter dictionary={dictionary} locale={locale} />
        <MobileBottomNavIsland
          locale={locale}
          currency={currency}
          dictionary={dictionary}
        />
        <StorefrontAlertHost />
        <PromoPopupIsland closeLabel={dictionary.nav.closeMenu} />
      </div>
    </div>
  );
}
