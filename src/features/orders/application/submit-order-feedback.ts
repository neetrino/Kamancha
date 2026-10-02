"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { orders } from "@/db/schema";
import { getDb } from "@/db/client";
import {
  canSubmitOrderFeedback,
  sanitizeOrderFeedbackComment,
} from "@/features/orders/domain/order-feedback";
import {
  submitOrderFeedbackSchema,
  type SubmitOrderFeedbackInput,
} from "@/features/orders/schemas/order-feedback";
import { requireUser } from "@/lib/auth/policies";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { err, ok, type Result } from "@/lib/result";

export type SubmitOrderFeedbackData = {
  rating: number;
  comment: string | null;
};

/** Customer submits a one-time 1–5 rating + comment after admin confirmation. */
export async function submitOrderFeedbackAction(
  locale: string,
  raw: SubmitOrderFeedbackInput,
): Promise<Result<SubmitOrderFeedbackData>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }

  const parsed = submitOrderFeedbackSchema.safeParse(raw);
  if (!parsed.success) {
    return err("VALIDATION_ERROR", "Invalid feedback payload.");
  }

  const user = await requireUser(locale as Locale);
  const comment = sanitizeOrderFeedbackComment(parsed.data.comment);
  const now = new Date();

  const [order] = await getDb()
    .select({
      id: orders.id,
      status: orders.status,
      userId: orders.userId,
      customerRating: orders.customerRating,
    })
    .from(orders)
    .where(eq(orders.orderNumber, parsed.data.orderNumber))
    .limit(1);

  if (!order || order.userId !== user.id) {
    return err("NOT_FOUND", "Order not found.");
  }

  if (
    !canSubmitOrderFeedback({
      status: order.status,
      hasFeedback: order.customerRating != null,
    })
  ) {
    return err(
      "NOT_ELIGIBLE",
      "Feedback is available after the order is confirmed.",
    );
  }

  const [updated] = await getDb()
    .update(orders)
    .set({
      customerRating: parsed.data.rating,
      customerFeedback: comment.length > 0 ? comment : null,
      customerFeedbackAt: now,
      updatedAt: now,
    })
    .where(
      and(eq(orders.id, order.id), isNull(orders.customerRating)),
    )
    .returning({
      customerRating: orders.customerRating,
      customerFeedback: orders.customerFeedback,
    });

  if (!updated?.customerRating) {
    return err("ALREADY_SUBMITTED", "Feedback was already submitted.");
  }

  revalidatePath(`/${locale}/profile/orders`);
  revalidatePath(`/${locale}/admin/orders`);
  revalidatePath(`/${locale}/admin/orders/${parsed.data.orderNumber}`);

  return ok({
    rating: updated.customerRating,
    comment: updated.customerFeedback,
  });
}
