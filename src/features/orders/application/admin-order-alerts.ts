"use server";

import { and, count, desc, eq, isNull, sql } from "drizzle-orm";

import { getDb } from "@/db/client";
import { orders, payments } from "@/db/schema";
import { paymentMethodLabel } from "@/features/orders/domain/payment-method-label";
import { requireAdmin } from "@/lib/auth/policies";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { err, ok, type Result } from "@/lib/result";

const latestPaymentMethodSql = sql<string | null>`
  (
    select ${payments.method}
    from ${payments}
    where ${payments.orderId} = ${orders}.id
    order by ${payments.createdAt} desc
    limit 1
  )
`;

export type AdminOrderAlertLatest = {
  orderNumber: string;
  contactName: string;
  totalAmount: number;
  baseCurrency: string;
  paymentMethod: string;
  placedAt: string;
};

export type AdminOrderAlertsSnapshot = {
  unseenCount: number;
  /** Unseen personal (non-group) orders. */
  unseenPersonalCount: number;
  /** Unseen group orders. */
  unseenGroupCount: number;
  latest: AdminOrderAlertLatest | null;
};

function toAlertLatest(row: {
  orderNumber: string;
  contactName: string;
  totalAmount: number;
  baseCurrency: string;
  paymentMethodRaw: string | null;
  placedAt: Date;
}): AdminOrderAlertLatest {
  return {
    orderNumber: row.orderNumber,
    contactName: row.contactName,
    totalAmount: row.totalAmount,
    baseCurrency: row.baseCurrency,
    paymentMethod: row.paymentMethodRaw
      ? paymentMethodLabel(row.paymentMethodRaw)
      : "—",
    placedAt: row.placedAt.toISOString(),
  };
}

/** Counts unseen admin orders and returns the newest one for the alert popup. */
export async function getAdminOrderAlertsAction(
  locale: string,
): Promise<Result<AdminOrderAlertsSnapshot>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }
  await requireAdmin(locale as Locale);

  const unseenWhere = and(
    eq(orders.isArchived, false),
    isNull(orders.adminSeenAt),
  );

  const [[countsRow], [latestRow]] = await Promise.all([
    getDb()
      .select({
        all: count(),
        personal: sql<number>`count(*) filter (where ${orders.groupOrderId} is null)`.mapWith(
          Number,
        ),
        group: sql<number>`count(*) filter (where ${orders.groupOrderId} is not null)`.mapWith(
          Number,
        ),
      })
      .from(orders)
      .where(unseenWhere),
    getDb()
      .select({
        orderNumber: orders.orderNumber,
        contactName: orders.contactName,
        totalAmount: orders.totalAmount,
        baseCurrency: orders.baseCurrency,
        paymentMethodRaw: latestPaymentMethodSql,
        placedAt: orders.placedAt,
      })
      .from(orders)
      .where(unseenWhere)
      .orderBy(desc(orders.placedAt))
      .limit(1),
  ]);

  return ok({
    unseenCount: countsRow?.all ?? 0,
    unseenPersonalCount: countsRow?.personal ?? 0,
    unseenGroupCount: countsRow?.group ?? 0,
    latest: latestRow ? toAlertLatest(latestRow) : null,
  });
}
