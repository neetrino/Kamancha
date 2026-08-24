import type { UserRole, UserStatus } from "@/features/users/domain/user-lifecycle";

type UserRoleLabels = {
  admin: string;
  customer: string;
};

type UserStatusLabels = {
  active: string;
  suspended: string;
  anonymized: string;
};

/** Localized label for an admin user role. */
export function userRoleLabel(role: string, labels: UserRoleLabels): string {
  const normalized = role.toUpperCase() as UserRole;
  if (normalized === "ADMIN") return labels.admin;
  if (normalized === "CUSTOMER") return labels.customer;
  return role;
}

/** Localized label for an admin user status. */
export function userStatusLabel(
  status: string,
  labels: UserStatusLabels,
): string {
  const normalized = status.toUpperCase() as UserStatus;
  if (normalized === "ACTIVE") return labels.active;
  if (normalized === "SUSPENDED") return labels.suspended;
  if (normalized === "ANONYMIZED") return labels.anonymized;
  return status;
}
