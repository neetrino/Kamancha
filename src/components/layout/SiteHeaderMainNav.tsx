import { AccountControls } from "@/components/layout/AccountControls";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { GroupOrderHeaderButton } from "@/components/layout/GroupOrderHeaderButton";
import { CurrencySwitcher } from "@/components/layout/CurrencySwitcher";
import { LocaleCurrencySwitcher } from "@/components/layout/LocaleCurrencySwitcher";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { MobileNavDrawer } from "@/components/layout/MobileNavDrawer";
import {
  SITE_HEADER_ICON_RAIL,
  SITE_HEADER_INNER,
} from "@/components/layout/site-header-classes";
import { SiteHeaderNavLinks } from "@/components/layout/SiteHeaderNavLinks";
import { CartDrawer } from "@/features/cart/ui/CartDrawer";
import { HeaderSearch } from "@/features/products/ui/HeaderSearch";
import { WishlistHeaderLink } from "@/features/wishlist/ui/WishlistHeaderLink";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import type { Currency } from "@/lib/money/currency";
import type { SessionUser } from "@/lib/auth/session";

type NavItem = {
  href: string;
  label: string;
};

type SiteHeaderMainNavProps = {
  locale: Locale;
  currency: Currency;
  dictionary: Dictionary;
  user: SessionUser | null;
  navItems: readonly NavItem[];
  cartItemCount: number;
  wishlistCount: number;
};

function headerSearchLabels(
  header: Dictionary["header"],
): {
  open: string;
  close: string;
  placeholder: string;
  idle: string;
  empty: string;
  viewAll: string;
} {
  return {
    open: header.search,
    close: header.searchClose,
    placeholder: header.searchPlaceholder,
    idle: header.searchIdle,
    empty: header.searchEmpty,
    viewAll: header.searchViewAll,
  };
}

/**
 * Kamancha storefront header (Figma 22:393):
 * logo, nav, search | centered icon rail | language switcher.
 */
export function SiteHeaderMainNav({
  locale,
  currency,
  dictionary,
  user,
  navItems,
  cartItemCount,
  wishlistCount,
}: SiteHeaderMainNavProps) {
  const searchLabels = headerSearchLabels(dictionary.header);

  function IconRail() {
    return (
      <div className={SITE_HEADER_ICON_RAIL}>
        <CartDrawer
          locale={locale}
          currency={currency}
          dictionary={dictionary}
          itemCount={cartItemCount}
          tone="onDark"
        />
        <WishlistHeaderLink
          locale={locale}
          label={dictionary.nav.wishlist}
          count={wishlistCount}
          tone="onDark"
        />
        <AccountControls
          locale={locale}
          loginLabel={dictionary.header.login}
          logoutLabel={dictionary.header.logout}
          profileLabel={dictionary.header.profile}
          adminLabel={dictionary.header.admin}
          user={user}
          tone="onDark"
        />
      </div>
    );
  }

  return (
    <header className="relative z-40 bg-transparent text-white" data-node-id="22:393">
      <div className={SITE_HEADER_INNER}>
        <div className="relative flex min-h-12 items-center md:min-h-[65px]">
          <BrandLogo locale={locale} brandName={dictionary.brand} />

          {/* Nav centered in the free space between logo and search */}
          <div className="hidden min-w-0 flex-1 items-center justify-center px-4 md:flex">
            <SiteHeaderNavLinks locale={locale} items={navItems} />
          </div>

          <div className="ml-auto flex min-w-0 items-center self-center md:ml-0">
            {/* Desktop: search | icons | language | group order */}
            <div className="hidden h-12 items-center gap-4 md:flex">
              <HeaderSearch
                locale={locale}
                currency={currency}
                labels={searchLabels}
                variant="responsive"
                tone="onDark"
              />

              <IconRail />

              <LocaleCurrencySwitcher
                locale={locale}
                currency={currency}
                currencyLabel={dictionary.header.currency}
                languageLabel={dictionary.header.language}
                tone="onDark"
              />

              <GroupOrderHeaderButton
                locale={locale}
                label={dictionary.nav.groupOrder}
                labels={dictionary.groupOrder}
                defaultName={
                  user
                    ? [user.firstName, user.lastName].filter(Boolean).join(" ")
                    : ""
                }
              />
            </div>

            {/* Below md: home-style menu + account pill */}
            <div className="flex items-center self-center md:hidden">
              <div
                className="flex h-14 w-[113px] items-center justify-between rounded-[28px] bg-white pr-[2.5px] pl-3"
                data-node-id="181:504"
              >
                <MobileNavDrawer
                  locale={locale}
                  dictionary={dictionary}
                  navItems={navItems}
                  forestTrigger
                  groupOrderDefaultName={
                    user
                      ? [user.firstName, user.lastName].filter(Boolean).join(" ")
                      : ""
                  }
                  triggerClassName="relative flex size-[34px] shrink-0 items-center justify-center overflow-hidden text-brand-forest transition-opacity hover:opacity-80 touch-manipulation"
                  panelFooter={
                    <div className="grid grid-cols-2 gap-3">
                      <div className="min-w-0 space-y-2">
                        <span className="text-xs font-medium tracking-wide text-gray-500">
                          {dictionary.header.language}
                        </span>
                        <LocaleSwitcher
                          locale={locale}
                          label={dictionary.header.language}
                          variant="segmented"
                        />
                      </div>
                      <div className="min-w-0 space-y-2">
                        <span className="text-xs font-medium tracking-wide text-gray-500">
                          {dictionary.header.currency}
                        </span>
                        <CurrencySwitcher
                          currency={currency}
                          label={dictionary.header.currency}
                          variant="segmented"
                        />
                      </div>
                    </div>
                  }
                />
                <AccountControls
                  locale={locale}
                  loginLabel={dictionary.header.login}
                  logoutLabel={dictionary.header.logout}
                  profileLabel={dictionary.header.profile}
                  adminLabel={dictionary.header.admin}
                  user={user}
                  tone="pill"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
