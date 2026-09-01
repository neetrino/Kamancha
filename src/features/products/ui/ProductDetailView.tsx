import { SITE_HEADER_INNER, STOREFRONT_TABLET_INSET_X } from "@/components/layout/site-header-classes";
import { ProductDetailInfo } from "@/features/products/ui/ProductDetailInfo";
import { ProductGallery } from "@/features/products/ui/ProductGallery";
import type { ProductDetail } from "@/features/products/types";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import type { Currency } from "@/lib/money/currency";

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
  const inStock = product.stockOnHand > 0;

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
            priceAmount={priceAmount}
            initialPriceFormatted={initialPriceFormatted}
            compareAtFormatted={compareAtFormatted}
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
