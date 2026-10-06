"use client";

import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { ADMIN_LABEL, ADMIN_TEXTAREA } from "@/features/admin/ui/admin-form-classes";
import { addOrderNoteAction } from "@/features/orders/application/add-order-note";
import { ORDER_OPERATOR_NOTE_MAX_LENGTH } from "@/features/orders/domain/operator-note";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AddOrderNoteFormProps = {
  locale: string;
  orderNumber: string;
  copy: Dictionary["admin"];
  /** Called after a note is saved (e.g. to reload a client-side list). */
  onAdded?: () => Promise<void> | void;
};

/** Operator note composer (admin order detail page and order drawer). */
export function AddOrderNoteForm({
  locale,
  orderNumber,
  copy,
  onAdded,
}: AddOrderNoteFormProps) {
  const router = useRouter();
  const labels = copy.orders.notes;
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          setError(null);
          setSavedMessage(null);
          const result = await addOrderNoteAction(locale, { orderNumber, note });
          if (!result.ok) {
            setError(result.error.message);
            return;
          }
          setNote("");
          setSavedMessage(labels.saved);
          await onAdded?.();
          router.refresh();
        });
      }}
    >
      <label>
        <span className={ADMIN_LABEL}>{labels.note}</span>
        <textarea
          value={note}
          onChange={(event) => {
            setNote(event.target.value);
            setSavedMessage(null);
          }}
          rows={3}
          maxLength={ORDER_OPERATOR_NOTE_MAX_LENGTH}
          required
          className={ADMIN_TEXTAREA}
          placeholder={labels.placeholder}
          disabled={isPending}
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          size="field"
          disabled={isPending || note.trim().length === 0}
          className="gap-2"
        >
          <Send className="h-4 w-4" aria-hidden />
          {isPending ? copy.common.saving : labels.addNote}
        </Button>
        {savedMessage ? (
          <p className="text-sm text-brand-forest">{savedMessage}</p>
        ) : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
      </div>
    </form>
  );
}
