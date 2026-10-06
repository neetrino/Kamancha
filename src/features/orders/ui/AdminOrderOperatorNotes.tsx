"use client";

import { ChevronDown, MessageSquareText } from "lucide-react";
import { useState } from "react";

import { Card } from "@/components/ui/Card";
import { ADMIN_SECTION_TITLE } from "@/features/admin/ui/admin-form-classes";
import type { OrderOperatorNote } from "@/features/orders/domain/operator-note";
import { AddOrderNoteForm } from "@/features/orders/ui/AddOrderNoteForm";
import { OrderOperatorNotesList } from "@/features/orders/ui/OrderOperatorNotesList";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AdminOrderOperatorNotesProps = {
  locale: string;
  orderNumber: string;
  notes: OrderOperatorNote[];
  copy: Dictionary["admin"];
};

/** Operator notes card on the admin order detail page. */
export function AdminOrderOperatorNotes({
  locale,
  orderNumber,
  notes,
  copy,
}: AdminOrderOperatorNotesProps) {
  const labels = copy.orders.notes;
  const [open, setOpen] = useState(true);

  return (
    <Card className="mb-6 p-6">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center gap-4 text-left ${open ? "mb-4" : ""}`}
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-forest/10 text-brand-forest">
          <MessageSquareText className="h-5 w-5" aria-hidden />
        </span>
        <span className={`min-w-0 flex-1 ${ADMIN_SECTION_TITLE}`}>{labels.title}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-gray-500 transition-transform ${open ? "" : "-rotate-90"}`}
          aria-hidden
        />
      </button>
      {open ? (
        <>
          <AddOrderNoteForm locale={locale} orderNumber={orderNumber} copy={copy} />
          <div className="mt-5">
            <OrderOperatorNotesList
              notes={notes}
              emptyLabel=""
              locale={locale}
              deleteLabel={copy.common.delete}
              deleteFailedLabel={labels.deleteFailed}
              confirm={copy.confirm}
            />
          </div>
        </>
      ) : null}
    </Card>
  );
}
