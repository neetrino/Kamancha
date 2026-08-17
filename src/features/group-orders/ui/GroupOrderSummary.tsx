"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Users } from "lucide-react";

import type {
  GroupOrderDetailView,
  GroupOrderParticipantView,
} from "@/features/group-orders/application/queries";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

const SUMMARY_HEADER_GAP_PX = 16;
const SUMMARY_FALLBACK_TOP_PX = 140;

function useSummaryStickyTop(): number {
  const [top, setTop] = useState(SUMMARY_FALLBACK_TOP_PX);

  useEffect(() => {
    function update(): void {
      const header = document.querySelector<HTMLElement>("[data-site-header]");
      if (!header) {
        setTop(SUMMARY_FALLBACK_TOP_PX);
        return;
      }
      setTop(
        Math.round(header.getBoundingClientRect().bottom + SUMMARY_HEADER_GAP_PX),
      );
    }

    update();
    window.addEventListener("resize", update);
    const header = document.querySelector("[data-site-header]");
    const observer = header ? new ResizeObserver(update) : null;
    if (header && observer) observer.observe(header);

    return () => {
      window.removeEventListener("resize", update);
      observer?.disconnect();
    };
  }, []);

  return top;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-white">
      <span>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

type GroupOrderSummaryProps = {
  labels: Dictionary["groupOrder"];
  view: GroupOrderDetailView;
  currentParticipant: GroupOrderParticipantView | undefined;
  actions?: ReactNode;
};

export function GroupOrderSummary({
  labels,
  view,
  currentParticipant,
  actions,
}: GroupOrderSummaryProps) {
  const stickyTop = useSummaryStickyTop();
  const deliveryValue = view.deliveryDistanceLabel
    ? `${view.deliveryFormatted} · ${view.deliveryDistanceLabel}`
    : view.deliveryFormatted;
  const showDeliveryShare =
    view.paymentMode === "SPLIT_PER_PARTICIPANT" &&
    view.currentParticipantId != null &&
    currentParticipant != null;

  return (
    <div
      className="w-full space-y-3 lg:sticky lg:self-start"
      style={{ top: stickyTop }}
    >
      <section className="liquid-glass isolate overflow-hidden rounded-3xl px-5 py-6 sm:px-6 sm:py-7">
        <h2 className="relative z-[2] mb-6 flex items-start gap-2 font-big-fat-boii text-xl font-normal tracking-wide text-white uppercase">
          <Users
            className="mt-1 h-5 w-5 shrink-0"
            strokeWidth={2.75}
            aria-hidden
          />
          <span>
            {view.paymentMode === "ORGANIZER_PAYS_ALL"
              ? labels.payingOrganizer.replace(
                  "{name}",
                  view.organizerDisplayName,
                )
              : labels.payingSplit}
          </span>
        </h2>

        <div className="relative z-[2] space-y-4">
          <SummaryRow
            label={labels.subtotal}
            value={view.merchandiseTotalFormatted}
          />
          <SummaryRow
            label={labels.limitRowLabel}
            value={view.spendLimitFormatted ?? labels.noLimit}
          />
          <SummaryRow
            label={labels.deliveryAddressLabel}
            value={view.deliveryAddress ?? labels.noDeliveryAddress}
          />
          <SummaryRow label={labels.delivery} value={deliveryValue} />
          {showDeliveryShare && currentParticipant ? (
            <SummaryRow
              label={labels.yourDeliveryShare}
              value={currentParticipant.deliveryShareFormatted}
            />
          ) : null}
          <div className="border-t border-white/40 pt-4">
            <div className="flex justify-between text-lg font-bold text-white">
              <span>{labels.total}</span>
              <span>{view.grandTotalFormatted}</span>
            </div>
          </div>
        </div>
      </section>
      {actions}
    </div>
  );
}
