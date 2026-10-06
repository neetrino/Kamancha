import { MessageSquareText } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { ADMIN_SECTION_TITLE } from "@/features/admin/ui/admin-form-classes";
import type { OrderOperatorNote } from "@/features/orders/domain/operator-note";
import { AddOrderNoteForm } from "@/features/orders/ui/AddOrderNoteForm";
import { OrderOperatorNotesList } from "@/features/orders/ui/OrderOperatorNotesList";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AdminOrderOperatorNotesProps = {
  locale: string;
  orderNumber: string;
  /** Guest orders have no customer profile to mirror notes on. */
  hasCustomer: boolean;
  notes: OrderOperatorNote[];
  copy: Dictionary["admin"];
};

/** Operator notes card on the admin order detail page. */
export function AdminOrderOperatorNotes({
  locale,
  orderNumber,
  hasCustomer,
  notes,
  copy,
}: AdminOrderOperatorNotesProps) {
  const labels = copy.orders.notes;

  return (
    <Card className="mb-6 p-6">
      <div className="mb-4 flex items-center gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-forest/10 text-brand-forest">
          <MessageSquareText className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 className={ADMIN_SECTION_TITLE}>{labels.title}</h2>
          <p className="mt-1 text-sm text-gray-600">
            {hasCustomer ? labels.hint : labels.guestHint}
          </p>
        </div>
      </div>
      <AddOrderNoteForm locale={locale} orderNumber={orderNumber} copy={copy} />
      <div className="mt-5">
        <OrderOperatorNotesList
          notes={notes}
          emptyLabel={labels.empty}
          utcLabel={copy.common.utc}
        />
      </div>
    </Card>
  );
}
