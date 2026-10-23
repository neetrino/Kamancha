"use client";

import { CircleCheckBig, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";

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
  onSuccess?: () => void;
  /** Scrolls with the sheet body; the submit button stays at the bottom. */
  children?: ReactNode;
  pinButton?: boolean;
};

export function UpdateContactStatusForm({
  locale,
  messageId,
  currentStatus,
  eligibleStatuses,
  copy,
  onSuccess,
  children,
  pinButton = false,
}: UpdateContactStatusFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ContactStatus>(currentStatus);
  const [isPending, startTransition] = useTransition();
  const labels = copy.messages.statusLabels;

  if (eligibleStatuses.length === 0) {
    const note = (
      <p className="text-sm text-gray-600">
        {copy.messages.updateStatus.noFurtherChanges}
      </p>
    );
    if (!pinButton) return note;
    return (
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
        {children}
        {note}
      </div>
    );
  }

  const statusOptions = CONTACT_STATUSES.filter(
    (item) => item === currentStatus || eligibleStatuses.includes(item),
  ).map((item) => ({
    value: item,
    label: contactStatusLabel(item, labels),
  }));

  const submitButton = (
    <Button
      type="submit"
      size="field"
      disabled={isPending || status === currentStatus}
      className={pinButton ? "w-full gap-2" : "shrink-0 gap-2 whitespace-nowrap"}
    >
      <Send className="h-4 w-4" aria-hidden />
      {isPending
        ? copy.common.updating
        : copy.messages.updateStatus.updateStatus}
    </Button>
  );

  return (
    <form
      className={pinButton ? "flex min-h-0 flex-1 flex-col" : undefined}
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
          onSuccess?.();
          router.refresh();
        });
      }}
    >
      <div
        className={
          pinButton
            ? "min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5"
            : undefined
        }
      >
        {children}
        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-forest/10 text-brand-forest">
              <CircleCheckBig className="h-5 w-5" aria-hidden />
            </span>
            <h2 className={ADMIN_SECTION_TITLE}>{copy.common.status}</h2>
          </div>
          <div className={pinButton ? "mt-4" : "mt-4 flex flex-wrap items-center gap-3"}>
            <div className={pinButton ? undefined : "min-w-0 flex-1 overflow-x-auto"}>
              <SegmentedControl
                aria-label={copy.messages.updateStatus.newStatus}
                value={status}
                options={statusOptions}
                disabled={isPending}
                fullWidth={pinButton}
                onSelect={setStatus}
              />
            </div>
            {pinButton ? null : submitButton}
          </div>
          {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        </Card>
      </div>
      {pinButton ? (
        <div className="shrink-0 border-t border-gray-200 px-5 py-4">
          {submitButton}
        </div>
      ) : null}
    </form>
  );
}
