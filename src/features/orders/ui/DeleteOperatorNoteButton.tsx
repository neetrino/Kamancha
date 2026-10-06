"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deleteOrderNoteAction } from "@/features/orders/application/delete-order-note";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type DeleteOperatorNoteButtonProps = {
  locale: string;
  noteId: string;
  noteBody: string;
  label: string;
  failedLabel: string;
  confirm: Dictionary["admin"]["confirm"];
  onDeleted?: (noteId: string) => void;
};

function notePreview(body: string): string {
  const singleLine = body.replace(/\s+/g, " ").trim();
  if (singleLine.length <= 48) return singleLine;
  return `${singleLine.slice(0, 48)}…`;
}

/** Corner control that removes one operator note from the admin panel. */
export function DeleteOperatorNoteButton({
  locale,
  noteId,
  noteBody,
  label,
  failedLabel,
  confirm,
  onDeleted,
}: DeleteOperatorNoteButtonProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function confirmDelete(): void {
    startTransition(async () => {
      setError(null);
      const result = await deleteOrderNoteAction(locale, { noteId });
      if (!result.ok) {
        setError(failedLabel);
        setConfirmOpen(false);
        return;
      }
      setConfirmOpen(false);
      onDeleted?.(noteId);
      router.refresh();
    });
  }

  return (
    <span className="absolute top-2 right-2">
      <button
        type="button"
        aria-label={label}
        disabled={isPending}
        onClick={() => setConfirmOpen(true)}
        className="rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" aria-hidden />
      </button>
      <ConfirmDialog
        open={confirmOpen}
        title={confirm.deleteTitle}
        description={confirm.deleteEntity
          .replace("{entity}", confirm.entityLabels.note)
          .replace("{name}", notePreview(noteBody))}
        confirmLabel={confirm.confirmLabel}
        cancelLabel={confirm.cancelLabel}
        isPending={isPending}
        onClose={() => {
          if (!isPending) setConfirmOpen(false);
        }}
        onConfirm={confirmDelete}
      />
      {error ? (
        <span
          role="alert"
          className="absolute top-8 right-0 w-max max-w-40 text-right text-xs text-red-600"
        >
          {error}
        </span>
      ) : null}
    </span>
  );
}
