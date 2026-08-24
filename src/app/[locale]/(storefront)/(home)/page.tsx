import { Suspense } from "react";
import { notFound } from "next/navigation";

import { listStorefrontCategories } from "@/features/categories/application/list-storefront-categories";
import { HomeCategories } from "@/features/home/ui/HomeCategories";
import { HomeFamilyDinnerPromo } from "@/features/home/ui/HomeFamilyDinnerPromo";
import { HomeFeaturedProducts } from "@/features/home/ui/HomeFeaturedProducts";
import { HomeMobileCategories } from "@/features/home/ui/HomeMobileCategories";
import { HomeMobileProductSection } from "@/features/home/ui/HomeMobileProductSection";
import { HomePageChrome } from "@/features/home/ui/HomePageChrome";
import { HomeOurStory } from "@/features/home/ui/HomeOurStory";
import {
  getDiscountedProducts,
  getFeaturedProducts,
  type CatalogProduct,
} from "@/features/products/queries";
import { getProductAverageRatings } from "@/features/reviews/application/queries";
import { getWishlistProductIds } from "@/features/wishlist/queries";
import { getCurrentUser } from "@/lib/auth/session";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary, type Dictionary } from "@/lib/i18n/get-dictionary";
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
      requiresCustomization: product.hasCustomizationOptions,
    };
  });
}

async function HomeBelowFold({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: Dictionary;
}) {
  const [categories, featuredProducts, discountedProducts, currency, user] =
    await Promise.all([
      listStorefrontCategories(locale),
      getFeaturedProducts(locale),
      getDiscountedProducts(locale),
      getSelectedCurrency(),
      getCurrentUser(),
    ]);

  const productIds = [
    ...new Set([
      ...featuredProducts.map((product) => product.id),
      ...discountedProducts.map((product) => product.id),
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
  const discountedCards = toProductCards(
    discountedProducts,
    locale,
    formatPrice,
    wishlistIds,
    ratings,
  );
  const categoryItems = categories.map((category) => ({
    id: category.id,
    title: category.title,
    href: `/${locale}/products?category=${encodeURIComponent(category.slug)}`,
    imageUrl: category.imageUrl,
    productCount: category.productCount,
  }));

  return (
    <>
      <div className="xl:hidden pb-8">
        <HomeMobileCategories
          productCountLabel={dictionary.home.categoryProductCount}
          emptyLabel={dictionary.home.emptyCategories}
          viewAllLabel={dictionary.home.viewAll}
          viewAllHref={`/${locale}/products`}
          previousLabel={dictionary.home.previousCategory}
          nextLabel={dictionary.home.nextCategory}
          categories={categoryItems}
        />
        <HomeMobileProductSection
          locale={locale}
          title={dictionary.home.featuredTitle}
          titleNodeId="196:304"
          viewAllLabel={dictionary.home.viewAll}
          viewAllHref={`/${locale}/products`}
          viewAllNodeId="196:308"
          emptyLabel={dictionary.home.emptyFeatured}
          wishlistLabel={dictionary.nav.wishlist}
          addToCartLabel={dictionary.product.addToCart}
          discountOffLabel={dictionary.home.discountOff}
          isSignedIn={Boolean(user)}
          products={featuredCards}
          overlayPlate
          tabletSheet="white"
        />
        <HomeMobileProductSection
          locale={locale}
          title={dictionary.home.discountedTitle}
          titleNodeId="196:358"
          viewAllLabel={dictionary.home.viewAll}
          viewAllHref={`/${locale}/products?onSale=true`}
          viewAllNodeId="196:360"
          emptyLabel={dictionary.home.emptyDiscounted}
          wishlistLabel={dictionary.nav.wishlist}
          addToCartLabel={dictionary.product.addToCart}
          discountOffLabel={dictionary.home.discountOff}
          isSignedIn={Boolean(user)}
          products={discountedCards}
          tabletSheet="forest"
        />
      </div>

      <div className="hidden xl:block">
      <HomeCategories
        title={dictionary.home.categoriesTitle}
        productCountLabel={dictionary.home.categoryProductCount}
        emptyLabel={dictionary.home.emptyCategories}
        categories={categoryItems}
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

      <HomeOurStory
        title={dictionary.home.ourStory.title}
        intro={dictionary.home.ourStory.intro}
        introSecond={dictionary.home.ourStory.introSecond}
        cardWhite={{
          title: dictionary.home.ourStory.cardTitle,
          body: dictionary.home.ourStory.cardBodyShort,
        }}
        cardGreen={{
          title: dictionary.home.ourStory.cardTitle,
          body: dictionary.home.ourStory.cardBodyShort,
        }}
        cardBlack={{
          title: dictionary.home.ourStory.cardTitle,
          body: dictionary.home.ourStory.cardBodyLong,
        }}
        cardTall={{
          title: dictionary.home.ourStory.cardTitle,
          body: dictionary.home.ourStory.cardBodyLong,
        }}
      />
      </div>
    </>
  );
}

/**
 * Home: background + navbar from layout; hero animates immediately;
 * catalog sections stream in after data.
 */
export default async function HomePage({ params }: HomePageProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale: Locale = rawLocale;
  const dictionary = getDictionary(locale);

  return (
    <HomePageChrome locale={locale} dictionary={dictionary}>
      <Suspense fallback={null}>
        <HomeBelowFold locale={locale} dictionary={dictionary} />
      </Suspense>
    </HomePageChrome>
  );
}
