import "server-only";

import { eq, isNull, max } from "drizzle-orm";

import { getDb } from "@/db/client";
import { products } from "@/db/schema";

const SORT_WRITE_BATCH = 25;

/** Next 1-based position so a new product appears at the end of the menu. */
export async function nextProductSortOrder(): Promise<number> {
  const [row] = await getDb()
    .select({ value: max(products.sortOrder) })
    .from(products)
    .where(isNull(products.deletedAt));

  return (row?.value ?? 0) + 1;
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
