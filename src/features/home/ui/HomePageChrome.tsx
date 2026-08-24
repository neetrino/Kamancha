import { HomeHero } from "@/features/home/ui/HomeHero";
import { HomeMobilePromo } from "@/features/home/ui/HomeMobilePromo";
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
    <div className="home-mobile-page -mx-4 sm:-mx-6 lg:-mx-8 lg:-my-10">
      <div className="hidden lg:block">
        <HomeHero
          brandName={dictionary.brand}
          ctaLabel={dictionary.nav.products}
          ctaHref={`/${locale}/products`}
        />
        <HomeOrnamentStrip />
      </div>
      <div className="lg:hidden">
        <HomeMobilePromo
          headlineBefore={dictionary.home.familyDinner.headlineBefore}
          headlineAccent={dictionary.home.familyDinner.headlineAccent}
          headlineAfter={dictionary.home.familyDinner.headlineAfter}
        />
      </div>
      {children}
    </div>
  );
}
