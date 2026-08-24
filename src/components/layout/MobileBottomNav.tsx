"use client";

import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { AppLink } from "@/components/ui/AppLink";
import { GroupOrderHeaderButton } from "@/components/layout/GroupOrderHeaderButton";
import {
  NavActiveDiamonds,
  NavCartIcon,
  NavClocheIcon,
  NavGroupIcon,
  NavHeartIcon,
  NavHomeIcon,
} from "@/components/layout/storefront-nav-icons";
import { SLIDING_NAV_TRANSITION_MS } from "@/components/ui/useSlidingNavIndicator";
import { CartDrawer } from "@/features/cart/ui/CartDrawer";
import { useWishlistCount } from "@/features/storefront-chrome/storefront-counts-store";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import type { Currency } from "@/lib/money/currency";

const TAB_ORDER = ["home", "shop", "cart", "wishlist"] as const;
const DIAMOND_WIDTH_PX = 27;
const TAB_PERCENT = 100 / TAB_ORDER.length;

type BottomNavTabId = (typeof TAB_ORDER)[number];

type MobileBottomNavProps = {
  locale: Locale;
  currency: Currency;
  dictionary: Dictionary;
  cartItemCount: number;
  wishlistCount: number;
  groupOrderDefaultName?: string;
};

type NavTab = {
  id: Exclude<BottomNavTabId, "cart">;
  href: string;
  label: string;
  icon: ReactNode;
  badge?: number;
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

function resolveSelectedTab(
  pathname: string,
  locale: Locale,
  cartOpen: boolean,
): BottomNavTabId | null {
  if (cartOpen) return "cart";
  if (isHomePath(pathname, locale)) return "home";
  if (startsWithPath(pathname, `/${locale}/products`)) return "shop";
  if (startsWithPath(pathname, `/${locale}/wishlist`)) return "wishlist";
  return null;
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
      className={tabClassName(active)}
    >
      <span className="relative inline-flex">
        {tab.icon}
        {tab.badge != null ? <NavBadge count={tab.badge} /> : null}
      </span>
      <span className="sr-only">{tab.label}</span>
    </AppLink>
  );
}

function SlidingDiamonds({
  tabIndex,
  visible,
}: {
  tabIndex: number;
  visible: boolean;
}) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute bottom-1.5 z-[1] h-[10px] w-[27px] text-brand-forest motion-reduce:transition-none ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        left: `calc(${TAB_PERCENT / 2}% - ${DIAMOND_WIDTH_PX / 2}px)`,
        transform: `translate3d(calc(${tabIndex} * 100cqw / ${TAB_ORDER.length}), 0, 0)`,
        transitionProperty: "transform, opacity",
        transitionDuration: `${SLIDING_NAV_TRANSITION_MS}ms`,
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <NavActiveDiamonds className="h-full w-full" />
    </span>
  );
}

type BottomNavBarProps = {
  pathname: string;
  locale: Locale;
  homeTab: NavTab;
  shopTab: NavTab;
  wishlistTab: NavTab;
  cartOpen: boolean;
  badgeCount: number;
  cartLabel: string;
  openDrawer: () => void;
  prefetchDrawerView: () => void;
};

function BottomNavBar({
  pathname,
  locale,
  homeTab,
  shopTab,
  wishlistTab,
  cartOpen,
  badgeCount,
  cartLabel,
  openDrawer,
  prefetchDrawerView,
}: BottomNavBarProps) {
  const selectedTab = resolveSelectedTab(pathname, locale, cartOpen);
  const selectedIndex =
    selectedTab == null ? null : TAB_ORDER.indexOf(selectedTab);
  const [parkedIndex, setParkedIndex] = useState(selectedIndex ?? 0);
  if (selectedIndex != null && selectedIndex !== parkedIndex) {
    setParkedIndex(selectedIndex);
  }
  const tabIndex = selectedIndex ?? parkedIndex;

  return (
    <div
      className="pointer-events-auto relative flex h-[63px] w-[267px] min-w-0 max-w-full flex-1 items-stretch rounded-[40px] bg-white shadow-[0px_0px_9px_0px_rgba(0,0,0,0.25)] [container-type:inline-size]"
      data-node-id="181:727"
    >
      <LinkTab tab={homeTab} active={selectedTab === "home"} />
      <LinkTab tab={shopTab} active={selectedTab === "shop"} />
      <button
        type="button"
        data-cart-fly-target
        onClick={openDrawer}
        onPointerEnter={prefetchDrawerView}
        onFocus={prefetchDrawerView}
        aria-label={cartLabel}
        aria-expanded={cartOpen}
        className={tabClassName(selectedTab === "cart")}
      >
        <span className="relative inline-flex">
          <NavCartIcon className="h-[25px] w-[25px]" />
          <NavBadge count={badgeCount} />
        </span>
        <span className="sr-only">{cartLabel}</span>
      </button>
      <LinkTab tab={wishlistTab} active={selectedTab === "wishlist"} />
      <SlidingDiamonds tabIndex={tabIndex} visible={selectedTab != null} />
    </div>
  );
}

export function MobileBottomNav({
  locale,
  currency,
  dictionary,
  cartItemCount,
  wishlistCount,
  groupOrderDefaultName = "",
}: MobileBottomNavProps) {
  const pathname = usePathname() ?? `/${locale}`;
  const liveWishlistCount = useWishlistCount(wishlistCount);

  const homeTab: NavTab = {
    id: "home",
    href: `/${locale}`,
    label: dictionary.nav.home,
    icon: <NavHomeIcon className="h-6 w-6" />,
  };

  const shopTab: NavTab = {
    id: "shop",
    href: `/${locale}/products`,
    label: dictionary.nav.shop,
    icon: <NavClocheIcon className="h-[25px] w-[29px]" />,
  };

  const wishlistTab: NavTab = {
    id: "wishlist",
    href: `/${locale}/wishlist`,
    label: dictionary.nav.wishlist,
    icon: <NavHeartIcon className="h-6 w-7" />,
    badge: liveWishlistCount,
  };

  return (
    <nav
      aria-label={dictionary.nav.navigation}
      className="mobile-bottom-nav pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      <div
        className="pointer-events-auto flex w-[339px] max-w-[calc(100%-3rem)] items-center gap-[9px]"
        data-node-id="370:369"
      >
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
            <BottomNavBar
              pathname={pathname}
              locale={locale}
              homeTab={homeTab}
              shopTab={shopTab}
              wishlistTab={wishlistTab}
              cartOpen={open}
              badgeCount={badgeCount}
              cartLabel={label}
              openDrawer={openDrawer}
              prefetchDrawerView={prefetchDrawerView}
            />
          )}
        />
        <GroupOrderHeaderButton
          locale={locale}
          label={dictionary.nav.groupOrder}
          labels={dictionary.groupOrder}
          defaultName={groupOrderDefaultName}
          className="flex size-[63px] shrink-0 items-center justify-center rounded-full bg-white text-brand-forest shadow-[0px_0px_9px_0px_rgba(0,0,0,0.25)] touch-manipulation"
          icon={<NavGroupIcon className="h-[26px] w-[30px]" />}
        />
      </div>
    </nav>
  );
}
