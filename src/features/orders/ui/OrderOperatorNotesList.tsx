import Link from "next/link";

import type { OrderOperatorNote } from "@/features/orders/domain/operator-note";

type OrderOperatorNotesListProps = {
  notes: OrderOperatorNote[];
  emptyLabel: string;
  utcLabel: string;
  /** When set, each note links to its order detail page. */
  orderHrefPrefix?: string;
};

/** Read-only list of operator notes (order detail and customer profile). */
export function OrderOperatorNotesList({
  notes,
  emptyLabel,
  utcLabel,
  orderHrefPrefix,
}: OrderOperatorNotesListProps) {
  if (notes.length === 0) {
    return <p className="text-sm text-gray-600">{emptyLabel}</p>;
  }

  return (
    <ol className="space-y-3">
      {notes.map((note) => (
        <li
          key={note.id}
          className="rounded-lg border border-gray-200 p-3 text-sm"
        >
          <p className="whitespace-pre-wrap text-gray-900">{note.body}</p>
          <p className="mt-1 flex flex-wrap gap-x-2 text-xs text-gray-500">
            {orderHrefPrefix ? (
              <Link
                href={`${orderHrefPrefix}/${encodeURIComponent(note.orderNumber)}`}
                className="font-medium text-gray-700 hover:underline"
              >
                {note.orderNumber}
              </Link>
            ) : null}
            {note.authorName ? <span>{note.authorName}</span> : null}
            <span>
              {note.createdAt.toISOString().slice(0, 16).replace("T", " ")}{" "}
              {utcLabel}
            </span>
          </p>
        </li>
      ))}
    </ol>
  );
}
