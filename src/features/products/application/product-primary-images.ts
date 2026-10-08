import "server-only";

import { and, asc, eq, inArray, or } from "drizzle-orm";

import { getDb } from "@/db/client";
import { mediaAssets } from "@/db/schema";
import { mediaPublicUrl } from "@/lib/media/public-url";

/**
 * Primary storefront photo key per product (READY + isPrimary or PRIMARY role).
 */
export async function loadPrimaryProductImageKeys(
  productIds: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (productIds.length === 0) {
    return map;
  }

  const rows = await getDb()
    .select({
      productId: mediaAssets.productId,
      objectKey: mediaAssets.objectKey,
    })
    .from(mediaAssets)
    .where(
      and(
        inArray(mediaAssets.productId, productIds),
        eq(mediaAssets.uploadStatus, "READY"),
        or(eq(mediaAssets.isPrimary, true), eq(mediaAssets.role, "PRIMARY")),
      ),
    )
    .orderBy(asc(mediaAssets.sortOrder));

  for (const row of rows) {
    if (!row.productId || map.has(row.productId)) {
      continue;
    }
    map.set(row.productId, row.objectKey);
  }

  return map;
}

/**
 * Primary storefront photo per product (READY + isPrimary or PRIMARY role).
 */
export async function loadPrimaryProductImageUrls(
  productIds: string[],
): Promise<Map<string, string>> {
  const keys = await loadPrimaryProductImageKeys(productIds);
  const map = new Map<string, string>();
  for (const [productId, objectKey] of keys) {
    map.set(productId, mediaPublicUrl(objectKey));
  }
  return map;
}
