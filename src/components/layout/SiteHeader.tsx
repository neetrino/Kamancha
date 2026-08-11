import { Suspense } from "react";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { SiteHeaderMainNav } from "@/components/layout/SiteHeaderMainNav";
import { SITE_HEADER_INNER } from "@/components/layout/site-header-classes";
import { getCartItemCount } from "@/features/cart/cart";
import { getWishlistCount } from "@/features/wishlist/queries";
import { getCurrentUser } from "@/lib/auth/session";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import type { Currency } from "@/lib/money/currency";

type SiteHeaderProps = {
  locale: Locale;
  currency: Currency;
  dictionary: Dictionary;
};

function HeaderControlsFallback() {
  return (
    <div
      className="h-12 w-40 animate-pulse rounded-full bg-white/20"
      aria-hidden="true"
    />
  );
}

async function SiteHeaderMainNavAsync({
  locale,
  currency,
  dictionary,
}: SiteHeaderProps) {
  const navItems = [
    { href: `/${locale}`, label: dictionary.nav.home },
    { href: `/${locale}/products`, label: dictionary.nav.products },
    { href: `/${locale}/about`, label: dictionary.nav.about },
    { href: `/${locale}/contact`, label: dictionary.nav.contact },
  ] as const;

  const [user, cartItemCount, wishlistCount] = await Promise.all([
    getCurrentUser(),
    getCartItemCount(),
    getWishlistCount(),
  ]);

  return (
    <SiteHeaderMainNav
      locale={locale}
      currency={currency}
      dictionary={dictionary}
      user={user}
      navItems={navItems}
      cartItemCount={cartItemCount}
      wishlistCount={wishlistCount}
    />
  );
}

/**
 * Storefront chrome: Kamancha header streams shell immediately; account/cart
 * load in a Suspense island so page content is not blocked.
 */
export function SiteHeader({ locale, currency, dictionary }: SiteHeaderProps) {
  return (
    <div
      className="site-header sticky top-0 z-[80] shrink-0 bg-transparent pt-8 md:pt-10"
      data-site-header
    >
      <Suspense
        fallback={
          <header className="relative z-10 bg-transparent text-white">
            <div className={SITE_HEADER_INNER}>
              <div className="relative flex h-12 items-center justify-between md:min-h-[65px] md:h-auto">
                <BrandLogo locale={locale} brandName={dictionary.brand} />
                <HeaderControlsFallback />
              </div>
            </div>
          </header>
        }
      >
        <SiteHeaderMainNavAsync
          locale={locale}
          currency={currency}
          dictionary={dictionary}
        />
      </Suspense>
    </div>
  );
}
