"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { updateUserRoleAction } from "@/features/users/application/update-user";
import {
  USER_ROLES,
  type UserRole,
} from "@/features/users/domain/user-lifecycle";
import { userRoleLabel } from "@/features/users/ui/user-labels";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type UpdateUserRoleFormProps = {
  locale: string;
  userId: string;
  currentRole: UserRole;
  disabled?: boolean;
  copy: Dictionary["admin"];
};

function rolePillClass(role: string): string {
  return role.toUpperCase() === "ADMIN"
    ? "bg-blue-100 text-blue-800"
    : "bg-gray-100 text-gray-800";
}

export function UpdateUserRoleForm({
  locale,
  userId,
  currentRole,
  disabled = false,
  copy,
}: UpdateUserRoleFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const labels = copy.users.roleLabels;
  const roleOptions = USER_ROLES.map((item) => ({
    value: item,
    label: userRoleLabel(item, labels),
  }));

  function changeRole(next: string): void {
    if (next === currentRole || disabled) {
      return;
    }
    startTransition(async () => {
      setError(null);
      const result = await updateUserRoleAction(locale, {
        userId,
        role: next as UserRole,
      });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="min-w-0">
      <SelectDropdown
        ariaLabel={copy.users.roleForm.newRoleAria}
        value={currentRole}
        options={roleOptions}
        disabled={disabled || isPending}
        fitContent
        deferChange={false}
        triggerClassName={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium outline-none disabled:cursor-not-allowed disabled:opacity-50 ${rolePillClass(currentRole)}`}
        onValueChange={changeRole}
      />
      {error ? <p className="mt-1 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
