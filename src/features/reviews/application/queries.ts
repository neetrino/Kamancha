import "server-only";

import { and, avg, count, eq, inArray } from "drizzle-orm";

import { getDb } from "@/db/client";
import { reviews } from "@/db/schema";

/**
 * Approved-review averages for catalog / home product cards.
 * Missing ids are omitted (no reviews yet).
 */
export async function getProductAverageRatings(
  productIds: readonly string[],
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (productIds.length === 0) {
    return map;
  }

  const rows = await getDb()
    .select({
      productId: reviews.productId,
      average: avg(reviews.rating),
      reviewCount: count(reviews.id),
    })
    .from(reviews)
    .where(
      and(
        inArray(reviews.productId, [...productIds]),
        eq(reviews.moderationStatus, "APPROVED"),
      ),
    )
    .groupBy(reviews.productId);

  for (const row of rows) {
    if (row.average == null || Number(row.reviewCount) === 0) {
      continue;
    }
    map.set(row.productId, Math.round(Number(row.average) * 10) / 10);
  }

  return map;
}
