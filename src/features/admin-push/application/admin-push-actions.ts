"use server";

import {
  deleteAdminPushSubscription,
  upsertAdminPushSubscription,
} from "@/features/admin-push/application/admin-push-subscriptions-repository";
import {
  removeAdminPushSubscriptionSchema,
  saveAdminPushSubscriptionSchema,
  type RemoveAdminPushSubscriptionInput,
  type SaveAdminPushSubscriptionInput,
} from "@/features/admin-push/schemas";
import { requireAdmin } from "@/lib/auth/policies";
import { logger } from "@/lib/observability/logger";
import { err, ok, type Result } from "@/lib/result";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Stores the current browser's push subscription for the signed-in admin. */
export async function saveAdminPushSubscriptionAction(
  input: SaveAdminPushSubscriptionInput,
): Promise<Result<null>> {
  const parsed = saveAdminPushSubscriptionSchema.safeParse(input);
  if (!parsed.success) {
    return err("INVALID_INPUT", "Invalid push subscription.");
  }
  const admin = await requireAdmin(parsed.data.locale);

  try {
    await upsertAdminPushSubscription({
      userId: admin.id,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
      locale: parsed.data.locale,
    });
    return ok(null);
  } catch (error) {
    logger.error("admin_push_subscription_save_failed", {
      userId: admin.id,
      error: errorMessage(error),
    });
    return err("SAVE_FAILED", "Unable to enable notifications.");
  }
}

/** Removes the current browser's push subscription for the signed-in admin. */
export async function removeAdminPushSubscriptionAction(
  input: RemoveAdminPushSubscriptionInput,
): Promise<Result<null>> {
  const parsed = removeAdminPushSubscriptionSchema.safeParse(input);
  if (!parsed.success) {
    return err("INVALID_INPUT", "Invalid push subscription.");
  }
  const admin = await requireAdmin(parsed.data.locale);

  try {
    await deleteAdminPushSubscription(admin.id, parsed.data.endpoint);
    return ok(null);
  } catch (error) {
    logger.error("admin_push_subscription_remove_failed", {
      userId: admin.id,
      error: errorMessage(error),
    });
    return err("REMOVE_FAILED", "Unable to disable notifications.");
  }
}
