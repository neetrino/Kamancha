"use server";

import { listCatalogProducts } from "@/features/products/application/list-catalog-products";
import {
  catalogFiltersSchema,
  type CatalogFilters,
} from "@/features/products/schemas/catalog-list";
import { getProductAverageRatings } from "@/features/reviews/application/queries";
import { getWishlistProductIds } from "@/features/wishlist/queries";
import { getCurrentUser } from "@/lib/auth/session";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { isCurrency, type Currency } from "@/lib/money/currency";
import { createDisplayPriceFormatter } from "@/lib/money/display-price";

export type CatalogGridProduct = {
  id: string;
  href: string;
  title: string;
  priceFormatted: string;
  compareAtFormatted: string | null;
  discountPercent: number | null;
  rating: number | null;
  imageUrl: string | null;
  inStock: boolean;
  inWishlist: boolean;
  requiresCustomization: boolean;
};

export type LoadMoreCatalogResult = {
  products: CatalogGridProduct[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
};

/**
 * Next catalog page for storefront “see more” (same pageSize, appended in UI).
 */
export async function loadMoreCatalogProductsAction(
  locale: Locale,
  currency: Currency,
  filtersInput: CatalogFilters,
  page: number,
): Promise<LoadMoreCatalogResult> {
  if (!isLocale(locale)) {
    throw new Error("Invalid locale.");
  }
  if (!isCurrency(currency)) {
    throw new Error("Invalid currency.");
  }
  if (!Number.isInteger(page) || page < 1) {
    throw new Error("Invalid page.");
  }

  const filters = catalogFiltersSchema.parse({
    ...filtersInput,
    page,
  });

  const [catalog, formatPrice, user] = await Promise.all([
    listCatalogProducts(locale, filters, currency),
    createDisplayPriceFormatter(locale, currency),
    getCurrentUser(),
  ]);

  const productIds = catalog.products.map((product) => product.id);
  const [wishlistIds, ratings] = await Promise.all([
    getWishlistProductIds(productIds),
    getProductAverageRatings(productIds),
  ]);

  const products: CatalogGridProduct[] = catalog.products.map((product) => {
    const compareAt =
      product.compareAtAmount != null
        ? formatPrice(product.compareAtAmount)
        : null;

    return {
      id: product.id,
      href: `/${locale}/products/${product.translation.slug}`,
      title: product.translation.title,
      priceFormatted: formatPrice(product.priceAmount).formatted,
      compareAtFormatted: compareAt?.formatted ?? null,
      discountPercent: product.discountPercent,
      rating: ratings.get(product.id) ?? null,
      imageUrl: product.imageUrl,
      inStock: product.stockOnHand > 0,
      inWishlist: Boolean(user) && wishlistIds.has(product.id),
      requiresCustomization: product.hasCustomizationOptions,
    };
  });

  const loadedThrough = (catalog.page - 1) * catalog.pageSize + products.length;

  return {
    products,
    page: catalog.page,
    pageSize: catalog.pageSize,
    total: catalog.total,
    hasMore: loadedThrough < catalog.total,
  };
}
