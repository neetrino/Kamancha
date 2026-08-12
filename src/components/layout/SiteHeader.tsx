import { Suspense } from "react";

import { SiteHeaderMainNav } from "@/components/layout/SiteHeaderMainNav";
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

function buildNavItems(locale: Locale, dictionary: Dictionary) {
  return [
    { href: `/${locale}`, label: dictionary.nav.home },
    { href: `/${locale}/products`, label: dictionary.nav.products },
    { href: `/${locale}/about`, label: dictionary.nav.about },
    { href: `/${locale}/contact`, label: dictionary.nav.contact },
  ] as const;
}

function SiteHeaderShell({
  locale,
  currency,
  dictionary,
  user = null,
  cartItemCount = 0,
  wishlistCount = 0,
}: SiteHeaderProps & {
  user?: Awaited<ReturnType<typeof getCurrentUser>>;
  cartItemCount?: number;
  wishlistCount?: number;
}) {
  return (
    <SiteHeaderMainNav
      locale={locale}
      currency={currency}
      dictionary={dictionary}
      user={user}
      navItems={buildNavItems(locale, dictionary)}
      cartItemCount={cartItemCount}
      wishlistCount={wishlistCount}
    />
  );
}

async function SiteHeaderMainNavAsync({
  locale,
  currency,
  dictionary,
}: SiteHeaderProps) {
  const [user, cartItemCount, wishlistCount] = await Promise.all([
    getCurrentUser(),
    getCartItemCount(),
    getWishlistCount(),
  ]);

  return (
    <SiteHeaderShell
      locale={locale}
      currency={currency}
      dictionary={dictionary}
      user={user}
      cartItemCount={cartItemCount}
      wishlistCount={wishlistCount}
    />
  );
}

/**
 * Storefront chrome: sticky navbar over the forest background.
 * Cart/account counts hydrate in Suspense without a gray pulse pill.
 */
export function SiteHeader({ locale, currency, dictionary }: SiteHeaderProps) {
  return (
    <div
      className="site-header sticky top-0 z-[80] shrink-0 bg-transparent pt-8 pb-4 md:pt-10 md:pb-6"
      data-site-header
    >
      <Suspense
        fallback={
          <SiteHeaderShell
            locale={locale}
            currency={currency}
            dictionary={dictionary}
          />
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
