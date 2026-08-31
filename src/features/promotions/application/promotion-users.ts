import "server-only";

import { eq, inArray } from "drizzle-orm";

import { promotionUsers, users } from "@/db/schema";
import type { DbTransaction } from "@/db/transaction";
import { createId } from "@/lib/id";

/** Replaces the coupon allowlist. `undefined` leaves existing rows unchanged. */
export async function replacePromotionUsers(
  tx: DbTransaction,
  promotionId: string,
  userIds: string[] | undefined,
): Promise<void> {
  if (userIds === undefined) {
    return;
  }

  const uniqueIds = [...new Set(userIds)];
  if (uniqueIds.length > 0) {
    const existing = await tx
      .select({ id: users.id })
      .from(users)
      .where(inArray(users.id, uniqueIds));
    if (existing.length !== uniqueIds.length) {
      throw new Error("INVALID_USERS");
    }
  }

  await tx
    .delete(promotionUsers)
    .where(eq(promotionUsers.promotionId, promotionId));

  if (uniqueIds.length === 0) {
    return;
  }

  await tx.insert(promotionUsers).values(
    uniqueIds.map((userId) => ({
      id: createId(),
      promotionId,
      userId,
    })),
  );
}

/** Copies a coupon allowlist onto a duplicated promotion. */
export async function copyPromotionUsers(
  tx: DbTransaction,
  sourcePromotionId: string,
  targetPromotionId: string,
): Promise<void> {
  const rows = await tx
    .select({ userId: promotionUsers.userId })
    .from(promotionUsers)
    .where(eq(promotionUsers.promotionId, sourcePromotionId));

  if (rows.length === 0) {
    return;
  }

  await tx.insert(promotionUsers).values(
    rows.map((row) => ({
      id: createId(),
      promotionId: targetPromotionId,
      userId: row.userId,
    })),
  );
}
