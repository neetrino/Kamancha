"use client";

import Image from "next/image";
import { useState } from "react";

import { AppLink } from "@/components/ui/AppLink";
import { ProductPurchaseControls } from "@/features/products/ui/ProductPurchaseControls";
import { displayProductRating } from "@/features/products/ui/ProductReviewRating";
import type { ProductDetail } from "@/features/products/types";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import type { Currency } from "@/lib/money/currency";
import { staticAssetUrl } from "@/lib/media/static-asset-url";

const STAR_SRC = staticAssetUrl("/assets/brand/product/star.svg");

type ProductDetailInfoProps = {
  locale: Locale;
  product: ProductDetail;
  priceAmount: number;
  initialPriceFormatted: string;
  compareAtFormatted: string | null;
  currency: Currency;
  fxRate: string;
  ratingAverage: number | null;
  ratingCount: number;
  dictionary: Dictionary;
};

function ProductRating({
  displayRating,
  hasReviews,
  ratingCount,
  reviewCountLabel,
  className = "",
}: {
  displayRating: number;
  hasReviews: boolean;
  ratingCount: number;
  reviewCountLabel: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Image src={STAR_SRC} alt="" width={20} height={20} aria-hidden />
      <span className="text-lg font-semibold leading-[27px] text-white">
        {displayRating.toFixed(1)}
      </span>
      {hasReviews ? (
        <span className="text-sm leading-[21px] text-white/50">
          {reviewCountLabel.replace("{count}", String(ratingCount))}
        </span>
      ) : null}
    </div>
  );
}

/**
 * PDP title column: mobile price + rating under the title; purchase controls below.
 */
export function ProductDetailInfo({
  locale,
  product,
  priceAmount,
  initialPriceFormatted,
  compareAtFormatted,
  currency,
  fxRate,
  ratingAverage,
  ratingCount,
  dictionary,
}: ProductDetailInfoProps) {
  const labels = dictionary.product;
  const inStock = product.stockOnHand > 0;
  const primaryCategory = product.categories[0] ?? null;
  const hasReviews = ratingAverage != null && ratingCount > 0;
  const displayRating = displayProductRating(ratingAverage);
  const [livePriceFormatted, setLivePriceFormatted] = useState(
    initialPriceFormatted,
  );

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-[22px]">
      <nav
        aria-label={labels.breadcrumbLabel}
        className="flex flex-wrap items-center gap-3"
      >
        <AppLink
          href={`/${locale}`}
          prefetchPolicy="intent"
          className="text-sm leading-[21px] text-white/50 transition-colors hover:text-white/80"
        >
          {dictionary.nav.home}
        </AppLink>
        <span aria-hidden className="text-base text-white/30">
          /
        </span>
        <AppLink
          href={`/${locale}/products`}
          prefetchPolicy="intent"
          className="text-sm leading-[21px] text-white/50 transition-colors hover:text-white/80"
        >
          {labels.backToProducts}
        </AppLink>
        <span aria-hidden className="text-base text-white/30">
          /
        </span>
        <span
          aria-current="page"
          className="text-sm leading-[21px] font-semibold text-white"
        >
          {product.translation.title}
        </span>
      </nav>

      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <h1 className="font-big-fat-boii text-[clamp(32px,5vw,58px)] leading-[1.05] font-normal tracking-[0.5px] text-white uppercase">
          {product.translation.title}
        </h1>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-[40px] px-2.5 py-1 text-base leading-[27px] ${
            inStock
              ? "bg-[rgba(34,34,34,0.53)] text-white/90"
              : "bg-black/40 text-white/70"
          }`}
        >
          <span
            aria-hidden
            className={`size-2.5 rounded-full ${
              inStock
                ? "bg-[#84d086] shadow-[0_0_8px_rgba(132,208,134,0.8)]"
                : "bg-white/40"
            }`}
          />
          {inStock ? labels.inStockShort : labels.outOfStock}
        </span>
      </div>

      <div className="flex items-start justify-between gap-4 xl:hidden">
        <div className="flex min-w-0 flex-col items-start gap-px">
          <p className="whitespace-nowrap text-4xl leading-9 font-bold text-white">
            {livePriceFormatted}
          </p>
          {compareAtFormatted ? (
            <p className="whitespace-nowrap text-[19px] leading-4 text-white/45 line-through">
              {compareAtFormatted}
            </p>
          ) : null}
        </div>
        <ProductRating
          displayRating={displayRating}
          hasReviews={hasReviews}
          ratingCount={ratingCount}
          reviewCountLabel={labels.reviewCountParen}
          className="shrink-0 pt-1"
        />
      </div>

      <div
        className={`flex flex-wrap items-center gap-4 ${
          primaryCategory ? "" : "hidden xl:flex"
        }`}
      >
        {primaryCategory ? (
          <AppLink
            href={`/${locale}/products?category=${encodeURIComponent(primaryCategory.slug)}`}
            prefetchPolicy="intent"
            className="text-lg leading-[27px] text-white/60 transition-colors hover:text-white"
          >
            {primaryCategory.title}
          </AppLink>
        ) : null}

        <ProductRating
          displayRating={displayRating}
          hasReviews={hasReviews}
          ratingCount={ratingCount}
          reviewCountLabel={labels.reviewCountParen}
          className="hidden xl:flex"
        />
      </div>

      {product.translation.description ? (
        <p className="text-[15px] leading-6 font-medium whitespace-pre-wrap text-white">
          {product.translation.description}
        </p>
      ) : null}

      <div className="h-px w-full bg-white/10" aria-hidden />

      <ProductPurchaseControls
        productId={product.id}
        stockOnHand={product.stockOnHand}
        priceAmount={priceAmount}
        compareAtFormatted={compareAtFormatted}
        currency={currency}
        locale={locale}
        fxRate={fxRate}
        additions={product.additions ?? []}
        exceptions={product.exceptions ?? []}
        hidePriceOnMobile
        onPriceFormattedChange={setLivePriceFormatted}
        labels={{
          quantity: labels.quantity,
          decreaseQuantity: dictionary.cartDrawer.decreaseQuantity,
          increaseQuantity: dictionary.cartDrawer.increaseQuantity,
          addToCart: labels.addToCart,
          addToCartShort: labels.addToCartShort,
          adding: labels.adding,
          outOfStock: labels.outOfStock,
          added: labels.added,
          error: labels.addError,
          additions: labels.additions,
          exceptions: labels.exceptions,
        }}
      />
    </div>
  );
}
