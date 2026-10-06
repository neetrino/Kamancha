import Link from "next/link";

import {
  formatYerevanDate,
  formatYerevanTime,
} from "@/features/delivery/domain/delivery-schedule";
import { formatYmdForDisplay } from "@/lib/calendar/format-date-display";
import type { OrderOperatorNote } from "@/features/orders/domain/operator-note";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { DeleteOperatorNoteButton } from "@/features/orders/ui/DeleteOperatorNoteButton";

type OrderOperatorNotesListProps = {
  notes: OrderOperatorNote[];
  emptyLabel: string;
  /** When set, each note links to its order detail page. */
  orderHrefPrefix?: string;
  /** Admin surfaces pass locale so each note can be deleted. */
  locale?: string;
  deleteLabel?: string;
  deleteFailedLabel?: string;
  confirm?: Dictionary["admin"]["confirm"];
  onDeleted?: (noteId: string) => void;
};

/** Read-only list of operator notes (order detail and customer profile). */
export function OrderOperatorNotesList({
  notes,
  emptyLabel,
  orderHrefPrefix,
  locale,
  deleteLabel,
  deleteFailedLabel,
  confirm,
  onDeleted,
}: OrderOperatorNotesListProps) {
  if (notes.length === 0) {
    if (!emptyLabel) return null;
    return <p className="text-sm text-gray-600">{emptyLabel}</p>;
  }

  return (
    <ol className="space-y-3">
      {notes.map((note) => (
        <li
          key={note.id}
          className="relative rounded-lg border border-gray-200 p-3 pr-10 pb-8 text-sm"
        >
          {locale && deleteLabel && deleteFailedLabel && confirm ? (
            <DeleteOperatorNoteButton
              locale={locale}
              noteId={note.id}
              noteBody={note.body}
              label={deleteLabel}
              failedLabel={deleteFailedLabel}
              confirm={confirm}
              onDeleted={onDeleted}
            />
          ) : null}
          <p className="whitespace-pre-wrap text-gray-900">{note.body}</p>
          <p className="absolute right-2 bottom-2 flex flex-wrap items-center justify-end gap-x-2 text-xs text-gray-500">
            {orderHrefPrefix ? (
              <Link
                href={`${orderHrefPrefix}/${encodeURIComponent(note.orderNumber)}`}
                className="font-medium text-gray-700 hover:underline"
              >
                {note.orderNumber}
              </Link>
            ) : null}
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
              {formatYmdForDisplay(formatYerevanDate(note.createdAt))},{" "}
              {formatYerevanTime(note.createdAt)}
            </span>
          </p>
        </li>
      ))}
    </ol>
  );
}
