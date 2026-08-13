import Image from "next/image";

import { AppLink } from "@/components/ui/AppLink";
import { AddToCartButton } from "@/features/cart/ui/AddToCartButton";
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
   * `fixed` — Figma 300×419 (catalog / home).
   * `fluid` — fills grid cell (wishlist 5-up).
   */
  layout?: "fixed" | "fluid";
};

function formatDiscountOff(template: string, percent: number): string {
  return template.replace("{percent}", String(percent));
}

/**
 * Storefront product card — Figma items / border (22:230 / 22:307).
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
  const fluid = layout === "fluid";

  return (
    <article
      data-node-id="22:230"
      className={`group relative flex flex-col overflow-hidden bg-white transition-[translate,box-shadow] duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:z-10 hover:-translate-y-2 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
        fluid
          ? "h-auto w-full rounded-[24px]"
          : "h-[419px] w-[300px] shrink-0 rounded-[37px]"
      } ${className}`}
    >
      <div
        className={`relative z-[1] shrink-0 overflow-hidden bg-neutral-100 ${
          fluid
            ? "mx-1 mt-1 aspect-[5/4] rounded-[16px]"
            : "mx-[6px] mt-[7px] h-[220px] rounded-[30px]"
        }`}
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
            sizes={
              fluid
                ? "(min-width:1280px) 220px, (min-width:1024px) 20vw, (min-width:640px) 40vw, 50vw"
                : "287px"
            }
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            priority={priority}
            loading={priority ? undefined : "lazy"}
          />
        </AppLink>

        {discountPercent != null ? (
          <span
            data-node-id="22:250"
            className={`absolute z-10 flex items-center justify-center rounded-[30px] bg-[#84d086] text-center leading-none font-bold text-[#132814] ${
              fluid
                ? "top-1.5 left-1.5 h-6 min-w-[4.25rem] px-1.5 text-[10px]"
                : "top-3.5 left-2.5 h-[33px] min-w-[96px] px-3 text-[14px]"
            }`}
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
            size={fluid ? "lg" : "xl"}
            className={`absolute z-10 bg-transparent text-white shadow-none hover:bg-white/10 ${
              fluid ? "top-1.5 right-1.5 size-10" : "top-2.5 right-2 size-10"
            }`}
          />
        ) : null}
      </div>

      <div
        className={`relative z-[1] mx-auto shrink-0 ${
          fluid
            ? "mt-1 w-[calc(100%-8px)] [container-type:inline-size]"
            : "mt-2 w-[276px]"
        }`}
        aria-hidden
      >
        <div
          className={`relative w-full overflow-hidden ${
            fluid ? "h-[clamp(1.5rem,12cqw,2rem)]" : "h-11"
          }`}
        >
          <img
            src={DIVIDER_SRC}
            alt=""
            width={44}
            height={276}
            className="absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 rotate-90"
            style={
              fluid
                ? {
                    height: "100cqi",
                    width: "calc(100cqi * 44 / 276)",
                  }
                : { width: 44, height: 276 }
            }
          />
        </div>
      </div>

      <div
        className={`relative z-[1] flex min-h-0 flex-1 ${
          fluid ? "min-h-[5.5rem] gap-1 px-2.5 pt-2 pb-3.5" : "px-[17px] pt-2 pb-5"
        }`}
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <h3
            className={`truncate font-medium text-[#222] ${
              fluid ? "text-[13px] leading-5" : "text-[16px] leading-[30px]"
            }`}
          >
            <AppLink
              href={href}
              prefetchPolicy={priority ? "intent" : "auto"}
              className="hover:opacity-80"
            >
              {title}
            </AppLink>
          </h3>
          {categoryLabel ? (
            <p
              className={`truncate font-normal text-black/50 ${
                fluid
                  ? "text-[11px] leading-3.5"
                  : "-mt-2 text-[16px] leading-[30px]"
              }`}
            >
              {categoryLabel}
            </p>
          ) : null}
          <div className={`flex flex-col gap-px ${fluid ? "mt-0.5" : "mt-1"}`}>
            <p
              className={`leading-none font-bold text-[#222] ${
                fluid ? "text-[15px]" : "text-[22px]"
              }`}
            >
              {priceFormatted}
            </p>
            {onSale ? (
              <p
                className={`font-medium text-[rgba(34,34,34,0.44)] line-through ${
                  fluid ? "text-[11px] leading-3.5" : "text-[16px] leading-5"
                }`}
              >
                {compareAtFormatted}
              </p>
            ) : null}
          </div>
        </div>

        <div
          className={`relative flex shrink-0 flex-col items-end ${
            fluid ? "ml-1 w-11 gap-2" : "ml-2 w-[52px] gap-3"
          }`}
        >
          <div data-node-id="22:242" className="flex items-center gap-0.5">
            <img
              src={STAR_SRC}
              alt=""
              width={fluid ? 12 : 18}
              height={fluid ? 12 : 18}
              className={fluid ? "size-3" : "size-[18px]"}
            />
            <span
              className={`font-semibold text-[#222] ${
                fluid ? "text-[11px]" : "text-[16px]"
              }`}
            >
              {ratingLabel}
            </span>
          </div>

          {showAddToCart ? (
            <AddToCartButton
              productId={productId}
              label={addToCartLabel}
              disabled={!inStock}
              size="md"
              icon="cart-plus"
              productHref={href}
              requiresCustomization={requiresCustomization}
              className={`mt-auto rounded-[40px] bg-brand-forest hover:bg-[#1e3f1f] ${
                fluid ? "size-11 [&_img]:h-5 [&_img]:w-6" : "size-[50px]"
              }`}
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
