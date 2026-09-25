"use client";

import { useState } from "react";

import { SITE_HEADER_INNER, STOREFRONT_TABLET_INSET_X } from "@/components/layout/site-header-classes";
import { defaultVariant } from "@/features/products/domain/variant-selection";
import { ProductDetailInfo } from "@/features/products/ui/ProductDetailInfo";
import { ProductGallery } from "@/features/products/ui/ProductGallery";
import type { ProductDetail, ProductVariantChoice } from "@/features/products/types";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { convertAmount } from "@/lib/money/convert";
import type { Currency } from "@/lib/money/currency";
import { defaultCurrency } from "@/lib/money/currency";
import { formatMoneyAmount } from "@/lib/money/format";

type ProductDetailViewProps = {
  locale: Locale;
  product: ProductDetail;
  priceAmount: number;
  initialPriceFormatted: string;
  compareAtFormatted: string | null;
  currency: Currency;
  fxRate: string;
  ratingAverage: number | null;
  ratingCount: number;
  isSignedIn: boolean;
  inWishlist: boolean;
  dictionary: Dictionary;
  jsonLd: Record<string, unknown>;
  relatedSlot: React.ReactNode;
  reviewsSlot: React.ReactNode;
};

export function ProductDetailView({
  locale,
  product,
  priceAmount,
  initialPriceFormatted,
  compareAtFormatted,
  currency,
  fxRate,
  ratingAverage,
  ratingCount,
  isSignedIn,
  inWishlist,
  dictionary,
  jsonLd,
  relatedSlot,
  reviewsSlot,
}: ProductDetailViewProps) {
  const labels = dictionary.product;
  const variants = product.variantSet?.variants ?? [];
  const initialVariant = defaultVariant(variants);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    initialVariant?.id ?? null,
  );
  const selected =
    variants.find((variant) => variant.id === selectedVariantId) ??
    initialVariant;
  const stockOnHand = selected?.stockOnHand ?? product.stockOnHand;
  const priceAmountActive = selected?.priceAmount ?? priceAmount;
  const inStock = stockOnHand > 0;
  const compareAtActive = formatCompareAt(
    selected,
    compareAtFormatted,
    currency,
    locale,
    fxRate,
  );

  return (
    <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2">
      <article
        className={`${SITE_HEADER_INNER} ${STOREFRONT_TABLET_INSET_X} flex flex-col gap-12 md:gap-16`}
      >
        <div className="flex flex-col gap-[60px] xl:flex-row xl:items-start xl:justify-between">
          <ProductGallery
            images={product.images}
            title={product.translation.title}
            discountPercent={product.discountPercent}
            discountOffLabel={dictionary.home.discountOff}
            highlightUrl={selected?.imageUrl ?? null}
            inStock={inStock}
            outOfStockLabel={labels.outOfStock}
            zoomLabel={labels.zoomImage}
            closeZoomLabel={labels.closeZoom}
            previousImageLabel={labels.previousImage}
            nextImageLabel={labels.nextImage}
            locale={locale}
            productId={product.id}
            inWishlist={inWishlist}
            isSignedIn={isSignedIn}
            wishlistLabel={dictionary.nav.wishlist}
          />

          <ProductDetailInfo
            locale={locale}
            product={product}
            stockOnHand={stockOnHand}
            selectedVariantId={selected?.id ?? null}
            onSelectVariant={setSelectedVariantId}
            priceAmount={priceAmountActive}
            initialPriceFormatted={
              selected
                ? formatMoneyAmount(
                    Number(
                      convertAmount(
                        priceAmountActive,
                        fxRate,
                        defaultCurrency,
                        currency,
                      ).amount,
                    ),
                    currency,
                    locale,
                  )
                : initialPriceFormatted
            }
            compareAtFormatted={compareAtActive}
            currency={currency}
            fxRate={fxRate}
            ratingAverage={ratingAverage}
            ratingCount={ratingCount}
            dictionary={dictionary}
          />
        </div>

        {relatedSlot}
        {reviewsSlot}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </article>
    </div>
  );
}

function formatCompareAt(
  selected: ProductVariantChoice | null,
  fallback: string | null,
  currency: Currency,
  locale: string,
  fxRate: string,
): string | null {
  if (!selected) return fallback;
  if (selected.compareAtAmount == null) return null;
  const converted = convertAmount(
    selected.compareAtAmount,
    fxRate,
    defaultCurrency,
    currency,
  );
  return formatMoneyAmount(Number(converted.amount), currency, locale);
}
