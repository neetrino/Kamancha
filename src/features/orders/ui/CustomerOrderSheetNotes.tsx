import type { OrderOperatorNote } from "@/features/orders/domain/operator-note";
import { OrderOperatorNotesList } from "@/features/orders/ui/OrderOperatorNotesList";
import { PROFILE_INNER_CARD } from "@/features/profile/ui/profile-surface";

type CustomerOrderSheetNotesProps = {
  notes: OrderOperatorNote[];
  title: string;
  utcLabel: string;
};

/** Read-only operator notes in the customer profile order drawer. */
export function CustomerOrderSheetNotes({
  notes,
  title,
  utcLabel,
}: CustomerOrderSheetNotesProps) {
  return (
    <section className={`${PROFILE_INNER_CARD} space-y-3 p-4`}>
      <h3 className="font-big-fat-boii text-sm font-normal tracking-wide text-gray-900 uppercase">
        {title}
      </h3>
      <OrderOperatorNotesList notes={notes} emptyLabel="" utcLabel={utcLabel} />
    </section>
  );
}
