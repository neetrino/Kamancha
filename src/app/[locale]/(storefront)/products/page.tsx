import { notFound } from "next/navigation";

import { AppLink } from "@/components/ui/AppLink";
import { listStorefrontCategories } from "@/features/categories/application/list-storefront-categories";
import { getCatalogPriceBounds } from "@/features/products/application/catalog-price-bounds";
import {
  catalogHref,
  parseCatalogSearchParams,
} from "@/features/products/application/catalog-search-params";
import { listCatalogProducts } from "@/features/products/application/list-catalog-products";
import { CatalogControls } from "@/features/products/ui/CatalogControls";
import { CatalogPageHeader } from "@/features/products/ui/CatalogPageHeader";
import { ProductCard } from "@/features/products/ui/ProductCard";
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

export default async function ProductsPage({
  params,
  searchParams,
}: ProductsPageProps) {
  const { locale: rawLocale } = await params;
  const raw = await searchParams;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  let filters = parseCatalogSearchParams(raw);
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

  let catalog = await listCatalogProducts(rawLocale, filters, currency);
  const totalPages = Math.max(1, Math.ceil(catalog.total / catalog.pageSize));

  if (filters.page > totalPages) {
    filters = { ...filters, page: totalPages };
    catalog = await listCatalogProducts(rawLocale, filters, currency);
  }

  const { products } = catalog;
  const [wishlistIds, formatPrice] = await Promise.all([
    getWishlistProductIds(products.map((product) => product.id)),
    createDisplayPriceFormatter(rawLocale, currency),
  ]);

  const priced = products.map((product) => {
    const price = formatPrice(product.priceAmount);
    const compareAt =
      product.compareAtAmount != null
        ? formatPrice(product.compareAtAmount)
        : null;

    return {
      product,
      price,
      compareAtFormatted: compareAt?.formatted ?? null,
    };
  });

  const pageHref = (targetPage: number) =>
    catalogHref(rawLocale, filters, { page: targetPage });

  const resultsLabel =
    catalog.total === 1
      ? catalogCopy.resultsCountOne
      : catalogCopy.resultsCount.replace("{count}", String(catalog.total));

  return (
    <section className="flex flex-col gap-6">
      <CatalogPageHeader
        heading={catalogCopy.heading}
        resultsLabel={resultsLabel}
      />

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
        {priced.length === 0 ? (
          <div className="rounded-[37px] border border-dashed border-white/20 bg-white/5 px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-white">
              {catalogCopy.emptyTitle}
            </h2>
            <p className="mt-2 text-sm text-white/60">
              {catalogCopy.emptyDescription}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {priced.map(({ product, price, compareAtFormatted }, index) => (
              <ProductCard
                key={product.id}
                href={`/${rawLocale}/products/${product.translation.slug}`}
                title={product.translation.title}
                priceFormatted={price.formatted}
                compareAtFormatted={compareAtFormatted}
                discountPercent={product.discountPercent}
                discountOffLabel={dictionary.home.discountOff}
                imageUrl={product.imageUrl}
                inStock={product.stockOnHand > 0}
                priority={index < 4}
                locale={rawLocale}
                productId={product.id}
                inWishlist={wishlistIds.has(product.id)}
                isSignedIn={Boolean(user)}
                wishlistLabel={dictionary.nav.wishlist}
                addToCartLabel={dictionary.product.addToCart}
                className="w-full max-w-[300px]"
              />
            ))}
          </div>
        )}

        {totalPages > 1 ? (
          <nav
            aria-label={catalogCopy.paginationLabel}
            className="mt-8 flex items-center justify-center gap-4"
          >
            {filters.page > 1 ? (
              <AppLink
                href={pageHref(filters.page - 1)}
                prefetchPolicy="intent"
                scroll={false}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
              >
                {catalogCopy.previousPage}
              </AppLink>
            ) : (
              <span className="rounded-lg border border-transparent px-4 py-2 text-sm text-white/30">
                {catalogCopy.previousPage}
              </span>
            )}
            <span className="text-sm text-white/60">
              {catalogCopy.pageStatus
                .replace("{page}", String(filters.page))
                .replace("{total}", String(totalPages))}
            </span>
            {filters.page < totalPages ? (
              <AppLink
                href={pageHref(filters.page + 1)}
                prefetchPolicy="intent"
                scroll={false}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
              >
                {catalogCopy.nextPage}
              </AppLink>
            ) : (
              <span className="rounded-lg border border-transparent px-4 py-2 text-sm text-white/30">
                {catalogCopy.nextPage}
              </span>
            )}
          </nav>
        ) : null}
      </CatalogControls>
    </section>
  );
}
