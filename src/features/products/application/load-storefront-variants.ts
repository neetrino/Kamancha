import "server-only";

import { asc, eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import {
  attributeValues,
  attributes,
  productAttributeLinks,
  productVariantValues,
  productVariants,
} from "@/db/schema";
import { attributeTitle } from "@/features/attributes/domain/label";
import { resolveProductPrices } from "@/features/promotions/application/resolve-product-prices";
import type {
  ProductVariantAxis,
  ProductVariantSet,
} from "@/features/products/types";
import type { Locale } from "@/lib/i18n/config";
import { mediaPublicUrl } from "@/lib/media/public-url";

/** Attribute chips and sellable combinations for a variable product PDP. */
export async function loadStorefrontVariants(
  productId: string,
  locale: Locale,
): Promise<ProductVariantSet | null> {
  const db = getDb();
  const links = await db
    .select({
      attributeId: productAttributeLinks.attributeId,
      translations: attributes.translations,
      sortOrder: productAttributeLinks.sortOrder,
    })
    .from(productAttributeLinks)
    .innerJoin(attributes, eq(productAttributeLinks.attributeId, attributes.id))
    .where(eq(productAttributeLinks.productId, productId))
    .orderBy(asc(productAttributeLinks.sortOrder));

  if (links.length === 0) return null;

  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, productId))
    .orderBy(asc(productVariants.createdAt));
  if (variants.length === 0) return null;

  const optionRows = await db
    .select({
      variantId: productVariantValues.variantId,
      attributeId: productVariantValues.attributeId,
      valueId: attributeValues.id,
      translations: attributeValues.translations,
      sortOrder: attributeValues.sortOrder,
    })
    .from(productVariantValues)
    .innerJoin(
      attributeValues,
      eq(productVariantValues.attributeValueId, attributeValues.id),
    )
    .innerJoin(
      productVariants,
      eq(productVariantValues.variantId, productVariants.id),
    )
    .where(eq(productVariants.productId, productId))
    .orderBy(asc(attributeValues.sortOrder));

  const prices = await resolveProductPrices(
    variants.map((variant) => ({
      id: productId,
      resultKey: variant.id,
      priceAmount: variant.priceAmount,
      compareAtAmount: null,
    })),
  );

  const usedValueIds = new Set(optionRows.map((row) => row.valueId));
  const axes: ProductVariantAxis[] = links.map((link) => ({
    id: link.attributeId,
    title: attributeTitle(link.translations, locale),
    values: uniqueValues(optionRows, link.attributeId, locale).filter((value) =>
      usedValueIds.has(value.id),
    ),
  }));

  return {
    axes,
    variants: variants.map((variant) => {
      const priced = prices.get(variant.id);
      return {
        id: variant.id,
        sku: variant.sku,
        listPriceAmount: variant.priceAmount,
        priceAmount: priced?.unitAmount ?? variant.priceAmount,
        compareAtAmount: priced?.compareAtAmount ?? null,
        stockOnHand: variant.stockOnHand,
        imageUrl: variant.imageObjectKey
          ? mediaPublicUrl(variant.imageObjectKey)
          : null,
        options: optionRows
          .filter((row) => row.variantId === variant.id)
          .map((row) => ({
            attributeId: row.attributeId,
            valueId: row.valueId,
            valueTitle: attributeTitle(row.translations, locale),
          })),
      };
    }),
  };
}

function uniqueValues(
  rows: {
    attributeId: string;
    valueId: string;
    translations: (typeof attributeValues.$inferSelect)["translations"];
    sortOrder: number;
  }[],
  attributeId: string,
  locale: Locale,
): { id: string; title: string }[] {
  const seen = new Set<string>();
  const values: { id: string; title: string }[] = [];
  for (const row of rows) {
    if (row.attributeId !== attributeId || seen.has(row.valueId)) continue;
    seen.add(row.valueId);
    values.push({
      id: row.valueId,
      title: attributeTitle(row.translations, locale),
    });
  }
  return values;
}
