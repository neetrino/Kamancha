import { Heart } from "lucide-react";

import { AppLink } from "@/components/ui/AppLink";
import type { Locale } from "@/lib/i18n/config";

type WishlistHeaderLinkProps = {
  locale: Locale;
  label: string;
  count: number;
  tone?: "default" | "onDark";
};

export function WishlistHeaderLink({
  locale,
  label,
  count,
  tone = "default",
}: WishlistHeaderLinkProps) {
  const linkClass =
    tone === "onDark"
      ? "relative inline-flex size-6 items-center justify-center text-white transition-opacity duration-150 hover:opacity-80"
      : "relative inline-flex h-11 w-11 items-center justify-center rounded-lg text-gray-700 transition-colors duration-150 hover:text-gray-900";
  const iconClass = tone === "onDark" ? "h-6 w-6" : "h-5 w-5";
  const badgeClass =
    tone === "onDark"
      ? "absolute -top-2 -right-2 flex size-[18px] min-w-[18px] items-center justify-center rounded-full border border-white bg-brand-forest text-[10px] font-bold text-white"
      : "absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gray-900 px-1 text-[10px] font-semibold text-white";

  return (
    <AppLink
      href={`/${locale}/wishlist`}
      prefetchPolicy="intent"
      aria-label={label}
      className={linkClass}
    >
      <Heart className={iconClass} aria-hidden="true" />
      {count > 0 ? (
        <span className={badgeClass}>{count > 99 ? "99+" : count}</span>
      ) : null}
    </AppLink>
  );
}
