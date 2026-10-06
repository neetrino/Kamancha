import "server-only";

import { and, desc, eq, sql, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { getDb } from "@/db/client";
import { orderEvents, orders, users } from "@/db/schema";
import {
  ORDER_OPERATOR_NOTE_SOURCE,
  readOperatorNoteBody,
  type OrderOperatorNote,
} from "@/features/orders/domain/operator-note";

const USER_ORDER_NOTES_LIMIT = 100;

const authors = alias(users, "note_authors");

async function selectOperatorNotes(
  scope: SQL,
  limit?: number,
): Promise<OrderOperatorNote[]> {
  const query = getDb()
    .select({
      id: orderEvents.id,
      orderNumber: orders.orderNumber,
      payload: orderEvents.payload,
      authorFirstName: authors.firstName,
      authorLastName: authors.lastName,
      createdAt: orderEvents.createdAt,
    })
    .from(orderEvents)
    .innerJoin(orders, eq(orderEvents.orderId, orders.id))
    .leftJoin(authors, eq(orderEvents.actorUserId, authors.id))
    .where(
      and(
        scope,
        eq(orderEvents.eventType, "NOTE"),
        sql`${orderEvents.payload}->>'source' = ${ORDER_OPERATOR_NOTE_SOURCE}`,
      ),
    )
    .orderBy(desc(orderEvents.createdAt));

  const rows = limit ? await query.limit(limit) : await query;

  return rows.flatMap((row) => {
    const body = readOperatorNoteBody(row.payload);
    if (body === null) {
      return [];
    }
    const authorName = [row.authorFirstName, row.authorLastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    return [
      {
        id: row.id,
        orderNumber: row.orderNumber,
        body,
        authorName: authorName || null,
        createdAt: row.createdAt,
      },
    ];
  });
}

/** Operator notes for one order, newest first. */
export function listOrderOperatorNotes(
  orderId: string,
): Promise<OrderOperatorNote[]> {
  return selectOperatorNotes(eq(orderEvents.orderId, orderId));
}

/** Operator notes across all orders owned by a customer, newest first. */
export function listUserOrderOperatorNotes(
  userId: string,
): Promise<OrderOperatorNote[]> {
  return selectOperatorNotes(eq(orders.userId, userId), USER_ORDER_NOTES_LIMIT);
}
