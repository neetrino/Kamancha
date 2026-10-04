import { CalendarDays } from "lucide-react";

import { KamanchaPillButton } from "@/components/ui/KamanchaPillButton";
import { formatDeliverySlotDisplay } from "@/features/delivery/domain/delivery-schedule";
import type { SelectedDeliverySlot } from "@/features/delivery/domain/delivery-schedule";

export type DeliverySlotSummaryLabels = {
  deliverTo: string;
  approximatelyOneHour: string;
  change: string;
  pickDate: string;
};

type DeliverySlotSummaryProps = {
  labels: DeliverySlotSummaryLabels;
  useAsap: boolean;
  selected: SelectedDeliverySlot | null;
  disabled: boolean;
  onChangeClick: () => void;
};

/** Collapsed ASAP / scheduled delivery row for checkout. */
export function DeliverySlotSummary({
  labels,
  useAsap,
  selected,
  disabled,
  onChangeClick,
}: DeliverySlotSummaryProps) {
  const detail = useAsap
    ? labels.approximatelyOneHour
    : selected
      ? formatDeliverySlotDisplay(
          selected.date,
          selected.startTime,
          selected.endTime,
        )
      : labels.pickDate;

  return (
    <div className="flex items-center gap-3">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50"
        aria-hidden
      >
        <CalendarDays className="h-5 w-5 text-red-500" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-900">{labels.deliverTo}</p>
        <p className="truncate text-sm font-semibold text-gray-900">{detail}</p>
      </div>
      <KamanchaPillButton
        type="button"
        variant="light"
        size="compact"
        label={labels.change}
        disabled={disabled}
        onClick={onChangeClick}
        className="!hidden !min-h-10 !w-auto shrink-0 !bg-red-500 !px-6 !text-sm !text-white shadow-md hover:!bg-red-600 focus-visible:!bg-red-600 sm:!inline-flex"
      />
    </div>
  );
}
