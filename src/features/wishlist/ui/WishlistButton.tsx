"use client";

import type { MouseEvent } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

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
  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const [pending, startTransition] = useTransition();
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

    startTransition(async () => {
      const previous = inWishlist;
      const next = !previous;
      setInWishlist(next);
      adjustWishlistCount(next ? 1 : -1);
      const result = await toggleWishlistAction(productId);
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
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={label}
      aria-pressed={inWishlist}
      className={`inline-flex items-center justify-center rounded-full transition disabled:opacity-60 ${className}`}
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
