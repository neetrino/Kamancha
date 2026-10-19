import { listStorefrontCategories } from '@/features/categories/application/list-storefront-categories';
import { HomeCategories } from '@/features/home/ui/HomeCategories';
import { HomeFeaturedProducts } from '@/features/home/ui/HomeFeaturedProducts';
import { HomeMobileCategories } from '@/features/home/ui/HomeMobileCategories';
import { HomeMobileProductSection } from '@/features/home/ui/HomeMobileProductSection';
import {
  getDiscountedProducts,
  getFeaturedProducts,
  type CatalogProduct,
} from '@/features/products/queries';
import { getProductAverageRatings } from '@/features/reviews/application/queries';
import { getWishlistProductIds } from '@/features/wishlist/queries';
import { getCurrentUser } from '@/lib/auth/session';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import { createDisplayPriceFormatter, getSelectedCurrency } from '@/lib/money/display-price';

type DisplayPriceFormatter = Awaited<ReturnType<typeof createDisplayPriceFormatter>>;

function toProductCards(
  products: CatalogProduct[],
  locale: Locale,
  formatPrice: DisplayPriceFormatter,
  wishlistIds: Set<string>,
  ratings: Map<string, number>,
) {
  return products.map((product) => {
    const price = formatPrice(product.priceAmount);
    const compareAt = product.compareAtAmount != null ? formatPrice(product.compareAtAmount) : null;

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

/**
 * Existing restaurant delivery storefront (former `/` home).
 */
export async function HomeStorefront({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: Dictionary;
}) {
  const [categories, featuredProducts, discountedProducts, currency, user] = await Promise.all([
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

  const featuredCards = toProductCards(featuredProducts, locale, formatPrice, wishlistIds, ratings);
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
      <div className="xl:hidden">
        <HomeMobileCategories
          productCountLabel={dictionary.home.categoryProductCount}
          emptyLabel={dictionary.home.emptyCategories}
          viewAllLabel={dictionary.home.viewAll}
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
          roundTabletBottom={discountedCards.length === 0}
        />
        {discountedCards.length > 0 ? (
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
        ) : null}
      </div>

      <div className="hidden xl:block">
        <HomeCategories
          title={dictionary.home.categoriesTitle}
          productCountLabel={dictionary.home.categoryProductCount}
          emptyLabel={dictionary.home.emptyCategories}
          previousLabel={dictionary.home.previousCategory}
          nextLabel={dictionary.home.nextCategory}
          categories={categoryItems}
        />

        <HomeFeaturedProducts
          locale={locale}
          title={dictionary.home.featuredTitle}
          viewAllLabel={dictionary.home.viewAll}
          viewAllHref={`/${locale}/products`}
          emptyLabel={dictionary.home.emptyFeatured}
          previousLabel={dictionary.home.previousFeatured}
          nextLabel={dictionary.home.nextFeatured}
          wishlistLabel={dictionary.nav.wishlist}
          addToCartLabel={dictionary.product.addToCart}
          discountOffLabel={dictionary.home.discountOff}
          isSignedIn={Boolean(user)}
          products={featuredCards}
        />
      </div>
    </>
  );
}
