"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { X } from "lucide-react";

import type { CheckoutOrderProduct } from "@/features/checkout/ui/checkout-order-product";
import { removeItem } from "@/features/cart/cart";
import { HomeCategorySwitchers } from "@/features/home/ui/HomeCategorySwitchers";
import {
  adjustCartItemCount,
  revertCartItemCountAdjust,
  settleCartItemCountAdjust,
} from "@/features/storefront-chrome/storefront-counts-store";
import type { Locale } from "@/lib/i18n/config";
import { storefrontProductImageSrc } from "@/lib/media/storefront-product-photo";
import { formatMoneyAmount } from "@/lib/money/format";

const THUMB_SIZE_PX = 56;
const THUMB_SIZE_DESKTOP_PX = 72;
const THUMB_RADIUS_PX = 12;
const CARD_MIN_WIDTH_PX = 200;
const CARD_MAX_WIDTH_PX = 320;

function readScrollStep(scroller: HTMLElement): number {
  const first = scroller.children.item(0);
  const second = scroller.children.item(1);
  if (first instanceof HTMLElement && second instanceof HTMLElement) {
    return second.offsetLeft - first.offsetLeft;
  }
  if (first instanceof HTMLElement) {
    return first.offsetWidth;
  }
  return Math.round(scroller.clientWidth * 0.75);
}

function useCheckoutItemsRail(itemKey: number) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateEdges = useCallback((): void => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const maxScroll = scroller.scrollWidth - scroller.clientWidth;
    setCanPrev(scroller.scrollLeft > 1);
    setCanNext(scroller.scrollLeft < maxScroll - 1);
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    updateEdges();
    scroller.addEventListener("scroll", updateEdges, { passive: true });
    const observer = new ResizeObserver(updateEdges);
    observer.observe(scroller);
    return () => {
      scroller.removeEventListener("scroll", updateEdges);
      observer.disconnect();
    };
  }, [itemKey, updateEdges]);

  function scrollByDirection(direction: -1 | 1): void {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollBy({
      left: direction * readScrollStep(scroller),
      behavior: "smooth",
    });
  }

  return { scrollerRef, canPrev, canNext, scrollByDirection };
}

type CheckoutProductsInOrderProps = {
  products: CheckoutOrderProduct[];
  title: string;
  itemsOneLabel: string;
  itemsManyLabel: string;
  previousItemLabel: string;
  nextItemLabel: string;
  removeItemLabel: string;
  locale: Locale;
  onCartChanged?: () => void;
};

function formatItemCount(
  count: number,
  itemsOneLabel: string,
  itemsManyLabel: string,
): string {
  if (count === 1) {
    return itemsOneLabel;
  }
  return itemsManyLabel.replace("{count}", String(count));
}

type CheckoutOrderItemCardProps = {
  product: CheckoutOrderProduct;
  locale: Locale;
  removeItemLabel: string;
  onRemove: (itemId: string) => void;
};

function CheckoutOrderItemCard({
  product,
  locale,
  removeItemLabel,
  onRemove,
}: CheckoutOrderItemCardProps) {
  const imageSrc = storefrontProductImageSrc(product.imageUrl);

  return (
    <article
      className="relative isolate w-max shrink-0 overflow-hidden rounded-[20px] bg-white p-3"
      style={{
        minWidth: CARD_MIN_WIDTH_PX,
        maxWidth: CARD_MAX_WIDTH_PX,
      }}
    >
      <button
        type="button"
        onClick={() => onRemove(product.id)}
        className="absolute top-2 right-2 z-[3] flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
        aria-label={removeItemLabel}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>

      <div className="relative z-[2] flex items-center gap-3 pr-7">
        <div
          className="relative size-14 shrink-0 overflow-hidden lg:size-[72px]"
          style={{ borderRadius: THUMB_RADIUS_PX }}
        >
          <Image
            src={imageSrc}
            alt={product.title}
            fill
            className="object-cover"
            sizes={`(min-width: 1024px) ${THUMB_SIZE_DESKTOP_PX}px, ${THUMB_SIZE_PX}px`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-sm font-medium leading-5 text-gray-900 lg:line-clamp-2 lg:min-h-10">
            {product.title}
          </p>
          {product.modifierSummary ? (
            <p
              className="mt-0.5 line-clamp-1 text-xs text-gray-500 lg:line-clamp-2"
              title={product.modifierSummary}
            >
              {product.modifierSummary}
            </p>
          ) : null}
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-sm font-semibold text-gray-900">
              {formatMoneyAmount(product.lineTotalAmount, "AMD", locale)}
            </p>
            <span className="inline-flex h-6 min-w-[24px] shrink-0 items-center justify-center rounded-full border border-gray-200 bg-sky-50/70 px-2 text-[11px] font-semibold text-gray-900">
              ×{product.quantity}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export function CheckoutProductsInOrder({
  products: initialProducts,
  title,
  itemsOneLabel,
  itemsManyLabel,
  previousItemLabel,
  nextItemLabel,
  removeItemLabel,
  locale,
  onCartChanged,
}: CheckoutProductsInOrderProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [prevInitialProducts, setPrevInitialProducts] = useState(initialProducts);
  const { scrollerRef, canPrev, canNext, scrollByDirection } =
    useCheckoutItemsRail(products.length);

  if (initialProducts !== prevInitialProducts) {
    setPrevInitialProducts(initialProducts);
    setProducts(initialProducts);
  }

  const itemCount = products.reduce((sum, product) => sum + product.quantity, 0);

  if (products.length === 0) {
    return null;
  }

  function onRemove(itemId: string): void {
    const current = products.find((product) => product.id === itemId);
    if (!current) return;

    const previous = products;
    setProducts((list) => list.filter((product) => product.id !== itemId));
    adjustCartItemCount(-current.quantity);
    onCartChanged?.();

    void removeItem(itemId)
      .then(() => {
        settleCartItemCountAdjust();
        router.refresh();
      })
      .catch(() => {
        setProducts(previous);
        revertCartItemCountAdjust(current.quantity);
      });
  }

  return (
    <section
      className="liquid-glass isolate overflow-hidden mb-6 rounded-[15px] px-5 py-4 sm:px-6 sm:py-5"
      aria-labelledby="checkout-order-items-title"
    >
      <div className="relative z-[2] flex items-center justify-between gap-4">
        <h2
          id="checkout-order-items-title"
          className="font-big-fat-boii text-xl font-normal tracking-wide text-white uppercase"
        >
          {title}
        </h2>
        <div className="flex shrink-0 items-center gap-2">
          <p className="text-sm text-white">
            {formatItemCount(itemCount, itemsOneLabel, itemsManyLabel)}
          </p>
          <div className="hidden xl:block">
            <HomeCategorySwitchers
              compact
              previousLabel={previousItemLabel}
              nextLabel={nextItemLabel}
              canPrev={canPrev}
              canNext={canNext}
              onPrev={() => scrollByDirection(-1)}
              onNext={() => scrollByDirection(1)}
            />
          </div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="relative z-[2] flex gap-3 overflow-x-auto overscroll-x-contain pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <CheckoutOrderItemCard
            key={product.id}
            product={product}
            locale={locale}
            removeItemLabel={removeItemLabel}
            onRemove={onRemove}
          />
        ))}
      </div>
    </section>
  );
}
