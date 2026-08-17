"use client";

import {
  Heart,
  Home,
  ShoppingBag,
  ShoppingCart,
  User,
} from "lucide-react";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import { AppLink } from "@/components/ui/AppLink";
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
  isSignedIn: boolean;
};

type NavTab = {
  id: string;
  href: string;
  label: string;
  icon: LucideIcon;
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
    "relative flex min-w-0 flex-1 flex-col items-center justify-center px-1 py-2 transition-colors",
    active ? "text-brand-forest" : "text-gray-400 hover:text-brand-forest",
  ].join(" ");
}

function NavBadge({ count }: { count: number }) {
  if (count <= 0) {
    return null;
  }

  return (
    <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gray-900 px-1 text-[9px] font-semibold text-white">
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
  const Icon = tab.icon;

  return (
    <AppLink
      href={tab.href}
      prefetchPolicy="intent"
      aria-current={active ? "page" : undefined}
      className={`${tabClassName(active)} ${tab.className ?? ""}`}
    >
      <span className="relative inline-flex">
        <Icon
          className="h-5 w-5"
          strokeWidth={active ? 2.25 : 1.75}
          aria-hidden="true"
        />
        {tab.badge != null ? <NavBadge count={tab.badge} /> : null}
      </span>
      {active && tab.id === "home" ? (
        <span className="absolute bottom-1 flex gap-0.5" aria-hidden>
          <span className="size-1 rotate-45 bg-brand-forest" />
          <span className="size-1.5 rotate-45 bg-brand-forest" />
          <span className="size-1 rotate-45 bg-brand-forest" />
        </span>
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
  isSignedIn,
}: MobileBottomNavProps) {
  const pathname = usePathname() ?? `/${locale}`;
  const liveWishlistCount = useWishlistCount(wishlistCount);
  const profileHref = isSignedIn
    ? `/${locale}/profile`
    : `/${locale}/login`;

  const homeTab: NavTab = {
    id: "home",
    href: `/${locale}`,
    label: dictionary.nav.home,
    icon: Home,
    match: (path) => isHomePath(path, locale),
  };

  const shopTab: NavTab = {
    id: "shop",
    href: `/${locale}/products`,
    label: dictionary.nav.shop,
    icon: ShoppingBag,
    match: (path) => startsWithPath(path, `/${locale}/products`),
  };

  const wishlistTab: NavTab = {
    id: "wishlist",
    href: `/${locale}/wishlist`,
    label: dictionary.nav.wishlist,
    icon: Heart,
    match: (path) => startsWithPath(path, `/${locale}/wishlist`),
    badge: liveWishlistCount,
  };

  const profileTab: NavTab = {
    id: "profile",
    href: profileHref,
    label: dictionary.header.profile,
    icon: User,
    className: "mobile-bottom-nav-profile",
    match: (path) =>
      startsWithPath(path, `/${locale}/profile`) ||
      startsWithPath(path, `/${locale}/login`),
  };

  return (
    <nav
      aria-label={dictionary.nav.navigation}
      className="mobile-bottom-nav pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
    >
      <div
        className="pointer-events-auto flex h-[63px] w-[min(calc(100%-3rem),325px)] items-stretch rounded-[80px] bg-white shadow-[0_0_9px_rgba(0,0,0,0.25)]"
        data-node-id="181:729"
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
                <ShoppingCart
                  className="h-5 w-5"
                  strokeWidth={open ? 2.25 : 1.75}
                  aria-hidden="true"
                />
                <NavBadge count={badgeCount} />
              </span>
              <span className="sr-only">{label}</span>
            </button>
          )}
        />

        <LinkTab tab={wishlistTab} active={wishlistTab.match(pathname)} />
        <LinkTab tab={profileTab} active={profileTab.match(pathname)} />
      </div>
    </nav>
  );
}
