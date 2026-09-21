import { notFound } from "next/navigation";

import { Reveal } from "@/components/ui/RevealMotion";
import { listStorefrontCategories } from "@/features/categories/application/list-storefront-categories";
import { getCatalogPriceBounds } from "@/features/products/application/catalog-price-bounds";
import { parseCatalogSearchParams } from "@/features/products/application/catalog-search-params";
import { listCatalogProducts } from "@/features/products/application/list-catalog-products";
import type { CatalogGridProduct } from "@/features/products/application/load-more-catalog-products-action";
import type { CatalogFilters } from "@/features/products/schemas/catalog-list";
import { CatalogControls } from "@/features/products/ui/CatalogControls";
import { CatalogPageHeader } from "@/features/products/ui/CatalogPageHeader";
import { CatalogProductGrid } from "@/features/products/ui/CatalogProductGrid";
import { MobileCatalogSearch } from "@/features/products/ui/MobileCatalogSearch";
import { getProductAverageRatings } from "@/features/reviews/application/queries";
import { getWishlistProductIds } from "@/features/wishlist/queries";
import { getCurrentUser } from "@/lib/auth/session";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  createDisplayPriceFormatter,
  getSelectedCurrency,
} from "@/lib/money/display-price";

type ProductsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function catalogGridMotionKey(filters: CatalogFilters): string {
  return [
    filters.category ?? "all",
    filters.sort,
    filters.q ?? "",
    filters.minPrice ?? "",
    filters.maxPrice ?? "",
    filters.onSale ? "sale" : "",
    filters.newArrivals ? "new" : "",
    filters.inStock ? "stock" : "",
  ].join(":");
}

export default async function ProductsPage({
  params,
  searchParams,
}: ProductsPageProps) {
  const { locale: rawLocale } = await params;
  const raw = await searchParams;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const parsed = parseCatalogSearchParams(raw);
  /** Load-more UX always starts from the first batch. */
  const filters: CatalogFilters = { ...parsed, page: 1 };
  const dictionary = getDictionary(rawLocale);
  const catalogCopy = dictionary.catalog;

  const currency = await getSelectedCurrency();
  const [user, categoryOptions, priceBounds] = await Promise.all([
    getCurrentUser(),
    listStorefrontCategories(rawLocale),
    getCatalogPriceBounds(currency),
  ]);

  const categories = categoryOptions.map((category) => ({
    slug: category.slug,
    title: category.title,
    productCount: category.productCount,
  }));

  const allProductsCount = categories.reduce(
    (sum, category) => sum + category.productCount,
    0,
  );

  const catalog = await listCatalogProducts(rawLocale, filters, currency);
  const { products } = catalog;
  const productIds = products.map((product) => product.id);
  const [wishlistIds, formatPrice, ratings] = await Promise.all([
    getWishlistProductIds(productIds),
    createDisplayPriceFormatter(rawLocale, currency),
    getProductAverageRatings(productIds),
  ]);

  const initialProducts: CatalogGridProduct[] = products.map((product) => {
    const price = formatPrice(product.priceAmount);
    const compareAt =
      product.compareAtAmount != null
        ? formatPrice(product.compareAtAmount)
        : null;

    return {
      id: product.id,
      href: `/${rawLocale}/products/${product.translation.slug}`,
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

  return (
    <section className="catalog-page flex flex-col gap-3 xl:gap-6">
      <MobileCatalogSearch
        heading={catalogCopy.heading}
        locale={rawLocale}
        filters={filters}
        label={catalogCopy.searchLabel}
        placeholder={catalogCopy.searchPlaceholder}
        clearLabel={catalogCopy.clearSearch}
      />
      <div className="hidden xl:block">
        <CatalogPageHeader heading={catalogCopy.heading} />
      </div>

      <CatalogControls
        locale={rawLocale}
        currency={currency}
        filters={filters}
        categories={categories}
        allProductsCount={allProductsCount}
        priceBounds={priceBounds}
        labels={{
          filters: catalogCopy.filters,
          openFilters: catalogCopy.openFilters,
          clearFilters: catalogCopy.clearFilters,
          categoryLabel: catalogCopy.categoryLabel,
          allCategories: catalogCopy.allCategories,
          priceLabel: catalogCopy.priceLabel,
          onSaleOnly: catalogCopy.onSaleOnly,
          newArrivalsOnly: catalogCopy.newArrivalsOnly,
          sortLabel: catalogCopy.sortLabel,
          sortNewest: catalogCopy.sortNewest,
          sortPriceAsc: catalogCopy.sortPriceAsc,
          sortPriceDesc: catalogCopy.sortPriceDesc,
          sortPopular: catalogCopy.sortPopular,
        }}
      >
        {initialProducts.length === 0 ? (
          <Reveal immediate y={16}>
            <div className="rounded-[37px] border border-dashed border-white/20 bg-white/5 px-6 py-16 text-center">
              <h2 className="text-lg font-semibold text-white">
                {catalogCopy.emptyTitle}
              </h2>
              <p className="mt-2 text-sm text-white/60">
                {catalogCopy.emptyDescription}
              </p>
            </div>
          </Reveal>
        ) : (
          <CatalogProductGrid
            key={catalogGridMotionKey(filters)}
            locale={rawLocale}
            currency={currency}
            filters={filters}
            initialProducts={initialProducts}
            initialPage={catalog.page}
            total={catalog.total}
            pageSize={catalog.pageSize}
            isSignedIn={Boolean(user)}
            wishlistLabel={dictionary.nav.wishlist}
            addToCartLabel={dictionary.product.addToCart}
            discountOffLabel={dictionary.home.discountOff}
            loadMoreLabel={catalogCopy.loadMore}
            loadingMoreLabel={catalogCopy.loadingMore}
          />
        )}
      </CatalogControls>
    </section>
  );
}
