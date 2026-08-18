"use client";

import { Send, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ADMIN_SECTION_TITLE } from "@/features/admin/ui/admin-form-classes";
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

export function UpdateUserRoleForm({
  locale,
  userId,
  currentRole,
  disabled = false,
  copy,
}: UpdateUserRoleFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>(currentRole);
  const [isPending, startTransition] = useTransition();
  const labels = copy.users.roleLabels;

  const roleOptions = USER_ROLES.map((item) => ({
    value: item,
    label: userRoleLabel(item, labels),
  }));

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-forest/10 text-brand-forest">
          <Shield className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className={ADMIN_SECTION_TITLE}>
            {copy.users.roleForm.title}
            {": "}
            <span className="text-brand-forest">
              {userRoleLabel(currentRole, labels)}
            </span>
          </h2>
          <form
            className="mt-4 flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              startTransition(async () => {
                setError(null);
                const result = await updateUserRoleAction(locale, {
                  userId,
                  role,
                });
                if (!result.ok) {
                  setError(result.error.message);
                  return;
                }
                router.refresh();
              });
            }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <SegmentedControl
                aria-label={copy.users.roleForm.newRoleAria}
                value={role}
                options={roleOptions}
                disabled={disabled || isPending}
                onSelect={setRole}
              />
              <Button
                type="submit"
                size="field"
                disabled={disabled || isPending || role === currentRole}
                className="w-full gap-2 sm:w-auto"
              >
                <Send className="h-4 w-4" aria-hidden />
                {isPending
                  ? copy.common.updating
                  : copy.users.roleForm.updateRole}
              </Button>
            </div>
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
          </form>
        </div>
      </div>
    </Card>
  );
}
