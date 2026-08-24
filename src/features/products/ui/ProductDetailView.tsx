import Image from "next/image";

import { AppLink } from "@/components/ui/AppLink";
import { SITE_HEADER_INNER, STOREFRONT_TABLET_INSET_X } from "@/components/layout/site-header-classes";
import { ProductGallery } from "@/features/products/ui/ProductGallery";
import { ProductPurchaseControls } from "@/features/products/ui/ProductPurchaseControls";
import type { ProductDetail } from "@/features/products/types";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

const STAR_SRC = "/assets/brand/product/star.svg";

type ProductDetailViewProps = {
  locale: Locale;
  product: ProductDetail;
  priceFormatted: string;
  compareAtFormatted: string | null;
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
  priceFormatted,
  compareAtFormatted,
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
  const primaryCategory = product.categories[0] ?? null;

  return (
    <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2">
      <article className={`${SITE_HEADER_INNER} ${STOREFRONT_TABLET_INSET_X} flex flex-col gap-12 md:gap-16`}>
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

          <div className="flex flex-wrap items-center gap-4">
            {primaryCategory ? (
              <AppLink
                href={`/${locale}/products?category=${encodeURIComponent(primaryCategory.slug)}`}
                prefetchPolicy="intent"
                className="text-lg leading-[27px] text-white/60 transition-colors hover:text-white"
              >
                {primaryCategory.title}
              </AppLink>
            ) : null}

            {ratingAverage != null && ratingCount > 0 ? (
              <div className="flex items-center gap-1.5">
                <Image
                  src={STAR_SRC}
                  alt=""
                  width={20}
                  height={20}
                  aria-hidden
                />
                <span className="text-lg font-semibold leading-[27px] text-white">
                  {ratingAverage.toFixed(1)}
                </span>
                <span className="text-sm leading-[21px] text-white/50">
                  {labels.reviewCountParen.replace(
                    "{count}",
                    String(ratingCount),
                  )}
                </span>
              </div>
            ) : null}
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
            priceFormatted={priceFormatted}
            compareAtFormatted={compareAtFormatted}
            additions={product.additions ?? []}
            exceptions={product.exceptions ?? []}
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
