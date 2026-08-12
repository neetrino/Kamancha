"use client";

import { Heart } from "lucide-react";

import { BrandHeaderIcon } from "@/components/layout/BrandHeaderIcon";
import {
  SITE_HEADER_CART_BADGE,
  SITE_HEADER_CART_TRIGGER,
} from "@/components/layout/site-header-classes";
import { AppLink } from "@/components/ui/AppLink";
import { useWishlistCount } from "@/features/storefront-chrome/storefront-counts-store";
import type { Locale } from "@/lib/i18n/config";

type WishlistHeaderLinkProps = {
  locale: Locale;
  label: string;
  count: number;
  tone?: "default" | "onDark";
};

/**
 * Header wishlist control. On-dark storefront matches cart: icon + count badge.
 * Count updates locally as soon as the user likes/unlikes.
 */
export function WishlistHeaderLink({
  locale,
  label,
  count: serverCount,
  tone = "default",
}: WishlistHeaderLinkProps) {
  const count = useWishlistCount(serverCount);
  const badgeLabel = count > 99 ? "99+" : String(count);

  if (tone === "onDark") {
    return (
      <AppLink
        href={`/${locale}/wishlist`}
        prefetchPolicy="intent"
        aria-label={count > 0 ? `${label} (${count})` : label}
        className={SITE_HEADER_CART_TRIGGER}
      >
        <span className="pointer-events-none absolute inset-0 inline-flex items-center justify-center">
          <BrandHeaderIcon name="wishlist" size={28} />
        </span>
        {count > 0 ? (
          <span className={SITE_HEADER_CART_BADGE}>{badgeLabel}</span>
        ) : null}
      </AppLink>
    );
  }

  return (
    <AppLink
      href={`/${locale}/wishlist`}
      prefetchPolicy="intent"
      aria-label={count > 0 ? `${label} (${count})` : label}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-lg text-gray-700 transition-colors duration-150 hover:text-gray-900"
    >
      <Heart className="h-5 w-5" aria-hidden="true" />
      {count > 0 ? (
        <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gray-900 px-1 text-[10px] font-semibold text-white">
          {badgeLabel}
        </span>
      ) : null}
    </AppLink>
  );
}
