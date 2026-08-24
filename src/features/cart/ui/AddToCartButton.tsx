"use client";

import type { MouseEvent } from "react";
import Image from "next/image";
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
const CART_MOBILE_SRC = "/assets/brand/home/product-card-cart.svg";

type AddToCartIcon = "cart" | "cart-plus" | "cart-mobile";

type AddToCartButtonProps = {
  productId: string;
  label: string;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
  /** `cart-plus` — Figma 22:295; `cart-mobile` — Figma 196:276 on 192:185. */
  icon?: AddToCartIcon;
  /**
   * When the dish has additions/exceptions, navigate here instead of
   * quick-adding so the shopper can configure on the PDP.
   */
  productHref?: string;
  requiresCustomization?: boolean;
};

function AddToCartGlyph({
  icon,
  justAdded,
  iconClass,
}: {
  icon: AddToCartIcon;
  justAdded: boolean;
  iconClass: string;
}) {
  const addedClass = justAdded ? "opacity-80" : "";

  if (icon === "cart-mobile") {
    return (
      <Image
        src={CART_MOBILE_SRC}
        alt=""
        width={24}
        height={24}
        className={`size-6 ${addedClass}`}
        aria-hidden
      />
    );
  }

  if (icon === "cart-plus") {
    return (
      <>
        <Image
          src={CART_MOBILE_SRC}
          alt=""
          width={24}
          height={24}
          className={`size-6 sm:hidden ${addedClass}`}
          aria-hidden
        />
        <Image
          src={CART_PLUS_SRC}
          alt=""
          width={30}
          height={26}
          className={`hidden h-[26px] w-[30px] translate-y-[2px] sm:inline ${addedClass}`}
          aria-hidden
        />
      </>
    );
  }

  return (
    <ShoppingCart
      className={`${iconClass} ${
        justAdded ? "fill-current text-current" : "fill-none text-current"
      }`}
      aria-hidden
    />
  );
}

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
      <AddToCartGlyph
        icon={icon}
        justAdded={justAdded}
        iconClass={iconClass}
      />
    </button>
  );
}
