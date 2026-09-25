import "server-only";

import { and, asc, eq, inArray, isNull, max } from "drizzle-orm";

import { getDb } from "@/db/client";
import { attributes, productAttributeLinks } from "@/db/schema";
import {
  attributeTitle,
  withFallbackTitles,
} from "@/features/attributes/domain/label";
import type { AttributeOption } from "@/features/attributes/types";
import { createId } from "@/lib/id";
import type { Locale } from "@/lib/i18n/config";

export type { AttributeOption };

/** Active attribute names for the admin picker. */
export async function listAttributeOptions(
  locale: Locale,
): Promise<AttributeOption[]> {
  const rows = await getDb()
    .select({
      id: attributes.id,
      translations: attributes.translations,
    })
    .from(attributes)
    .where(and(eq(attributes.status, "ACTIVE"), isNull(attributes.deletedAt)))
    .orderBy(asc(attributes.sortOrder), asc(attributes.createdAt));

  return rows.map((row) => ({
    id: row.id,
    title: attributeTitle(row.translations, locale),
  }));
}

/** Attribute ids linked to each product, in display order. */
export async function listAttributeIdsByProduct(
  productIds: string[],
): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (productIds.length === 0) return map;

  const rows = await getDb()
    .select({
      productId: productAttributeLinks.productId,
      attributeId: productAttributeLinks.attributeId,
    })
    .from(productAttributeLinks)
    .innerJoin(attributes, eq(productAttributeLinks.attributeId, attributes.id))
    .where(
      and(
        inArray(productAttributeLinks.productId, productIds),
        eq(attributes.status, "ACTIVE"),
        isNull(attributes.deletedAt),
      ),
    )
    .orderBy(asc(productAttributeLinks.sortOrder));

  for (const row of rows) {
    const list = map.get(row.productId) ?? [];
    list.push(row.attributeId);
    map.set(row.productId, list);
  }
  return map;
}

/** Named options offered on one product page. */
export async function listProductAttributeOptions(
  productId: string,
  locale: Locale,
): Promise<AttributeOption[]> {
  const linked = await listAttributeIdsByProduct([productId]);
  const ids = linked.get(productId) ?? [];
  if (ids.length === 0) return [];
  const library = await listAttributeOptions(locale);
  const byId = new Map(library.map((row) => [row.id, row]));
  return ids.flatMap((id) => {
    const option = byId.get(id);
    return option ? [option] : [];
  });
}

/** Products that require the shopper to pick an attribute on the product page. */
export async function productIdsWithAttributes(
  productIds: string[],
): Promise<Set<string>> {
  const linked = await listAttributeIdsByProduct(productIds);
  return new Set(
    [...linked.entries()]
      .filter(([, ids]) => ids.length > 0)
      .map(([productId]) => productId),
  );
}

/** Replaces the options attached to a product. Unknown ids are rejected. */
export async function syncProductAttributeLinks(
  productId: string,
  attributeIds: string[],
): Promise<string | null> {
  const uniqueIds = [...new Set(attributeIds)];
  if (uniqueIds.length > 0) {
    const found = await getDb()
      .select({ id: attributes.id })
      .from(attributes)
      .where(
        and(
          inArray(attributes.id, uniqueIds),
          eq(attributes.status, "ACTIVE"),
          isNull(attributes.deletedAt),
        ),
      );
    if (found.length !== uniqueIds.length) {
      return "One or more attributes were not found.";
    }
  }

  const db = getDb();
  await db
    .delete(productAttributeLinks)
    .where(eq(productAttributeLinks.productId, productId));
  if (uniqueIds.length === 0) return null;

  await db.insert(productAttributeLinks).values(
    uniqueIds.map((attributeId, index) => ({
      id: createId(),
      productId,
      attributeId,
      sortOrder: index,
    })),
  );
  return null;
}

/** Creates a named option with Armenian, English, and Russian titles. */
export async function createAttributeOption(
  titles: { hy: string; en: string; ru: string },
  locale: Locale,
): Promise<AttributeOption | null> {
  const hy = titles.hy.trim();
  const en = titles.en.trim();
  const ru = titles.ru.trim();
  if (!hy || !en || !ru) return null;
  if (hy.length > 80 || en.length > 80 || ru.length > 80) return null;

  const translations = withFallbackTitles({ hy, en, ru });
  const db = getDb();
  const [row] = await db
    .select({ value: max(attributes.sortOrder) })
    .from(attributes)
    .where(isNull(attributes.deletedAt));
  const id = createId();
  await db.insert(attributes).values({
    id,
    translations,
    sortOrder: (row?.value ?? -1) + 1,
    status: "ACTIVE",
  });
  return { id, title: attributeTitle(translations, locale) };
}

/** Hides an option and detaches it from products. Cart history keeps the row. */
export async function archiveAttributeOption(attributeId: string): Promise<boolean> {
  const db = getDb();
  const updated = await db
    .update(attributes)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(attributes.id, attributeId), isNull(attributes.deletedAt)))
    .returning({ id: attributes.id });
  if (updated.length === 0) return false;

  await db
    .delete(productAttributeLinks)
    .where(eq(productAttributeLinks.attributeId, attributeId));
  return true;
}

/** Titles for cart and order lines, including archived options already chosen. */
export async function loadAttributeTitles(
  attributeIds: string[],
  locale: Locale,
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const uniqueIds = [...new Set(attributeIds)];
  if (uniqueIds.length === 0) return map;

  const rows = await getDb()
    .select({
      id: attributes.id,
      translations: attributes.translations,
    })
    .from(attributes)
    .where(inArray(attributes.id, uniqueIds));

  for (const row of rows) {
    map.set(row.id, attributeTitle(row.translations, locale));
  }
  return map;
}

/**
 * Shoppers must pick one linked option when the product has any.
 * Products without options accept a missing id.
 */
export async function resolveCartAttribute(
  productId: string,
  attributeId: string | undefined,
): Promise<{ ok: true; attributeId: string | null } | { ok: false; error: string }> {
  const linked = await listAttributeIdsByProduct([productId]);
  const allowed = linked.get(productId) ?? [];
  if (allowed.length === 0) {
    return { ok: true, attributeId: null };
  }
  if (!attributeId || !allowed.includes(attributeId)) {
    return { ok: false, error: "Choose an attribute." };
  }
  return { ok: true, attributeId };
}
