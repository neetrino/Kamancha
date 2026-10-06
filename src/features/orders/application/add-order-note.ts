"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auditLogs, orderEvents, orders } from "@/db/schema";
import { withTransaction } from "@/db/transaction";
import { ORDER_OPERATOR_NOTE_SOURCE } from "@/features/orders/domain/operator-note";
import {
  addOrderNoteSchema,
  type AddOrderNoteInput,
} from "@/features/orders/schemas/change-status";
import { requireAdmin } from "@/lib/auth/policies";
import { createId } from "@/lib/id";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { logger } from "@/lib/observability/logger";
import { err, ok, type Result } from "@/lib/result";

/**
 * Adds an internal operator note to an order.
 * The note is also listed on the customer's admin profile when the order has a user.
 */
export async function addOrderNoteAction(
  locale: string,
  raw: AddOrderNoteInput,
): Promise<Result<{ orderNumber: string }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }

  const parsed = addOrderNoteSchema.safeParse(raw);
  if (!parsed.success) {
    return err("VALIDATION_ERROR", "Invalid note payload.");
  }

  const actor = await requireAdmin(locale as Locale);

  try {
    const result = await withTransaction(async (tx) => {
      const [existing] = await tx
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          userId: orders.userId,
        })
        .from(orders)
        .where(eq(orders.orderNumber, parsed.data.orderNumber))
        .limit(1);

      if (!existing) {
        throw new Error("NOT_FOUND");
      }

      await tx.insert(orderEvents).values({
        id: createId(),
        orderId: existing.id,
        eventType: "NOTE",
        fromState: null,
        toState: null,
        actorUserId: actor.id,
        isCustomerVisible: false,
        payload: { note: parsed.data.note, source: ORDER_OPERATOR_NOTE_SOURCE },
      });

      await tx.insert(auditLogs).values({
        id: createId(),
        actorUserId: actor.id,
        action: "order.add_note",
        targetType: "order",
        targetId: existing.id,
        afterDiff: { noteLength: parsed.data.note.length },
        correlationId: createId(),
      });

      return existing;
    });

    revalidatePath(`/${locale}/admin/orders/${result.orderNumber}`);
    if (result.userId) {
      revalidatePath(`/${locale}/admin/users/${result.userId}`);
    }
    return ok({ orderNumber: result.orderNumber });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return err("NOT_FOUND", "Order not found.");
    }
    logger.error("orders.add_note_failed", {
      orderNumber: parsed.data.orderNumber,
      message: error instanceof Error ? error.message : "unknown",
    });
    return err("NOTE_FAILED", "Unable to add note.");
  }
}
