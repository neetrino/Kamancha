import Image from "next/image";

import { AppLink } from "@/components/ui/AppLink";
import { AddToCartButton } from "@/features/cart/ui/AddToCartButton";
import {
  productCardLayout,
  type ProductCardLayout,
} from "@/features/products/ui/product-card-layout";
import { WishlistButton } from "@/features/wishlist/ui/WishlistButton";
import type { Locale } from "@/lib/i18n/config";
import { STOREFRONT_PRODUCT_PHOTO } from "@/lib/media/storefront-product-photo";

const DIVIDER_SRC = "/assets/brand/home/product-card-divider.svg";
const STAR_SRC = "/assets/brand/home/star.svg";

type ProductCardProps = {
  href: string;
  title: string;
  priceFormatted: string;
  compareAtFormatted?: string | null;
  discountPercent?: number | null;
  /** Optional category subtitle (Figma 22:238). */
  categoryLabel?: string | null;
  /** Optional average rating 0–5 (Figma 22:242). */
  rating?: number | null;
  discountOffLabel?: string;
  imageUrl: string | null;
  inStock: boolean;
  priority?: boolean;
  locale?: Locale;
  productId?: string;
  inWishlist?: boolean;
  isSignedIn?: boolean;
  wishlistLabel?: string;
  addToCartLabel?: string;
  /** When true, cart control opens the PDP so the shopper can configure the dish. */
  requiresCustomization?: boolean;
  className?: string;
  /**
   * `fixed` — Figma 300×419 (home desktop).
   * `fluid` — fills grid cell (wishlist 5-up).
   * `compact` — Figma mobile 214×302 (home rails).
   * `catalog` — Figma 103:3029 menu card (2-col mobile, 300px from sm).
   */
  layout?: ProductCardLayout;
};

function formatDiscountOff(template: string, percent: number): string {
  return template.replace("{percent}", String(percent));
}

/**
 * Storefront product card — Figma items 22:230 / catalog 103:3029.
 */
