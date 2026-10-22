import "server-only";

import { and, eq, inArray } from "drizzle-orm";

import { getDb } from "@/db/client";
import { adminPushSubscriptions, users } from "@/db/schema";
import { createId } from "@/lib/id";

export type AdminPushSubscriptionInput = {
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  locale: string;
};

export type AdminPushSubscriptionRecord = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  locale: string;
};

/** Inserts or re-binds a subscription (by endpoint) to the current admin. */
export async function upsertAdminPushSubscription(
  input: AdminPushSubscriptionInput,
): Promise<void> {
  const now = new Date();
  await getDb()
    .insert(adminPushSubscriptions)
    .values({ id: createId(), ...input, createdAt: now, updatedAt: now })
    .onConflictDoUpdate({
      target: adminPushSubscriptions.endpoint,
      set: {
        userId: input.userId,
        p256dh: input.p256dh,
        auth: input.auth,
        locale: input.locale,
        updatedAt: now,
      },
    });
}

/** Removes one subscription owned by the given user. */
export async function deleteAdminPushSubscription(
  userId: string,
  endpoint: string,
): Promise<void> {
  await getDb()
    .delete(adminPushSubscriptions)
    .where(
      and(
        eq(adminPushSubscriptions.userId, userId),
        eq(adminPushSubscriptions.endpoint, endpoint),
      ),
    );
}

/** Removes subscriptions the push service reported as expired. */
export async function deleteAdminPushSubscriptionsByIds(
  ids: readonly string[],
): Promise<void> {
  if (ids.length === 0) return;
  await getDb()
    .delete(adminPushSubscriptions)
    .where(inArray(adminPushSubscriptions.id, [...ids]));
}

/** Subscriptions of users who are currently active admins. */
export async function listActiveAdminPushSubscriptions(): Promise<
  AdminPushSubscriptionRecord[]
> {
  return getDb()
    .select({
      id: adminPushSubscriptions.id,
      endpoint: adminPushSubscriptions.endpoint,
      p256dh: adminPushSubscriptions.p256dh,
      auth: adminPushSubscriptions.auth,
      locale: adminPushSubscriptions.locale,
    })
    .from(adminPushSubscriptions)
    .innerJoin(users, eq(users.id, adminPushSubscriptions.userId))
    .where(and(eq(users.role, "ADMIN"), eq(users.status, "ACTIVE")));
}
