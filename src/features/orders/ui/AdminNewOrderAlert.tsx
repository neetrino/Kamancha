"use client";

import { createPortal } from "react-dom";

import { useAdminOrderAlertsContext } from "@/features/orders/ui/AdminOrderAlertsContext";
import { formatOrderDrawerMoney } from "@/features/orders/ui/order-drawer-format";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AlertCopy = Dictionary["admin"]["orders"]["newAlert"];

type AdminNewOrderAlertProps = {
  locale: string;
  copy: AlertCopy;
};

function formatAlertPlacedAt(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/** Popup matching the new-order alert mock (sound handled by the provider). */
export function AdminNewOrderAlert({ locale, copy }: AdminNewOrderAlertProps) {
  const { unseenCount, latest, popupOpen, dismissPopup } =
    useAdminOrderAlertsContext();

  if (
    typeof document === "undefined" ||
    !popupOpen ||
    !latest ||
    unseenCount <= 0
  ) {
    return null;
  }

  const rows: Array<{ label: string; value: string }> = [
    { label: copy.customer, value: latest.contactName },
    {
      label: copy.total,
      value: formatOrderDrawerMoney(latest.totalAmount, latest.baseCurrency),
    },
    { label: copy.payment, value: latest.paymentMethod },
    {
      label: copy.time,
      value: formatAlertPlacedAt(latest.placedAt, locale),
    },
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center bg-black/35 p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="admin-new-order-alert-title"
      aria-describedby="admin-new-order-alert-desc"
    >
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl sm:p-8">
        <p className="font-big-fat-boii text-sm font-normal tracking-wide text-brand-forest uppercase">
          {copy.heading.replace("{count}", String(unseenCount))}
        </p>
        <h2
          id="admin-new-order-alert-title"
          className="mt-2 text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl"
        >
          {copy.orderTitle.replace("{orderNumber}", latest.orderNumber)}
        </h2>
        <dl
          id="admin-new-order-alert-desc"
          className="mt-5 divide-y divide-gray-100"
        >
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-baseline justify-between gap-4 py-3 text-sm"
            >
              <dt className="text-gray-500">{row.label}</dt>
              <dd className="text-right font-medium text-gray-950">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
        <button
          type="button"
          onClick={dismissPopup}
          className="mt-6 inline-flex w-full items-center justify-center rounded-[18px] bg-brand-forest px-4 py-3.5 text-sm font-semibold text-white shadow-sm ring-2 ring-inset ring-white/70 transition hover:bg-brand-forest/90"
        >
          {copy.acknowledge.replace("{count}", String(unseenCount))}
        </button>
      </div>
    </div>,
    document.body,
  );
}
