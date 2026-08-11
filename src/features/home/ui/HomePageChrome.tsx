import { HomeHero } from "@/features/home/ui/HomeHero";
import { HomeOrnamentStrip } from "@/features/home/ui/HomeOrnamentStrip";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type HomePageChromeProps = {
  locale: Locale;
  dictionary: Dictionary;
  children?: React.ReactNode;
};

/**
 * Instant home shell — hero + ornament (animations run here).
 * Below-fold catalog content is passed as children when ready.
 */
export function HomePageChrome({
  locale,
  dictionary,
  children,
}: HomePageChromeProps) {
  return (
    <div className="-mx-4 -my-10 sm:-mx-6 lg:-mx-8">
      <HomeHero
        brandName={dictionary.brand}
        ctaLabel={dictionary.nav.products}
        ctaHref={`/${locale}/products`}
      />
      <HomeOrnamentStrip />
      {children}
    </div>
  );
}
