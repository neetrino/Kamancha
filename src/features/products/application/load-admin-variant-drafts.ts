import "server-only";

import { asc, eq, inArray } from "drizzle-orm";

import { getDb } from "@/db/client";
import {
  productAttributeLinks,
  productVariantValues,
  productVariants,
} from "@/db/schema";
import { mediaPublicUrl } from "@/lib/media/public-url";

export type AdminVariantDraft = {
  id: string;
  sku: string;
  priceAmount: number;
  stockOnHand: number;
  valueIds: string[];
  imageUrl: string | null;
};

export type AdminProductVariants = {
  attributeIds: string[];
  variants: AdminVariantDraft[];
};

/** Variant editor state for the current admin product page. */
export async function loadAdminVariantDrafts(
  productIds: string[],
): Promise<Map<string, AdminProductVariants>> {
  const map = new Map<string, AdminProductVariants>();
  if (productIds.length === 0) return map;

  const db = getDb();
  const [links, variants, optionRows] = await Promise.all([
    db
      .select()
      .from(productAttributeLinks)
      .where(inArray(productAttributeLinks.productId, productIds))
      .orderBy(asc(productAttributeLinks.sortOrder)),
    db
      .select()
      .from(productVariants)
      .where(inArray(productVariants.productId, productIds))
      .orderBy(asc(productVariants.createdAt)),
    db
      .select({
        variantId: productVariantValues.variantId,
        valueId: productVariantValues.attributeValueId,
      })
      .from(productVariantValues)
      .innerJoin(
        productVariants,
        eq(productVariantValues.variantId, productVariants.id),
      )
      .where(inArray(productVariants.productId, productIds)),
  ]);

  const valuesByVariant = new Map<string, string[]>();
  for (const row of optionRows) {
    const list = valuesByVariant.get(row.variantId) ?? [];
    list.push(row.valueId);
    valuesByVariant.set(row.variantId, list);
  }

  for (const productId of productIds) {
    map.set(productId, {
      attributeIds: links
        .filter((link) => link.productId === productId)
        .map((link) => link.attributeId),
      variants: variants
        .filter((variant) => variant.productId === productId)
        .map((variant) => ({
          id: variant.id,
          sku: variant.sku,
          priceAmount: variant.priceAmount,
          stockOnHand: variant.stockOnHand,
          valueIds: valuesByVariant.get(variant.id) ?? [],
          imageUrl: variant.imageObjectKey
            ? mediaPublicUrl(variant.imageObjectKey)
            : null,
        })),
    });
  }

  return map;
}
