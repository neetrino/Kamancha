"use client";

import { CircleCheckBig, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ADMIN_SECTION_TITLE } from "@/features/admin/ui/admin-form-classes";
import { updateContactStatusAction } from "@/features/contact/application/update-contact-status";
import {
  CONTACT_STATUSES,
  type ContactStatus,
} from "@/features/contact/domain/contact-rules";
import { contactStatusLabel } from "@/features/contact/ui/contact-status-label";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type UpdateContactStatusFormProps = {
  locale: string;
  messageId: string;
  currentStatus: ContactStatus;
  eligibleStatuses: ContactStatus[];
  copy: Dictionary["admin"];
};

export function UpdateContactStatusForm({
  locale,
  messageId,
  currentStatus,
  eligibleStatuses,
  copy,
}: UpdateContactStatusFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ContactStatus>(currentStatus);
  const [isPending, startTransition] = useTransition();
  const labels = copy.messages.statusLabels;

  if (eligibleStatuses.length === 0) {
    return (
      <p className="text-sm text-gray-600">
        {copy.messages.updateStatus.noFurtherChanges}
      </p>
    );
  }

  const statusOptions = CONTACT_STATUSES.filter(
    (item) => item === currentStatus || eligibleStatuses.includes(item),
  ).map((item) => ({
    value: item,
    label: contactStatusLabel(item, labels),
  }));

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-forest/10 text-brand-forest">
          <CircleCheckBig className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className={ADMIN_SECTION_TITLE}>
            {copy.common.status}
            {": "}
            <span className="text-brand-forest">
              {contactStatusLabel(currentStatus, labels)}
            </span>
          </h2>
          <form
            className="mt-4 flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              startTransition(async () => {
                setError(null);
                const result = await updateContactStatusAction(locale, {
                  messageId,
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
                aria-label={copy.messages.updateStatus.newStatus}
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
                  : copy.messages.updateStatus.updateStatus}
              </Button>
            </div>
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
          </form>
        </div>
      </div>
    </Card>
  );
}
