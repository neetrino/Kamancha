import { Heart } from "lucide-react";

import { BrandHeaderIcon } from "@/components/layout/BrandHeaderIcon";
import { AppLink } from "@/components/ui/AppLink";
import type { Locale } from "@/lib/i18n/config";

type WishlistHeaderLinkProps = {
  locale: Locale;
  label: string;
  count: number;
  tone?: "default" | "onDark";
};

/**
 * Header wishlist control. On-dark storefront matches Figma 22:420 (24×24, no badge).
 */
export function WishlistHeaderLink({
  locale,
  label,
  count,
  tone = "default",
}: WishlistHeaderLinkProps) {
  if (tone === "onDark") {
    return (
      <AppLink
        href={`/${locale}/wishlist`}
        prefetchPolicy="intent"
        aria-label={count > 0 ? `${label} (${count})` : label}
        className="inline-flex size-7 shrink-0 items-center justify-center text-white transition-opacity duration-150 hover:opacity-80"
      >
        <BrandHeaderIcon name="wishlist" size={28} />
      </AppLink>
    );
  }

  return (
    <AppLink
      href={`/${locale}/wishlist`}
      prefetchPolicy="intent"
      aria-label={label}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-lg text-gray-700 transition-colors duration-150 hover:text-gray-900"
    >
      <Heart className="h-5 w-5" aria-hidden="true" />
      {count > 0 ? (
        <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gray-900 px-1 text-[10px] font-semibold text-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </AppLink>
  );
}
