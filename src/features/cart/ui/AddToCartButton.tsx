"use client";

import type { MouseEvent } from "react";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { flyToCart } from "@/features/cart/ui/fly-to-cart";
import { addProductToActiveCart } from "@/features/group-orders/application/add-to-active";
import {
  adjustCartItemCount,
  settleCartItemCountAdjust,
} from "@/features/storefront-chrome/storefront-counts-store";

const CART_PLUS_SRC = "/assets/brand/home/cart-plus.svg";

type AddToCartButtonProps = {
  productId: string;
  label: string;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
  /** Figma 22:295 cart-plus glyph; default Lucide cart. */
  icon?: "cart" | "cart-plus";
  /**
   * When the dish has additions/exceptions, navigate here instead of
   * quick-adding so the shopper can configure on the PDP.
   */
  productHref?: string;
  requiresCustomization?: boolean;
};

export function AddToCartButton({
  productId,
  label,
  disabled = false,
  className = "",
  size = "md",
  icon = "cart",
  productHref,
  requiresCustomization = false,
}: AddToCartButtonProps) {
  const router = useRouter();
  const [justAdded, setJustAdded] = useState(false);
  const iconClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  function handleClick(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;

    if (requiresCustomization && productHref) {
      router.push(productHref);
      return;
    }

    flyToCart(event.currentTarget);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);

    void addProductToActiveCart(productId, 1).then((result) => {
      if (!result.ok) {
        return;
      }
      if (result.target === "cart") {
        adjustCartItemCount(1);
        settleCartItemCountAdjust();
        return;
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label={label}
      data-just-added={justAdded || undefined}
      className={`inline-flex items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {icon === "cart-plus" ? (
        <img
          src={CART_PLUS_SRC}
          alt=""
          width={30}
          height={26}
          className={`h-[26px] w-[30px] translate-y-[2px] ${justAdded ? "opacity-80" : ""}`}
          aria-hidden
        />
      ) : (
        <ShoppingCart
          className={`${iconClass} ${
            justAdded ? "fill-current text-current" : "fill-none text-current"
          }`}
          aria-hidden
        />
      )}
    </button>
  );
}
