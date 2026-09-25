"use client";

import type { MouseEvent } from "react";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

import { MAX_QUICK_ADD_QUANTITY } from "@/features/cart/domain/plain-line";
import { flyToCart } from "@/features/cart/ui/fly-to-cart";
import {
  syncCartProductQuantity,
  useCartProductQuantity,
} from "@/features/cart/ui/cart-product-lines-store";
import { useProductCardCartCopy } from "@/features/products/ui/product-card-cart-copy";
import { ProductCardQtyStepper } from "@/features/products/ui/ProductCardQtyStepper";
import { staticAssetUrl } from "@/lib/media/static-asset-url";

const CART_PLUS_SRC = staticAssetUrl("/assets/brand/home/cart-plus.svg");
const CART_MOBILE_SRC = staticAssetUrl("/assets/brand/home/product-card-cart.svg");

type AddToCartIcon = "cart" | "cart-plus" | "cart-mobile";
type StepperScale = "compact" | "catalog" | "regular";

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
  /** Size box that keeps the price row aligned when the stepper replaces the icon. */
  slotClassName?: string;
  stepperScale?: StepperScale;
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
  slotClassName = "",
  stepperScale = "regular",
}: AddToCartButtonProps) {
  const router = useRouter();
  const copy = useProductCardCartCopy();
  const quantity = useCartProductQuantity(productId);
  const iconClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const showStepper = quantity > 0 && !requiresCustomization;

  function stop(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    event.stopPropagation();
  }

  function handleAdd(event: MouseEvent<HTMLButtonElement>): void {
    stop(event);
    if (disabled) return;
    if (requiresCustomization && productHref) {
      router.push(productHref);
      return;
    }
    flyToCart(event.currentTarget);
    void syncCartProductQuantity(productId, quantity + 1);
  }

  function handleDecrease(event: MouseEvent<HTMLButtonElement>): void {
    stop(event);
    void syncCartProductQuantity(productId, quantity - 1);
  }

  function handleIncrease(event: MouseEvent<HTMLButtonElement>): void {
    stop(event);
    if (disabled || quantity >= MAX_QUICK_ADD_QUANTITY) return;
    void syncCartProductQuantity(productId, quantity + 1);
  }

  return (
    <div className={`relative shrink-0 ${slotClassName}`}>
      {showStepper ? (
        <div className="absolute right-0 top-1/2 z-20 -translate-y-1/2">
          <ProductCardQtyStepper
            quantity={quantity}
            piecesTemplate={copy.piecesCount}
            decreaseLabel={copy.decreaseQuantity}
            increaseLabel={copy.increaseQuantity}
            disableIncrease={disabled || quantity >= MAX_QUICK_ADD_QUANTITY}
            scale={stepperScale}
            onDecrease={handleDecrease}
            onIncrease={handleIncrease}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled}
          aria-label={label}
          className={`inline-flex size-full items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
        >
          <AddToCartGlyph
            icon={icon}
            justAdded={false}
            iconClass={iconClass}
          />
        </button>
      )}
    </div>
  );
}
