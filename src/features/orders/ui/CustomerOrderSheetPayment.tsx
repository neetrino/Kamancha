"use client";

import type { ReactNode } from "react";

import { computeCashChangeDue } from "@/features/delivery/domain/cash-change";
import type { AdminOrderDetailView } from "@/features/orders/application/order-detail-view";
import { formatOrderDrawerMoney } from "@/features/orders/ui/order-drawer-format";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type DrawerLabels = Dictionary["admin"]["orders"]["drawer"];

type CustomerOrderSheetPaymentProps = {
  detail: AdminOrderDetailView;
  labels: DrawerLabels;
};

/** Payment method, amount, and optional cash-change rows for the order sheet. */
export function CustomerOrderSheetPayment({
  detail,
  labels,
}: CustomerOrderSheetPaymentProps) {
  const changeDue =
    detail.cashChangeAmount != null
      ? computeCashChangeDue(detail.cashChangeAmount, detail.paymentAmount)
      : null;

  return (
    <div className="space-y-1.5 border-t border-gray-100 pt-3 text-sm">
      <PaymentRow label={labels.method} value={detail.paymentMethod} />
      {detail.cashChangeAmount != null ? (
        <>
          <PaymentRow
            label={labels.customerPays}
            value={formatOrderDrawerMoney(
              detail.cashChangeAmount,
              detail.baseCurrency,
            )}
          />
          {changeDue != null ? (
            <PaymentRow
              label={labels.prepareChange}
              value={
                <span className="inline-flex items-center gap-2">
                  {detail.cashChangeImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- CDN/local media URL
                    <img
                      src={detail.cashChangeImageUrl}
                      alt=""
                      className="h-8 w-12 rounded object-contain"
                    />
                  ) : null}
                  {formatOrderDrawerMoney(changeDue, detail.baseCurrency)}
                </span>
              }
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function PaymentRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-1.5 text-gray-900">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </p>
  );
}
