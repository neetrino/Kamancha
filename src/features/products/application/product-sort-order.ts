import "server-only";

import { asc, eq, isNull, max } from "drizzle-orm";

import { getDb } from "@/db/client";
import { products } from "@/db/schema";
import {
  insertIdAtPosition,
  sameIdOrder,
} from "@/features/products/domain/menu-position";

const SORT_WRITE_BATCH = 25;

/** Next 1-based position so a new product appears at the end of the menu. */
export async function nextProductSortOrder(): Promise<number> {
  const [row] = await getDb()
    .select({ value: max(products.sortOrder) })
    .from(products)
    .where(isNull(products.deletedAt));

  return (row?.value ?? 0) + 1;
}

/**
 * Moves a product to a 1-based menu position.
 * No-ops when the product is already there.
 */
export async function placeProductInMenu(
  productId: string,
  position: number,
): Promise<void> {
  const rows = await getDb()
    .select({ id: products.id })
    .from(products)
    .where(isNull(products.deletedAt))
    .orderBy(asc(products.sortOrder), asc(products.createdAt), asc(products.id));

  const current = rows.map((row) => row.id);
  const next = insertIdAtPosition(current, productId, position);
  if (sameIdOrder(current, next)) return;
  await saveProductSortOrder(next);
}

/** Writes 1-based menu positions in small batches. */
export async function saveProductSortOrder(orderedIds: string[]): Promise<void> {
  const now = new Date();
  for (let offset = 0; offset < orderedIds.length; offset += SORT_WRITE_BATCH) {
    const batch = orderedIds.slice(offset, offset + SORT_WRITE_BATCH);
    await Promise.all(
      batch.map((id, index) =>
        getDb()
          .update(products)
          .set({ sortOrder: offset + index + 1, updatedAt: now })
          .where(eq(products.id, id)),
      ),
    );
  }
}
