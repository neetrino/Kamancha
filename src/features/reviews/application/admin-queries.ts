import "server-only";

import { count, desc, isNotNull } from "drizzle-orm";

import { getDb } from "@/db/client";
import { orders } from "@/db/schema";

const PAGE_SIZE = 20;

export type AdminOrderReview = {
  orderId: string;
  orderNumber: string;
  rating: number;
  comment: string | null;
  createdAt: Date | null;
  authorName: string;
  authorEmail: string;
};

/** Orders that received customer feedback, newest first. */
export async function listAdminOrderReviews(
  page: number,
): Promise<{ rows: AdminOrderReview[]; total: number; pageSize: number }> {
  const db = getDb();
  const hasFeedback = isNotNull(orders.customerRating);

  const [rows, [totalRow]] = await Promise.all([
    db
      .select({
        orderId: orders.id,
        orderNumber: orders.orderNumber,
        rating: orders.customerRating,
        comment: orders.customerFeedback,
        createdAt: orders.customerFeedbackAt,
        authorName: orders.contactName,
        authorEmail: orders.contactEmail,
      })
      .from(orders)
      .where(hasFeedback)
      .orderBy(desc(orders.customerFeedbackAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ value: count() }).from(orders).where(hasFeedback),
  ]);

  return {
    total: totalRow?.value ?? 0,
    pageSize: PAGE_SIZE,
    rows: rows.flatMap((row) =>
      row.rating == null
        ? []
        : [
            {
              orderId: row.orderId,
              orderNumber: row.orderNumber,
              rating: row.rating,
              comment: row.comment,
              createdAt: row.createdAt,
              authorName: row.authorName,
              authorEmail: row.authorEmail,
            },
          ],
    ),
  };
}