export function ProductCard({
  href,
  title,
  priceFormatted,
  compareAtFormatted = null,
  discountPercent = null,
  categoryLabel = null,
  rating = null,
  discountOffLabel = "{percent}% Off",
  imageUrl: _imageUrl,
  inStock,
  priority = false,
  locale,
  productId,
  inWishlist = false,
  isSignedIn = false,
  wishlistLabel,
  addToCartLabel,
  requiresCustomization = false,
  className = "",
  layout = "fixed",
}: ProductCardProps) {
  const onSale = Boolean(compareAtFormatted);
  const showWishlist =
    locale != null && productId != null && wishlistLabel != null;
  const showAddToCart = productId != null && addToCartLabel != null;
  const showRating = rating != null && rating > 0;
  const ratingLabel = showRating ? rating.toFixed(1) : "—";
  const ui = productCardLayout(layout);
  const fluid = layout === "fluid";
  const compact = layout === "compact";
  const catalog = layout === "catalog";
  const useScaledDivider = fluid || catalog;
  const starPx = fluid ? 12 : catalog ? 24 : 18;

  return (
    <article
      data-node-id={catalog ? "103:3029" : "22:230"}
      className={`group relative flex flex-col overflow-hidden bg-white transition-[translate,box-shadow] duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:z-10 hover:-translate-y-2 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${ui.article} ${className}`}
    >
      <div
        className={`relative z-[1] shrink-0 overflow-hidden bg-neutral-100 ${ui.image}`}
      >
        <AppLink
          href={href}
          prefetchPolicy={priority ? "intent" : "auto"}
          className="absolute inset-0 block"
        >
          <Image
            src={STOREFRONT_PRODUCT_PHOTO}
            alt={title}
            fill
            sizes={ui.imageSizes}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            priority={priority}
            loading={priority ? undefined : "lazy"}
          />
        </AppLink>

        {discountPercent != null ? (
          <span
            data-node-id="22:250"
            className={`absolute z-10 flex items-center justify-center rounded-[30px] text-center leading-none font-bold ${ui.badge}`}
          >
            {formatDiscountOff(discountOffLabel, discountPercent)}
          </span>
        ) : null}

        {showWishlist ? (
          <WishlistButton
            locale={locale}
            productId={productId}
            initialInWishlist={inWishlist}
            isSignedIn={isSignedIn}
            label={wishlistLabel}
            size={ui.wishlistSize}
            className={`absolute z-10 bg-transparent text-white shadow-none hover:bg-white/10 ${ui.wishlist}`}
          />
        ) : null}
      </div>

      {compact ? null : (
        <div
          className={`relative z-[1] mx-auto hidden shrink-0 overflow-visible md:block ${
            useScaledDivider
              ? "mt-1 w-[calc(100%-24px)] max-w-[276px] [container-type:inline-size] sm:mt-2"
              : "mt-2 w-[276px]"
          }`}
          aria-hidden
        >
          <div
            className={`relative w-full overflow-visible ${
              useScaledDivider ? "h-[calc(100cqi*44/276+8px)]" : "h-[52px]"
            }`}
          >
            <img
              src={DIVIDER_SRC}
              alt=""
              width={44}
              height={276}
              className="absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 rotate-90"
              style={
                useScaledDivider
                  ? {
                      height: "100cqi",
                      width: "calc(100cqi * 44 / 276)",
                    }
                  : { width: 44, height: 276 }
              }
            />
          </div>
        </div>
      )}

      <div
        className={`relative z-[1] flex min-h-0 flex-1 ${ui.body}`}
      >
        <div
          className={`flex min-w-0 flex-1 flex-col ${
            compact ? "gap-1.5" : catalog ? "gap-2 sm:gap-0" : ""
          }`}
        >
          <h3 className={`truncate font-medium text-[#222] ${ui.title}`}>
            <AppLink
              href={href}
              prefetchPolicy={priority ? "intent" : "auto"}
              className="hover:opacity-80"
            >
              {title}
            </AppLink>
          </h3>
          {categoryLabel ? (
            <p className={`truncate font-normal text-black/50 ${ui.category}`}>
              {categoryLabel}
            </p>
          ) : null}
          <div
            className={`flex flex-col ${
              compact
                ? "gap-1"
                : catalog
                  ? "gap-1.5 sm:mt-0.5 sm:gap-px"
                  : `gap-px ${fluid ? "mt-0.5" : "mt-1"}`
            }`}
          >
            <p className={`leading-none font-bold text-[#222] ${ui.price}`}>
              {priceFormatted}
            </p>
            {onSale ? (
              <p
                className={`font-medium text-[rgba(34,34,34,0.44)] line-through ${ui.compare}`}
              >
                {compareAtFormatted}
              </p>
            ) : null}
          </div>
        </div>

        <div
          className={`relative flex shrink-0 flex-col items-end ${ui.metaCol}`}
        >
          <div data-node-id="22:242" className="flex items-center gap-0.5">
            <img
              src={STAR_SRC}
              alt=""
              width={starPx}
              height={starPx}
              className={ui.star}
            />
            <span className={`font-semibold text-[#222] ${ui.rating}`}>
              {ratingLabel}
            </span>
          </div>

          {showAddToCart ? (
            <AddToCartButton
              productId={productId}
              label={addToCartLabel}
              disabled={!inStock}
              size="md"
              icon={compact ? "cart-mobile" : "cart-plus"}
              productHref={href}
              requiresCustomization={requiresCustomization}
              className={`mt-auto rounded-full bg-brand-forest hover:bg-[#1e3f1f] ${ui.cart}`}
            />
          ) : null}
        </div>
      </div>

      {!inStock ? (
        <span className="absolute bottom-3 left-4 z-20 rounded-full bg-gray-900/90 px-2.5 py-1 text-xs font-semibold text-white">
          Out of stock
        </span>
      ) : null}
    </article>
  );
}
