import "server-only";

import { count, desc, sql } from "drizzle-orm";

import { getDb } from "@/db/client";
import { orders } from "@/db/schema";
import {
  customerOrderDisplayAmountSql,
  customerOrderItemsCountSql,
  customerOrdersVisibilitySql,
} from "@/features/orders/application/customer-group-order-share";

const RECENT_ORDERS_LIMIT = 5;

export type ProfileDashboardStats = {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSpent: number;
};

export type ProfileRecentOrder = {
  id: string;
  orderNumber: string;
  status: (typeof orders.$inferSelect)["status"];
  totalAmount: number;
  placedAt: Date;
  itemsCount: number;
};

/** Aggregated order stats for the profile dashboard (SQL, not full-row scan). */
export async function getProfileDashboardStats(
  userId: string,
): Promise<ProfileDashboardStats> {
  const visibility = customerOrdersVisibilitySql(userId);
  const displayAmount = customerOrderDisplayAmountSql(userId);

  const [row] = await getDb()
    .select({
      totalOrders: count(),
      pendingOrders: sql<number>`
        count(*) filter (
          where ${orders.status}::text in ('PENDING', 'CONFIRMED', 'PROCESSING')
        )
      `.mapWith(Number),
      completedOrders: sql<number>`
        count(*) filter (where ${orders.status}::text = 'DELIVERED')
      `.mapWith(Number),
      totalSpent: sql<number>`
        coalesce(
          sum(${displayAmount}) filter (
            where ${orders.status}::text not in ('CANCELLED', 'REFUNDED')
          ),
          0
        )
      `.mapWith(Number),
    })
    .from(orders)
    .where(visibility);

  return {
    totalOrders: row?.totalOrders ?? 0,
    pendingOrders: row?.pendingOrders ?? 0,
    completedOrders: row?.completedOrders ?? 0,
    totalSpent: row?.totalSpent ?? 0,
  };
}

/** Latest orders for the profile dashboard preview list. */
export async function listRecentProfileOrders(
  userId: string,
  limit: number = RECENT_ORDERS_LIMIT,
): Promise<ProfileRecentOrder[]> {
  return getDb()
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      totalAmount: customerOrderDisplayAmountSql(userId).mapWith(Number),
      placedAt: orders.placedAt,
      itemsCount: customerOrderItemsCountSql(userId).mapWith(Number),
    })
    .from(orders)
    .where(customerOrdersVisibilitySql(userId))
    .orderBy(desc(orders.placedAt))
    .limit(limit);
}

/** Parallel dashboard payload — stats + recent rows. */
export async function getProfileDashboard(userId: string): Promise<{
  stats: ProfileDashboardStats;
  recentOrders: ProfileRecentOrder[];
}> {
  const [stats, recentOrders] = await Promise.all([
    getProfileDashboardStats(userId),
    listRecentProfileOrders(userId),
  ]);
  return { stats, recentOrders };
}
