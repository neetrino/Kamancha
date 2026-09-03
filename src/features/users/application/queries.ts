import "server-only";

import { and, count, desc, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";

import { getDb } from "@/db/client";
import { giftCards, orders, users } from "@/db/schema";
import { getCustomerBonusSummary } from "@/features/bonuses/application/queries";
import type { CustomerBonusSummary } from "@/features/bonuses/application/queries";
import type { GiftCardListItem } from "@/features/gift-cards/application/queries";
import type { AdminUsersFilter } from "@/features/users/schemas/admin-users";

const PAGE_SIZE = 20;

export type AdminUserListItem = {
  id: string;
  email: string;
  phone: string | null;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  orderCount: number;
  lastLoginAt: Date | null;
  createdAt: Date;
};

export type AdminUserGiftCard = GiftCardListItem & {
  purchaserUserId: string | null;
  recipientUserId: string | null;
};

export type AdminUserDetail = {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    role: string;
    status: string;
    emailVerifiedAt: Date | null;
    lastLoginAt: Date | null;
    anonymizedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    baseCurrency: string;
    placedAt: Date;
  }>;
  bonusSummary: CustomerBonusSummary;
  giftCards: AdminUserGiftCard[];
};

/** Lists users for the admin surface with optional search/role/status filters. */
export async function listAdminUsers(
  filters: AdminUsersFilter,
): Promise<{ rows: AdminUserListItem[]; total: number; pageSize: number }> {
  const conditions: SQL[] = [];

  if (filters.role) {
    conditions.push(eq(users.role, filters.role));
  }

  if (filters.status) {
    conditions.push(eq(users.status, filters.status));
  }

  if (filters.q) {
    const pattern = `%${filters.q}%`;
    conditions.push(
      or(
        ilike(users.email, pattern),
        ilike(users.firstName, pattern),
        ilike(users.lastName, pattern),
        ilike(users.phone, pattern),
      )!,
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (filters.page - 1) * PAGE_SIZE;

  const [rows, [totalRow]] = await Promise.all([
    getDb()
      .select({
        id: users.id,
        email: users.email,
        phone: users.phone,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        status: users.status,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(where)
      .orderBy(desc(users.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    getDb().select({ value: count() }).from(users).where(where),
  ]);

  const orderCountMap = new Map<string, number>();
  if (rows.length > 0) {
    const counts = await getDb()
      .select({
        userId: orders.userId,
        value: count(),
      })
      .from(orders)
      .where(
        inArray(
          orders.userId,
          rows.map((row) => row.id),
        ),
      )
      .groupBy(orders.userId);

    for (const row of counts) {
      if (row.userId) {
        orderCountMap.set(row.userId, row.value);
      }
    }
  }

  return {
    rows: rows.map((row) => ({
      ...row,
      orderCount: orderCountMap.get(row.id) ?? 0,
    })),
    total: totalRow?.value ?? 0,
    pageSize: PAGE_SIZE,
  };
}

/** Loads a user profile plus their most recent orders for the admin detail page. */
export async function getAdminUserById(
  userId: string,
): Promise<AdminUserDetail | null> {
  const [user] = await getDb()
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      phone: users.phone,
      role: users.role,
      status: users.status,
      emailVerifiedAt: users.emailVerifiedAt,
      lastLoginAt: users.lastLoginAt,
      anonymizedAt: users.anonymizedAt,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return null;
  }

  const email = user.email.trim().toLowerCase();

  const [recentOrders, bonusSummary, giftCardRows] = await Promise.all([
    getDb()
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        totalAmount: orders.totalAmount,
        baseCurrency: orders.baseCurrency,
        placedAt: orders.placedAt,
      })
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.placedAt))
      .limit(10),
    getCustomerBonusSummary(userId, { limit: 20 }),
    getDb()
      .select({
        id: giftCards.id,
        code: giftCards.code,
        initialAmount: giftCards.initialAmount,
        balanceAmount: giftCards.balanceAmount,
        status: giftCards.status,
        purchaserUserId: giftCards.purchaserUserId,
        recipientUserId: giftCards.recipientUserId,
        purchaserName: giftCards.purchaserName,
        purchaserEmail: giftCards.purchaserEmail,
        recipientName: giftCards.recipientName,
        recipientEmail: giftCards.recipientEmail,
        recipientPhone: giftCards.recipientPhone,
        message: giftCards.message,
        paymentMethod: giftCards.paymentMethod,
        scheduledSendAt: giftCards.scheduledSendAt,
        sentAt: giftCards.sentAt,
        activatedAt: giftCards.activatedAt,
        expiresAt: giftCards.expiresAt,
        createdAt: giftCards.createdAt,
      })
      .from(giftCards)
      .where(
        or(
          eq(giftCards.purchaserUserId, userId),
          eq(giftCards.recipientUserId, userId),
          email ? eq(giftCards.recipientEmail, email) : sql`false`,
        ),
      )
      .orderBy(desc(giftCards.createdAt)),
  ]);

  return { user, recentOrders, bonusSummary, giftCards: giftCardRows };
}
