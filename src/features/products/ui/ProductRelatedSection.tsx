import { Stagger, StaggerItem } from "@/components/ui/RevealMotion";
import { ProductCard } from "@/features/products/ui/ProductCard";
import type { ProductCardLayout } from "@/features/products/ui/product-card-layout";
import { getRelatedProducts } from "@/features/products/queries";
import { getWishlistProductIds } from "@/features/wishlist/queries";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { createDisplayPriceFormatter } from "@/lib/money/display-price";
import type { Currency } from "@/lib/money/currency";

type ProductRelatedSectionProps = {
  locale: Locale;
  productId: string;
  currency: Currency;
  isSignedIn: boolean;
  dictionary: Dictionary;
};

type RelatedCardItem = {
  id: string;
  href: string;
  title: string;
  priceFormatted: string;
  compareAtFormatted: string | null;
  discountPercent: number | null;
  imageUrl: string | null;
  inStock: boolean;
  inWishlist: boolean;
  requiresCustomization: boolean;
};

type RelatedCardLabels = {
  discountOffLabel: string;
  wishlistLabel: string;
  addToCartLabel: string;
};

function RelatedProductCard({
  item,
  locale,
  isSignedIn,
  labels,
  layout,
  priority = false,
}: {
  item: RelatedCardItem;
  locale: Locale;
  isSignedIn: boolean;
  labels: RelatedCardLabels;
  layout?: ProductCardLayout;
  priority?: boolean;
}) {
  return (
    <ProductCard
      href={item.href}
      title={item.title}
      priceFormatted={item.priceFormatted}
      compareAtFormatted={item.compareAtFormatted}
      discountPercent={item.discountPercent}
      discountOffLabel={labels.discountOffLabel}
      imageUrl={item.imageUrl}
      inStock={item.inStock}
      locale={locale}
      productId={item.id}
      inWishlist={item.inWishlist}
      isSignedIn={isSignedIn}
      wishlistLabel={labels.wishlistLabel}
      addToCartLabel={labels.addToCartLabel}
      requiresCustomization={item.requiresCustomization}
      layout={layout}
      priority={priority}
    />
  );
}

/** Streams below the PDP fold — does not block gallery/purchase chrome. */
export async function ProductRelatedSection({
  locale,
  productId,
  currency,
  isSignedIn,
  dictionary,
}: ProductRelatedSectionProps) {
  const related = await getRelatedProducts(locale, productId);
  if (related.length === 0) {
    return null;
  }

  const [wishlistIds, formatPrice] = await Promise.all([
    getWishlistProductIds(related.map((item) => item.id)),
    createDisplayPriceFormatter(locale, currency),
  ]);

  const labels = dictionary.product;
  const cardLabels: RelatedCardLabels = {
    discountOffLabel: dictionary.home.discountOff,
    wishlistLabel: dictionary.nav.wishlist,
    addToCartLabel: labels.addToCart,
  };

  const items: RelatedCardItem[] = related.map((item) => {
    const price = formatPrice(item.priceAmount);
    const compareAt =
      item.compareAtAmount != null ? formatPrice(item.compareAtAmount) : null;

    return {
      id: item.id,
      href: `/${locale}/products/${item.translation.slug}`,
      title: item.translation.title,
      priceFormatted: price.formatted,
      compareAtFormatted: compareAt?.formatted ?? null,
      discountPercent: item.discountPercent,
      imageUrl: item.imageUrl,
      inStock: item.stockOnHand > 0,
      inWishlist: wishlistIds.has(item.id),
      requiresCustomization: item.hasCustomizationOptions,
    };
  });

  return (
    <section className="flex flex-col gap-7 pt-4 md:pt-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-big-fat-boii text-[clamp(28px,3.5vw,38px)] leading-[1.15] font-normal tracking-[0.5px] text-white uppercase">
          {labels.related}
        </h2>
        <p className="text-[15px] leading-6 text-white/60">
          {labels.relatedSubtitle}
        </p>
      </div>

      <RelatedMobileRail
        items={items}
        locale={locale}
        isSignedIn={isSignedIn}
        labels={cardLabels}
      />
      <RelatedDesktopGrid
        items={items}
        locale={locale}
        isSignedIn={isSignedIn}
        labels={cardLabels}
      />
    </section>
  );
}

function RelatedMobileRail({
  items,
  locale,
  isSignedIn,
  labels,
}: {
  items: readonly RelatedCardItem[];
  locale: Locale;
  isSignedIn: boolean;
  labels: RelatedCardLabels;
}) {
  return (
    <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 md:hidden">
      <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Stagger
          className="inline-flex gap-[13px] px-2.5 py-3"
          stagger={0.08}
          immediate
        >
          {items.map((item, index) => (
            <StaggerItem key={item.id} className="w-[214px] shrink-0">
              <RelatedProductCard
                item={item}
                locale={locale}
                isSignedIn={isSignedIn}
                labels={labels}
                layout="compact"
                priority={index < 2}
              />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </div>
  );
}

function RelatedDesktopGrid({
  items,
  locale,
  isSignedIn,
  labels,
}: {
  items: readonly RelatedCardItem[];
  locale: Locale;
  isSignedIn: boolean;
  labels: RelatedCardLabels;
}) {
  return (
    <div className="hidden justify-items-center gap-6 sm:grid-cols-2 md:grid lg:grid-cols-4 lg:justify-items-start lg:gap-[25px]">
      {items.map((item) => (
        <RelatedProductCard
          key={item.id}
          item={item}
          locale={locale}
          isSignedIn={isSignedIn}
          labels={labels}
        />
      ))}
    </div>
  );
}
