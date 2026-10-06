import { NotebookPen } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { ADMIN_SECTION_TITLE } from "@/features/admin/ui/admin-form-classes";
import type { OrderOperatorNote } from "@/features/orders/domain/operator-note";
import { OrderOperatorNotesList } from "@/features/orders/ui/OrderOperatorNotesList";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AdminUserOrderNotesProps = {
  locale: string;
  notes: OrderOperatorNote[];
  copy: Dictionary["admin"];
};

/** Operator notes left on this customer's orders (admin user detail page). */
export function AdminUserOrderNotes({ locale, notes, copy }: AdminUserOrderNotesProps) {
  const labels = copy.users.detail.orderNotes;

  return (
    <Card className="mb-4 p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-forest/10 text-brand-forest">
          <NotebookPen className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 className={ADMIN_SECTION_TITLE}>{labels.title}</h2>
          <p className="mt-1 text-sm text-gray-600">{labels.hint}</p>
        </div>
      </div>
      <OrderOperatorNotesList
        notes={notes}
        emptyLabel={labels.empty}
        orderHrefPrefix={`/${locale}/admin/orders`}
        locale={locale}
        deleteLabel={copy.common.delete}
        deleteFailedLabel={copy.orders.notes.deleteFailed}
        confirm={copy.confirm}
      />
    </Card>
  );
}
