"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { ADMIN_BADGE } from "@/features/admin/ui/status-badge";
import { updateUserStatusAction } from "@/features/users/application/update-user";
import {
  USER_STATUSES,
  type UserStatus,
} from "@/features/users/domain/user-lifecycle";
import { userStatusLabel } from "@/features/users/ui/user-labels";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type UpdateUserStatusFormProps = {
  locale: string;
  userId: string;
  currentStatus: UserStatus;
  eligibleStatuses: UserStatus[];
  copy: Dictionary["admin"];
};

function statusPillClass(status: string): string {
  const normalized = status.toUpperCase();
  if (normalized === "ACTIVE") {
    return "bg-green-100 text-green-800";
  }
  if (normalized === "PENDING" || normalized === "INVITED") {
    return "bg-yellow-100 text-yellow-800";
  }
  if (
    normalized === "SUSPENDED" ||
    normalized === "BANNED" ||
    normalized === "ANONYMIZED"
  ) {
    return "bg-red-100 text-red-800";
  }
  return "bg-gray-100 text-gray-800";
}

export function UpdateUserStatusForm({
  locale,
  userId,
  currentStatus,
  eligibleStatuses,
  copy,
}: UpdateUserStatusFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const labels = copy.users.statusLabels;

  if (eligibleStatuses.length === 0) {
    return (
      <span className={`${ADMIN_BADGE} ${statusPillClass(currentStatus)}`}>
        {userStatusLabel(currentStatus, labels)}
      </span>
    );
  }

  const statusOptions = USER_STATUSES.filter(
    (item) => item === currentStatus || eligibleStatuses.includes(item),
  ).map((item) => ({
    value: item,
    label: userStatusLabel(item, labels),
  }));

  function changeStatus(next: string): void {
    if (next === currentStatus) {
      return;
    }
    startTransition(async () => {
      setError(null);
      const result = await updateUserStatusAction(locale, {
        userId,
        status: next as UserStatus,
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
        ariaLabel={copy.users.statusForm.newStatusAria}
        value={currentStatus}
        options={statusOptions}
        disabled={isPending}
        fitContent
        deferChange={false}
        triggerClassName={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium outline-none disabled:cursor-not-allowed disabled:opacity-50 ${statusPillClass(currentStatus)}`}
        onValueChange={changeStatus}
      />
      {error ? <p className="mt-1 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
