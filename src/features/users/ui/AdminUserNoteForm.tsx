"use client";

import { MessageSquareText, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  ADMIN_LABEL,
  ADMIN_SECTION_TITLE,
  ADMIN_TEXTAREA,
} from "@/features/admin/ui/admin-form-classes";
import { updateUserAdminNoteAction } from "@/features/users/application/update-user";
import {
  normalizeUserAdminNote,
  USER_ADMIN_NOTE_MAX_LENGTH,
} from "@/features/users/schemas/admin-users";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AdminUserNoteFormProps = {
  locale: string;
  userId: string;
  initialNote: string | null;
  disabled?: boolean;
  copy: Dictionary["admin"];
};

/**
 * Operator note editor on the admin user detail page.
 * Empty note clears the call-icon hint on admin orders.
 */
export function AdminUserNoteForm({
  locale,
  userId,
  initialNote,
  disabled = false,
  copy,
}: AdminUserNoteFormProps) {
  const router = useRouter();
  const labels = copy.users.noteForm;
  const [note, setNote] = useState(initialNote ?? "");
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setNote(initialNote ?? "");
  }, [initialNote]);

  const normalizedInitial = normalizeUserAdminNote(initialNote) ?? "";
  const normalizedCurrent = normalizeUserAdminNote(note) ?? "";
  const isDirty = normalizedCurrent !== normalizedInitial;

  return (
    <Card className="mb-6 p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-forest/10 text-brand-forest">
          <MessageSquareText className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 className={ADMIN_SECTION_TITLE}>{labels.title}</h2>
          <p className="mt-1 text-sm text-gray-600">{labels.hint}</p>
        </div>
      </div>
      <form
        className="mt-4 flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          startTransition(async () => {
            setError(null);
            setSavedMessage(null);
            const result = await updateUserAdminNoteAction(locale, {
              userId,
              adminNote: note,
            });
            if (!result.ok) {
              setError(result.error.message);
              return;
            }
            setNote(result.value.adminNote ?? "");
            setSavedMessage(labels.saved);
            router.refresh();
          });
        }}
      >
        <label>
          <span className={ADMIN_LABEL}>{labels.label}</span>
          <textarea
            value={note}
            onChange={(event) => {
              setNote(event.target.value);
              setSavedMessage(null);
            }}
            rows={4}
            maxLength={USER_ADMIN_NOTE_MAX_LENGTH}
            className={ADMIN_TEXTAREA}
            placeholder={labels.placeholder}
            disabled={disabled || isPending}
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            size="field"
            disabled={disabled || isPending || !isDirty}
            className="gap-2"
          >
            <Send className="h-4 w-4" aria-hidden />
            {isPending ? copy.common.saving : labels.save}
          </Button>
          {savedMessage ? (
            <p className="text-sm text-brand-forest">{savedMessage}</p>
          ) : null}
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
        </div>
      </form>
    </Card>
  );
}
