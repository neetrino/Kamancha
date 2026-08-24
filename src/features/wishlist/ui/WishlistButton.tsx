"use client";

import type { MouseEvent } from "react";
import { Heart } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { toggleWishlistAction } from "@/features/wishlist/actions";
import {
  adjustWishlistCount,
  revertWishlistCountAdjust,
  settleWishlistCountAdjust,
} from "@/features/storefront-chrome/storefront-counts-store";
import type { Locale } from "@/lib/i18n/config";

type WishlistButtonProps = {
  locale: Locale;
  productId: string;
  initialInWishlist: boolean;
  isSignedIn: boolean;
  label: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
};

export function WishlistButton({
  locale,
  productId,
  initialInWishlist,
  isSignedIn,
  label,
  className = "",
  size = "md",
}: WishlistButtonProps) {
  const router = useRouter();
  const pathname = usePathname() ?? `/${locale}`;
  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const [prevInitial, setPrevInitial] = useState(initialInWishlist);

  if (initialInWishlist !== prevInitial) {
    setPrevInitial(initialInWishlist);
    setInWishlist(initialInWishlist);
  }

  const iconClass =
    size === "sm"
      ? "h-4 w-4"
      : size === "lg"
        ? "h-6 w-6"
        : size === "xl"
          ? "h-7 w-7"
          : "h-5 w-5";

  function handleClick(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    event.stopPropagation();

    if (!isSignedIn) {
      const next = encodeURIComponent(
        typeof window !== "undefined" ? window.location.pathname : `/${locale}`,
      );
      router.push(`/${locale}/login?next=${next}`);
      return;
    }

    const previous = inWishlist;
    const next = !previous;
    setInWishlist(next);
    adjustWishlistCount(next ? 1 : -1);

    void toggleWishlistAction(productId).then((result) => {
      if (!result.ok) {
        setInWishlist(previous);
        revertWishlistCountAdjust(previous ? 1 : -1);
        if (result.error.code === "UNAUTHENTICATED") {
          router.push(`/${locale}/login`);
        }
        return;
      }

      setInWishlist(result.value.inWishlist);
      if (result.value.inWishlist !== next) {
        revertWishlistCountAdjust(result.value.inWishlist ? 1 : -1);
      } else {
        settleWishlistCountAdjust();
      }

      // Wishlist grid needs a soft refresh after unlike; elsewhere badge is enough.
      if (pathname.includes("/wishlist")) {
        router.refresh();
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      aria-pressed={inWishlist}
      className={`inline-flex items-center justify-center rounded-full transition ${className}`}
    >
      <Heart
        className={`${iconClass} ${
          inWishlist
            ? "fill-red-500 text-red-500"
            : "fill-transparent text-current"
        }`}
        aria-hidden
      />
    </button>
  );
}
