"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auditLogs, orderEvents, orders } from "@/db/schema";
import { withTransaction } from "@/db/transaction";
import { ORDER_OPERATOR_NOTE_SOURCE } from "@/features/orders/domain/operator-note";
import {
  deleteOrderNoteSchema,
  type DeleteOrderNoteInput,
} from "@/features/orders/schemas/change-status";
import { requireAdmin } from "@/lib/auth/policies";
import { createId } from "@/lib/id";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { logger } from "@/lib/observability/logger";
import { err, ok, type Result } from "@/lib/result";

/** Removes an operator note so it no longer appears in admin or on the customer order. */
export async function deleteOrderNoteAction(
  locale: string,
  raw: DeleteOrderNoteInput,
): Promise<Result<{ noteId: string }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }

  const parsed = deleteOrderNoteSchema.safeParse(raw);
  if (!parsed.success) {
    return err("VALIDATION_ERROR", "Invalid note payload.");
  }

  const actor = await requireAdmin(locale as Locale);

  try {
    const result = await withTransaction(async (tx) => {
      const [existing] = await tx
        .select({
          id: orderEvents.id,
          orderId: orders.id,
          orderNumber: orders.orderNumber,
          userId: orders.userId,
        })
        .from(orderEvents)
        .innerJoin(orders, eq(orderEvents.orderId, orders.id))
        .where(
          and(
            eq(orderEvents.id, parsed.data.noteId),
            eq(orderEvents.eventType, "NOTE"),
            sql`${orderEvents.payload}->>'source' = ${ORDER_OPERATOR_NOTE_SOURCE}`,
          ),
        )
        .limit(1);

      if (!existing) {
        throw new Error("NOT_FOUND");
      }

      await tx.delete(orderEvents).where(eq(orderEvents.id, existing.id));

      await tx.insert(auditLogs).values({
        id: createId(),
        actorUserId: actor.id,
        action: "order.delete_note",
        targetType: "order",
        targetId: existing.orderId,
        afterDiff: { noteId: existing.id },
        correlationId: createId(),
      });

      return existing;
    });

    revalidatePath(`/${locale}/admin/orders/${result.orderNumber}`);
    if (result.userId) {
      revalidatePath(`/${locale}/admin/users/${result.userId}`);
    }
    return ok({ noteId: result.id });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return err("NOT_FOUND", "Note not found.");
    }
    logger.error("orders.delete_note_failed", {
      noteId: parsed.data.noteId,
      message: error instanceof Error ? error.message : "unknown",
    });
    return err("NOTE_FAILED", "Unable to delete note.");
  }
}
