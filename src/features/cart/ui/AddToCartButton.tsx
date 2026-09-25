"use client";

import { useLayoutEffect, useRef, useState, type MouseEvent, type RefObject } from "react";
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
const DESKTOP_CARD_QUERY = "(min-width: 1280px)";
const PRICE_STEPPER_GAP_PX = 4;

function textWidth(element: HTMLElement): number {
  const range = document.createRange();
  range.selectNodeContents(element);
  return Math.ceil(range.getBoundingClientRect().width);
}

/** True when the price text and the quantity control fit on one row. */
function stepperFitsBesidePrice(slot: HTMLElement): boolean {
  if (window.matchMedia(DESKTOP_CARD_QUERY).matches) return true;

  const article = slot.closest("article");
  const priceSlot = article?.querySelector<HTMLElement>("[data-card-price]");
  const stepper = slot.querySelector<HTMLElement>("[data-qty-stepper]");
  const minus = stepper?.querySelector("button");
  if (!priceSlot || !stepper || !minus) return true;

  const price = priceSlot.querySelector("p");
  if (!price) return true;

  const priceWidth = Math.max(
    0,
    ...[...priceSlot.querySelectorAll("p")].map((line) => textWidth(line)),
  );
  const priceLeft = price.getBoundingClientRect().left;
  const stepperBox = stepper.getBoundingClientRect();
  const leadingSpace = minus.getBoundingClientRect().left - stepperBox.left;
  const inlineMinusLeft =
    slot.getBoundingClientRect().right - stepper.offsetWidth + leadingSpace;

  return priceLeft + priceWidth + PRICE_STEPPER_GAP_PX <= inlineMinusLeft;
}

function useStackedQtyStepper(
  slotRef: RefObject<HTMLDivElement | null>,
  active: boolean,
  quantity: number,
): boolean {
  const [stacked, setStacked] = useState(false);

  useLayoutEffect(() => {
    const slot = slotRef.current;
    if (!active || slot == null) {
      setStacked(false);
      return;
    }

    const article = slot.closest("article");
    if (article == null) return;

    const update = (): void => {
      setStacked(!stepperFitsBesidePrice(slot));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(article);
    return () => observer.disconnect();
  }, [active, quantity, slotRef]);

  return stacked;
}

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
  const slotRef = useRef<HTMLDivElement>(null);
  const showStepper = quantity > 0 && !requiresCustomization;
  const stacked = useStackedQtyStepper(slotRef, showStepper, quantity);
  const iconClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";

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
    <div
      ref={slotRef}
      className={`shrink-0 ${stacked ? "max-xl:static xl:relative" : "relative"} ${slotClassName}`}
    >
      {showStepper ? (
        <div
          data-qty-stepper
          data-qty-stacked={stacked ? "" : undefined}
          className={
            stacked
              ? "absolute right-2.5 bottom-2.5 z-20 xl:right-0 xl:bottom-auto xl:top-1/2 xl:-translate-y-1/2"
              : "absolute right-0 top-1/2 z-20 -translate-y-1/2"
          }
        >
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
