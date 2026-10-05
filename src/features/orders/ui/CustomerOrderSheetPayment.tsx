"use client";

import { Banknote, Coins, Wallet } from "lucide-react";

import { computeCashChangeDue } from "@/features/delivery/domain/cash-change";
import type { AdminOrderDetailView } from "@/features/orders/application/order-detail-view";
import { formatOrderDrawerMoney } from "@/features/orders/ui/order-drawer-format";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type DrawerLabels = Dictionary["admin"]["orders"]["drawer"];

type CustomerOrderSheetPaymentProps = {
  detail: AdminOrderDetailView;
  labels: DrawerLabels;
  /** Hide order-level method when each group participant pays separately. */
  hideMethod?: boolean;
  /** Desktop admin sheet uses cards. Profile and mobile stay as text rows. */
  cards?: boolean;
};

/** Payment method, amount, and optional cash-change rows for the order sheet. */
export function CustomerOrderSheetPayment({
  detail,
  labels,
  hideMethod = false,
  cards = false,
}: CustomerOrderSheetPaymentProps) {
  const changeDue =
    detail.cashChangeAmount != null
      ? computeCashChangeDue(detail.cashChangeAmount, detail.paymentAmount)
      : null;

  if (hideMethod && detail.cashChangeAmount == null) {
    return null;
  }

  const rows = (
    <div className={`space-y-1.5 border-t border-gray-100 pt-3 text-sm ${cards ? "sm:hidden" : ""}`}>
      {hideMethod ? null : (
        <PaymentRow label={labels.method} value={detail.paymentMethod} />
      )}
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
              value={formatOrderDrawerMoney(changeDue, detail.baseCurrency)}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );

  if (!cards) return rows;

  return (
    <>
      {rows}
      <div className="hidden gap-2 border-t border-gray-100 pt-3 sm:grid sm:grid-cols-3">
      {hideMethod ? null : (
        <PaymentCard
          icon="wallet"
          label={labels.method}
          value={detail.paymentMethod}
        />
      )}
      {detail.cashChangeAmount != null ? (
        <PaymentCard
          icon="banknote"
          label={labels.customerPays}
          value={formatOrderDrawerMoney(
            detail.cashChangeAmount,
            detail.baseCurrency,
          )}
        />
      ) : null}
      {changeDue != null ? (
        <PaymentCard
          icon="coins"
          label={labels.prepareChange}
          value={formatOrderDrawerMoney(changeDue, detail.baseCurrency)}
        />
      ) : null}
    </div>
    </>
  );
}

function PaymentRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-1.5 text-gray-900">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </p>
  );
}

function PaymentCard({
  icon,
  label,
  value,
}: {
  icon?: "wallet" | "banknote" | "coins";
  label: string;
  value: string;
}) {
  const Icon =
    icon === "coins" ? Coins : icon === "banknote" ? Banknote : icon === "wallet" ? Wallet : null;
  return (
    <div className="min-w-0 rounded-2xl bg-white px-3 py-2.5 shadow-sm ring-1 ring-gray-100">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
        {Icon ? <Icon className="size-4 shrink-0 text-brand-forest" aria-hidden /> : null}
        <span>{value}</span>
      </p>
    </div>
  );
}
