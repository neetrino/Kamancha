"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";

import { Card } from "@/components/ui/Card";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { AdminSearchInput } from "@/features/admin/ui/AdminSearchInput";
import {
  GROUP_ORDER_PAYMENT_MODES,
  GROUP_ORDER_STATUSES,
  type GroupOrderPaymentMode,
  type GroupOrderStatus,
} from "@/features/group-orders/domain/status";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type FilterCopy = Dictionary["admin"]["groupOrders"]["filters"];

type AdminGroupOrdersFiltersProps = {
  total: number;
  q?: string;
  status?: GroupOrderStatus;
  paymentMode?: GroupOrderPaymentMode;
  copy: FilterCopy;
};

const STATUS_LABEL_KEYS = {
  OPEN: "statusOpen",
  LOCKED: "statusLocked",
  AWAITING_PAYMENTS: "statusAwaitingPayments",
  CHECKOUT: "statusCheckout",
  PARTIALLY_PAID: "statusPartiallyPaid",
  PAID: "statusPaid",
  PREPARING: "statusPreparing",
  COMPLETED: "statusCompleted",
  EXPIRED: "statusExpired",
  CANCELLED: "statusCancelled",
} as const satisfies Record<GroupOrderStatus, keyof FilterCopy>;

export function AdminGroupOrdersFilters({
  total,
  q,
  status,
  paymentMode,
  copy,
}: AdminGroupOrdersFiltersProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [statusValue, setStatusValue] = useState(status ?? "");
  const [modeValue, setModeValue] = useState(paymentMode ?? "");

  const statusOptions = GROUP_ORDER_STATUSES.map((value) => ({
    value,
    label: copy[STATUS_LABEL_KEYS[value]],
  }));

  const modeOptions = GROUP_ORDER_PAYMENT_MODES.map((value) => ({
    value,
    label:
      value === "ORGANIZER_PAYS_ALL"
        ? copy.modeOrganizerPays
        : copy.modeSplit,
  }));

  function applyStatus(next: string): void {
    flushSync(() => setStatusValue(next));
    formRef.current?.requestSubmit();
  }

  function applyMode(next: string): void {
    flushSync(() => setModeValue(next));
    formRef.current?.requestSubmit();
  }

  return (
    <Card className="mb-6 overflow-visible">
      <form
        ref={formRef}
        method="get"
        className="flex flex-col gap-3 p-4 sm:flex-row sm:flex-nowrap sm:items-center"
      >
        <SelectDropdown
          name="status"
          ariaLabel={copy.statusAria}
          value={statusValue}
          allLabel={copy.allStatuses}
          options={statusOptions}
          className="w-full shrink-0 sm:w-auto"
          fitContent
          onValueChange={applyStatus}
        />
        <SelectDropdown
          name="paymentMode"
          ariaLabel={copy.modeAria}
          value={modeValue}
          allLabel={copy.allModes}
          options={modeOptions}
          className="w-full shrink-0 sm:w-auto"
          fitContent
          onValueChange={applyMode}
        />
        <AdminSearchInput
          name="q"
          defaultValue={q ?? ""}
          placeholder={copy.searchPlaceholder}
          className="min-w-0 flex-1"
          aria-label={copy.searchAria}
        />
      </form>
      <div className="border-t border-gray-100 px-4 py-3">
        <p className="text-sm text-gray-600">
          {copy.total.replace("{total}", String(total))}
        </p>
      </div>
    </Card>
  );
}
