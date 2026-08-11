import Image from "next/image";

import { AppLink } from "@/components/ui/AppLink";
import { AddToCartButton } from "@/features/cart/ui/AddToCartButton";
import { WishlistButton } from "@/features/wishlist/ui/WishlistButton";
import type { Locale } from "@/lib/i18n/config";

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
  className?: string;
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
  imageUrl,
  inStock,
  priority = false,
  locale,
  productId,
  inWishlist = false,
  isSignedIn = false,
  wishlistLabel,
  addToCartLabel,
  className = "",
}: ProductCardProps) {
  const onSale = Boolean(compareAtFormatted);
  const showWishlist =
    locale != null && productId != null && wishlistLabel != null;
  const showAddToCart = productId != null && addToCartLabel != null;
  const showRating = rating != null && rating > 0;
  const ratingLabel = showRating ? rating.toFixed(1) : "—";

  return (
    <article
      data-node-id="22:230"
      className={`group relative flex h-[419px] w-[300px] shrink-0 flex-col overflow-hidden rounded-[37px] bg-white transition-[translate,box-shadow] duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:z-10 hover:-translate-y-2 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${className}`}
    >
      <div className="relative z-[1] mx-[6px] mt-[7px] h-[220px] shrink-0 overflow-hidden rounded-[30px] bg-neutral-100">
        <AppLink
          href={href}
          prefetchPolicy={priority ? "intent" : "auto"}
          className="absolute inset-0 block"
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="287px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              priority={priority}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
              No image
            </div>
          )}
        </AppLink>

        {discountPercent != null ? (
          <span
            data-node-id="22:250"
            className="absolute top-3.5 left-2.5 z-10 flex h-[33px] min-w-[96px] items-center justify-center rounded-[30px] bg-[#84d086] px-3 text-center text-[14px] leading-none font-bold text-[#132814]"
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
            size="xl"
            className="absolute top-2.5 right-2 z-10 size-10 bg-transparent text-white shadow-none hover:bg-white/10"
          />
        ) : null}
      </div>

      {/* Ornament under the photo — not overlaid on the image. */}
      <div
        className="relative z-[1] mx-auto mt-2 flex h-11 w-[276px] shrink-0 items-center justify-center overflow-hidden"
        aria-hidden
      >
        <img
          src={DIVIDER_SRC}
          alt=""
          width={44}
          height={276}
          className="h-[276px] w-11 shrink-0 origin-center rotate-90"
        />
      </div>

      <div className="relative z-[1] flex min-h-0 flex-1 px-[17px] pt-2 pb-5">
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="truncate text-[16px] leading-[30px] font-medium text-[#222]">
            <AppLink
              href={href}
              prefetchPolicy={priority ? "intent" : "auto"}
              className="hover:opacity-80"
            >
              {title}
            </AppLink>
          </h3>
          {categoryLabel ? (
            <p className="-mt-2 truncate text-[16px] leading-[30px] font-normal text-black/50">
              {categoryLabel}
            </p>
          ) : null}
          <div className="mt-1 flex flex-col gap-px">
            <p className="text-[22px] leading-none font-bold text-[#222]">
              {priceFormatted}
            </p>
            {onSale ? (
              <p className="text-[16px] leading-5 font-medium text-[rgba(34,34,34,0.44)] line-through">
                {compareAtFormatted}
              </p>
            ) : null}
          </div>
        </div>

        <div className="relative ml-2 flex w-[52px] shrink-0 flex-col items-end gap-3">
          <div data-node-id="22:242" className="flex items-center gap-1">
            <img src={STAR_SRC} alt="" width={18} height={18} className="size-[18px]" />
            <span className="text-[16px] font-semibold text-[#222]">
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
              className="mt-auto size-[50px] rounded-[40px] bg-brand-forest hover:bg-[#1e3f1f]"
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
