"use client";

import type { MouseEvent } from "react";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { addToCart } from "@/features/cart/cart";

const CART_PLUS_SRC = "/assets/brand/home/cart-plus.svg";

type AddToCartButtonProps = {
  productId: string;
  label: string;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
  /** Figma 22:295 cart-plus glyph; default Lucide cart. */
  icon?: "cart" | "cart-plus";
};

export function AddToCartButton({
  productId,
  label,
  disabled = false,
  className = "",
  size = "md",
  icon = "cart",
}: AddToCartButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [justAdded, setJustAdded] = useState(false);
  const iconClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  function handleClick(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    event.stopPropagation();
    if (disabled || pending) return;

    startTransition(async () => {
      try {
        await addToCart(productId, 1);
        setJustAdded(true);
        router.refresh();
        window.setTimeout(() => setJustAdded(false), 1500);
      } catch {
        setJustAdded(false);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || pending}
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
