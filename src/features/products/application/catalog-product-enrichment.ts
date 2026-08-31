import "server-only";

import { and, eq, inArray } from "drizzle-orm";

import { getDb } from "@/db/client";
import { productModifierLinks, productModifiers, products } from "@/db/schema";
import { loadPrimaryProductImageUrls } from "@/features/products/application/product-primary-images";
import { resolveProductPrices } from "@/features/promotions/application/resolve-product-prices";
import type { CatalogProduct } from "@/features/products/types";
import type { Locale } from "@/lib/i18n/config";

function toCatalogProduct(
  product: typeof products.$inferSelect,
  locale: Locale,
  imageUrl: string | null = null,
): Omit<
  CatalogProduct,
  | "priceAmount"
  | "compareAtAmount"
  | "discountPercent"
  | "listPriceAmount"
  | "hasCustomizationOptions"
> | null {
  const translation = product.translations[locale] ?? product.translations.hy;
  if (!translation) {
    return null;
  }

  return {
    id: product.id,
    sku: product.sku,
    stockOnHand: product.stockOnHand,
    translation,
    imageUrl,
  };
}

async function loadProductsWithCustomizationOptions(
  productIds: string[],
): Promise<Set<string>> {
  if (productIds.length === 0) {
    return new Set();
  }

  const rows = await getDb()
    .selectDistinct({ productId: productModifierLinks.productId })
    .from(productModifierLinks)
    .innerJoin(
      productModifiers,
      eq(productModifierLinks.modifierId, productModifiers.id),
    )
    .where(
      and(
        inArray(productModifierLinks.productId, productIds),
        eq(productModifiers.isActive, true),
      ),
    );

  return new Set(rows.map((row) => row.productId));
}

/** Attaches primary image URLs and resolved sale prices to product rows. */
export async function enrichCatalogProducts(
  rows: Array<typeof products.$inferSelect>,
  locale: Locale,
): Promise<CatalogProduct[]> {
  const productIds = rows.map((row) => row.id);
  const [images, prices, customizable] = await Promise.all([
    loadPrimaryProductImageUrls(productIds),
    resolveProductPrices(
      rows.map((row) => ({
        id: row.id,
        priceAmount: row.priceAmount,
        compareAtAmount: row.compareAtAmount,
      })),
    ),
    loadProductsWithCustomizationOptions(productIds),
  ]);

  return rows
    .map((product) => {
      const base = toCatalogProduct(
        product,
        locale,
        images.get(product.id) ?? null,
      );
      if (!base) return null;

      const resolved = prices.get(product.id);
      return {
        ...base,
        listPriceAmount: resolved?.listAmount ?? product.priceAmount,
        priceAmount: resolved?.unitAmount ?? product.priceAmount,
        compareAtAmount: resolved?.compareAtAmount ?? null,
        discountPercent: resolved?.discountPercent ?? null,
        hasCustomizationOptions: customizable.has(product.id),
      } satisfies CatalogProduct;
    })
    .filter((product): product is CatalogProduct => product !== null);
}
