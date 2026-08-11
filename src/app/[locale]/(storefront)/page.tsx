import { notFound } from "next/navigation";

import { listStorefrontCategories } from "@/features/categories/application/list-storefront-categories";
import { HomeAboutTeaser } from "@/features/home/ui/HomeAboutTeaser";
import { HomeCategories } from "@/features/home/ui/HomeCategories";
import { HomeFamilyDinnerPromo } from "@/features/home/ui/HomeFamilyDinnerPromo";
import { HomeFeaturedProducts } from "@/features/home/ui/HomeFeaturedProducts";
import {
  HOME_FEATURE_ICONS,
  HomeFeatures,
} from "@/features/home/ui/HomeFeatures";
import { HomeHero } from "@/features/home/ui/HomeHero";
import { HomeOrnamentStrip } from "@/features/home/ui/HomeOrnamentStrip";
import {
  getFeaturedProducts,
  getOfferProducts,
  type CatalogProduct,
} from "@/features/products/queries";
import { getProductAverageRatings } from "@/features/reviews/application/queries";
import { getWishlistProductIds } from "@/features/wishlist/queries";
import { getCurrentUser } from "@/lib/auth/session";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  createDisplayPriceFormatter,
  getSelectedCurrency,
} from "@/lib/money/display-price";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

type DisplayPriceFormatter = Awaited<
  ReturnType<typeof createDisplayPriceFormatter>
>;

function toProductCards(
  products: CatalogProduct[],
  locale: Locale,
  formatPrice: DisplayPriceFormatter,
  wishlistIds: Set<string>,
  ratings: Map<string, number>,
) {
  return products.map((product) => {
    const price = formatPrice(product.priceAmount);
    const compareAt =
      product.compareAtAmount != null
        ? formatPrice(product.compareAtAmount)
        : null;

    return {
      id: product.id,
      href: `/${locale}/products/${product.translation.slug}`,
      title: product.translation.title,
      priceFormatted: price.formatted,
      compareAtFormatted: compareAt?.formatted ?? null,
      discountPercent: product.discountPercent,
      rating: ratings.get(product.id) ?? null,
      imageUrl: product.imageUrl,
      inStock: product.stockOnHand > 0,
      inWishlist: wishlistIds.has(product.id),
    };
  });
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale: Locale = rawLocale;
  const dictionary = getDictionary(locale);
  const [categories, featuredProducts, offerProducts, currency, user] =
    await Promise.all([
      listStorefrontCategories(locale),
      getFeaturedProducts(locale),
      getOfferProducts(locale),
      getSelectedCurrency(),
      getCurrentUser(),
    ]);

  const productIds = [
    ...new Set([
      ...featuredProducts.map((product) => product.id),
      ...offerProducts.map((product) => product.id),
    ]),
  ];

  const [wishlistIds, formatPrice, ratings] = await Promise.all([
    getWishlistProductIds(productIds),
    createDisplayPriceFormatter(locale, currency),
    getProductAverageRatings(productIds),
  ]);

  const featuredCards = toProductCards(
    featuredProducts,
    locale,
    formatPrice,
    wishlistIds,
    ratings,
  );
  const offerCards = toProductCards(
    offerProducts,
    locale,
    formatPrice,
    wishlistIds,
    ratings,
  );

  return (
    <div className="-mx-4 -my-10 sm:-mx-6 lg:-mx-8">
      <HomeHero
        brandName={dictionary.brand}
        ctaLabel={dictionary.nav.products}
        ctaHref={`/${locale}/products`}
      />

      <HomeOrnamentStrip />

      <HomeCategories
        title={dictionary.home.categoriesTitle}
        productCountLabel={dictionary.home.categoryProductCount}
        emptyLabel={dictionary.home.emptyCategories}
        categories={categories.map((category) => ({
          id: category.id,
          title: category.title,
          href: `/${locale}/products?category=${encodeURIComponent(category.slug)}`,
          imageUrl: category.imageUrl,
          productCount: category.productCount,
        }))}
      />

      <HomeFeaturedProducts
        locale={locale}
        title={dictionary.home.featuredTitle}
        viewAllLabel={dictionary.home.viewAll}
        viewAllHref={`/${locale}/products`}
        emptyLabel={dictionary.home.emptyFeatured}
        wishlistLabel={dictionary.nav.wishlist}
        addToCartLabel={dictionary.product.addToCart}
        discountOffLabel={dictionary.home.discountOff}
        isSignedIn={Boolean(user)}
        products={featuredCards}
      />

      <HomeFamilyDinnerPromo
        headlineBefore={dictionary.home.familyDinner.headlineBefore}
        headlineAccent={dictionary.home.familyDinner.headlineAccent}
        headlineAfter={dictionary.home.familyDinner.headlineAfter}
        subtitle={dictionary.home.familyDinner.subtitle}
        subtitleMuted={dictionary.home.familyDinner.subtitleMuted}
        priceLabel={dictionary.home.familyDinner.price}
        ctaLabel={dictionary.home.viewAll}
        ctaHref={`/${locale}/products`}
      />

      <HomeFeaturedProducts
        locale={locale}
        title={dictionary.home.offersTitle}
        viewAllLabel={dictionary.home.viewAll}
        viewAllHref={`/${locale}/products`}
        emptyLabel={dictionary.home.emptyOffers}
        wishlistLabel={dictionary.nav.wishlist}
        addToCartLabel={dictionary.product.addToCart}
        discountOffLabel={dictionary.home.discountOff}
        isSignedIn={Boolean(user)}
        products={offerCards}
      />

      <HomeFeatures
        title={dictionary.home.whyUsTitle}
        items={[
          {
            title: dictionary.home.features.deliveryTitle,
            description: dictionary.home.features.deliveryDescription,
            icon: HOME_FEATURE_ICONS.delivery,
          },
          {
            title: dictionary.home.features.qualityTitle,
            description: dictionary.home.features.qualityDescription,
            icon: HOME_FEATURE_ICONS.quality,
          },
          {
            title: dictionary.home.features.returnTitle,
            description: dictionary.home.features.returnDescription,
            icon: HOME_FEATURE_ICONS.return,
          },
          {
            title: dictionary.home.features.supportTitle,
            description: dictionary.home.features.supportDescription,
            icon: HOME_FEATURE_ICONS.support,
          },
        ]}
      />

      <HomeAboutTeaser
        eyebrow={dictionary.home.aboutEyebrow}
        title={dictionary.home.aboutTitle}
        description={dictionary.home.aboutDescription}
        ctaLabel={dictionary.home.aboutCta}
        ctaHref={`/${locale}/about`}
      />
    </div>
  );
}
