import { z } from "zod";

import {
  USER_ROLES,
  USER_STATUSES,
} from "@/features/users/domain/user-lifecycle";

export const adminUsersFilterSchema = z.object({
  q: z.string().trim().max(100).optional(),
  role: z.enum(USER_ROLES).optional(),
  status: z.enum(USER_STATUSES).optional(),
  page: z.coerce.number().int().min(1).max(500).default(1),
});

export type AdminUsersFilter = z.infer<typeof adminUsersFilterSchema>;

export const updateUserRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(USER_ROLES),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

export const updateUserStatusSchema = z.object({
  userId: z.string().uuid(),
  status: z.enum(USER_STATUSES),
});

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;

export const bulkAnonymizeUsersSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1).max(50),
});

export type BulkAnonymizeUsersInput = z.infer<typeof bulkAnonymizeUsersSchema>;

/** Max length for operator notes on a customer profile. */
export const USER_ADMIN_NOTE_MAX_LENGTH = 2000;

export const updateUserAdminNoteSchema = z.object({
  userId: z.string().uuid(),
  /** Trimmed empty string is stored as null (no call-icon on orders). */
  adminNote: z.string().max(USER_ADMIN_NOTE_MAX_LENGTH),
});

export type UpdateUserAdminNoteInput = z.infer<typeof updateUserAdminNoteSchema>;

/** Normalizes operator note text for persistence and UI presence checks. */
export function normalizeUserAdminNote(
  value: string | null | undefined,
): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
