import "server-only";

import { asc, eq, inArray } from "drizzle-orm";

import { getDb } from "@/db/client";
import {
  attributeValues,
  attributes,
  productVariantValues,
  productVariants,
} from "@/db/schema";
import { attributeTitle } from "@/features/attributes/domain/label";
import { formatVariantLabel } from "@/features/products/domain/variant-selection";
import { locales, type Locale } from "@/lib/i18n/config";

export type VariantSnapshot = {
  id: string;
  productId: string;
  sku: string;
  priceAmount: number;
  stockOnHand: number;
  imageObjectKey: string | null;
  labels: Partial<Record<Locale, string>>;
};

/** Price, stock, image, and localized option labels for cart and checkout lines. */
export async function loadVariantSnapshots(
  variantIds: string[],
): Promise<Map<string, VariantSnapshot>> {
  const map = new Map<string, VariantSnapshot>();
  const ids = [...new Set(variantIds.filter(Boolean))];
  if (ids.length === 0) return map;

  const db = getDb();
  const [variants, optionRows] = await Promise.all([
    db.select().from(productVariants).where(inArray(productVariants.id, ids)),
    db
      .select({
        variantId: productVariantValues.variantId,
        valueTranslations: attributeValues.translations,
      })
      .from(productVariantValues)
      .innerJoin(
        attributes,
        eq(productVariantValues.attributeId, attributes.id),
      )
      .innerJoin(
        attributeValues,
        eq(productVariantValues.attributeValueId, attributeValues.id),
      )
      .where(inArray(productVariantValues.variantId, ids))
      .orderBy(asc(attributes.sortOrder), asc(attributeValues.sortOrder)),
  ]);

  const parts = new Map<string, typeof optionRows>();
  for (const row of optionRows) {
    const list = parts.get(row.variantId) ?? [];
    list.push(row);
    parts.set(row.variantId, list);
  }

  for (const variant of variants) {
    const options = parts.get(variant.id) ?? [];
    const labels: Partial<Record<Locale, string>> = {};
    for (const locale of locales) {
      labels[locale] = formatVariantLabel(
        options.map((option) =>
          attributeTitle(option.valueTranslations, locale),
        ),
      );
    }
    map.set(variant.id, {
      id: variant.id,
      productId: variant.productId,
      sku: variant.sku,
      priceAmount: variant.priceAmount,
      stockOnHand: variant.stockOnHand,
      imageObjectKey: variant.imageObjectKey,
      labels,
    });
  }

  return map;
}

export function variantLabel(
  snapshot: VariantSnapshot | null | undefined,
  locale: Locale,
): string | null {
  if (!snapshot) return null;
  return snapshot.labels[locale] ?? snapshot.labels.hy ?? null;
}
