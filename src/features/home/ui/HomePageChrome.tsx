import { HomeHero } from "@/features/home/ui/HomeHero";
import { HomeIntroSignal } from "@/features/home/ui/HomeIntroSignal";
import { HomeOrnamentStrip } from "@/features/home/ui/HomeOrnamentStrip";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type HomePageChromeProps = {
  locale: Locale;
  dictionary: Dictionary;
  children?: React.ReactNode;
};

/**
 * Instant home shell — desktop hero + ornament; mobile promo.
 * Below-fold catalog content is passed as children when ready.
 */
export function HomePageChrome({
  locale,
  dictionary,
  children,
}: HomePageChromeProps) {
  return (
    <div className="home-mobile-page -mx-4 sm:-mx-6 xl:-mx-8 xl:-my-10">
      <HomeIntroSignal locale={locale} />
      <div className="hidden xl:block">
        <HomeHero
          brandName={dictionary.brand}
          ctaLabel={dictionary.nav.products}
          ctaHref={`/${locale}/products`}
        />
        <HomeOrnamentStrip />
      </div>
      {children}
    </div>
  );
}
