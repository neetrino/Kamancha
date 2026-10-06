"use server";

import { eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { orders } from "@/db/schema";
import { listOrderOperatorNotes } from "@/features/orders/application/operator-notes";
import type { OrderOperatorNote } from "@/features/orders/domain/operator-note";
import { requireAdmin } from "@/lib/auth/policies";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { logger } from "@/lib/observability/logger";
import { err, ok, type Result } from "@/lib/result";

export type OrderOperatorNotesResult = {
  notes: OrderOperatorNote[];
  /** `false` for guest orders — notes are not mirrored to a customer profile. */
  hasCustomer: boolean;
};

/** Admin-only fetch of operator notes for the order details drawer. */
export async function listOrderOperatorNotesAction(
  locale: string,
  orderNumber: string,
): Promise<Result<OrderOperatorNotesResult>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }

  const trimmed = orderNumber.trim();
  if (!trimmed || trimmed.length > 64) {
    return err("VALIDATION_ERROR", "Invalid order number.");
  }

  await requireAdmin(locale as Locale);

  try {
    const [order] = await getDb()
      .select({ id: orders.id, userId: orders.userId })
      .from(orders)
      .where(eq(orders.orderNumber, trimmed))
      .limit(1);

    if (!order) {
      return err("NOT_FOUND", "Order not found.");
    }

    const notes = await listOrderOperatorNotes(order.id);
    return ok({ notes, hasCustomer: order.userId != null });
  } catch (error) {
    logger.error("orders.list_notes_failed", {
      orderNumber: trimmed,
      message: error instanceof Error ? error.message : "unknown",
    });
    return err("NOTES_FAILED", "Unable to load notes.");
  }
}
