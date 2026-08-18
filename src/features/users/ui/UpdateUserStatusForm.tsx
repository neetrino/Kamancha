"use client";

import { CircleCheckBig, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ADMIN_SECTION_TITLE } from "@/features/admin/ui/admin-form-classes";
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

export function UpdateUserStatusForm({
  locale,
  userId,
  currentStatus,
  eligibleStatuses,
  copy,
}: UpdateUserStatusFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<UserStatus>(currentStatus);
  const [isPending, startTransition] = useTransition();
  const labels = copy.users.statusLabels;

  if (eligibleStatuses.length === 0) {
    return (
      <p className="text-sm text-gray-600">{copy.users.statusForm.terminal}</p>
    );
  }

  const statusOptions = USER_STATUSES.filter(
    (item) => item === currentStatus || eligibleStatuses.includes(item),
  ).map((item) => ({
    value: item,
    label: userStatusLabel(item, labels),
  }));

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-forest/10 text-brand-forest">
          <CircleCheckBig className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className={ADMIN_SECTION_TITLE}>
            {copy.users.statusForm.title}
            {": "}
            <span className="text-brand-forest">
              {userStatusLabel(currentStatus, labels)}
            </span>
          </h2>
          <form
            className="mt-4 flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              startTransition(async () => {
                setError(null);
                const result = await updateUserStatusAction(locale, {
                  userId,
                  status,
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
                aria-label={copy.users.statusForm.newStatusAria}
                value={status}
                options={statusOptions}
                disabled={isPending}
                onSelect={setStatus}
              />
              <Button
                type="submit"
                size="field"
                disabled={isPending || status === currentStatus}
                className="w-full gap-2 sm:w-auto"
              >
                <Send className="h-4 w-4" aria-hidden />
                {isPending
                  ? copy.common.updating
                  : copy.users.statusForm.updateStatus}
              </Button>
            </div>
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
          </form>
        </div>
      </div>
    </Card>
  );
}
