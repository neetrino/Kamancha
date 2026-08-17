"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { AppLink } from "@/components/ui/AppLink";
import {
  NavActiveDiamonds,
  NavCartIcon,
  NavClocheIcon,
  NavHeartIcon,
  NavHomeIcon,
} from "@/components/layout/storefront-nav-icons";
import { CartDrawer } from "@/features/cart/ui/CartDrawer";
import { useWishlistCount } from "@/features/storefront-chrome/storefront-counts-store";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import type { Currency } from "@/lib/money/currency";

type MobileBottomNavProps = {
  locale: Locale;
  currency: Currency;
  dictionary: Dictionary;
  cartItemCount: number;
  wishlistCount: number;
};

type NavTab = {
  id: string;
  href: string;
  label: string;
  icon: ReactNode;
  match: (pathname: string) => boolean;
  badge?: number;
  className?: string;
};

function isHomePath(pathname: string, locale: Locale): boolean {
  return pathname === `/${locale}` || pathname === `/${locale}/`;
}

function startsWithPath(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

function tabClassName(active: boolean): string {
  return [
    "relative flex min-w-0 flex-1 flex-col items-center justify-center px-1 text-brand-forest transition-opacity",
    active ? "opacity-100" : "opacity-70 hover:opacity-100",
  ].join(" ");
}

function NavBadge({ count }: { count: number }) {
  if (count <= 0) {
    return null;
  }

  return (
    <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-forest px-1 text-[9px] font-semibold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function LinkTab({
  tab,
  active,
}: {
  tab: NavTab;
  active: boolean;
}) {
  return (
    <AppLink
      href={tab.href}
      prefetchPolicy="intent"
      aria-current={active ? "page" : undefined}
      className={`${tabClassName(active)} ${tab.className ?? ""}`}
    >
      <span className="relative inline-flex">
        {tab.icon}
        {tab.badge != null ? <NavBadge count={tab.badge} /> : null}
      </span>
      {active && tab.id === "home" ? (
        <NavActiveDiamonds className="absolute bottom-1.5 h-[10px] w-[27px]" />
      ) : null}
      <span className="sr-only">{tab.label}</span>
    </AppLink>
  );
}

export function MobileBottomNav({
  locale,
  currency,
  dictionary,
  cartItemCount,
  wishlistCount,
}: MobileBottomNavProps) {
  const pathname = usePathname() ?? `/${locale}`;
  const liveWishlistCount = useWishlistCount(wishlistCount);

  const homeTab: NavTab = {
    id: "home",
    href: `/${locale}`,
    label: dictionary.nav.home,
    icon: <NavHomeIcon className="h-6 w-6" />,
    match: (path) => isHomePath(path, locale),
  };

  const shopTab: NavTab = {
    id: "shop",
    href: `/${locale}/products`,
    label: dictionary.nav.shop,
    icon: <NavClocheIcon className="h-6 w-[29px]" />,
    match: (path) => startsWithPath(path, `/${locale}/products`),
  };

  const wishlistTab: NavTab = {
    id: "wishlist",
    href: `/${locale}/wishlist`,
    label: dictionary.nav.wishlist,
    icon: <NavHeartIcon className="h-6 w-7" />,
    match: (path) => startsWithPath(path, `/${locale}/wishlist`),
    badge: liveWishlistCount,
  };

  return (
    <nav
      aria-label={dictionary.nav.navigation}
      className="mobile-bottom-nav pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
    >
      <div
        className="pointer-events-auto flex h-[63px] w-[267px] max-w-[calc(100%-3rem)] items-stretch rounded-[40px] bg-white shadow-[0px_0px_9px_0px_rgba(0,0,0,0.25)]"
        data-node-id="181:727"
      >
        <LinkTab tab={homeTab} active={homeTab.match(pathname)} />
        <LinkTab tab={shopTab} active={shopTab.match(pathname)} />

        <CartDrawer
          locale={locale}
          currency={currency}
          dictionary={dictionary}
          itemCount={cartItemCount}
          renderTrigger={({
            open,
            badgeCount,
            label,
            openDrawer,
            prefetchDrawerView,
          }) => (
            <button
              type="button"
              data-cart-fly-target
              onClick={openDrawer}
              onPointerEnter={prefetchDrawerView}
              onFocus={prefetchDrawerView}
              aria-label={label}
              aria-expanded={open}
              className={tabClassName(open)}
            >
              <span className="relative inline-flex">
                <NavCartIcon className="h-6 w-6" />
                <NavBadge count={badgeCount} />
              </span>
              <span className="sr-only">{label}</span>
            </button>
          )}
        />

        <LinkTab tab={wishlistTab} active={wishlistTab.match(pathname)} />
      </div>
    </nav>
  );
}
