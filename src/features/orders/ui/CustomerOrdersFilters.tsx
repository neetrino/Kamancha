"use client";

import { useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { Search } from "lucide-react";

import { SelectDropdown } from "@/components/ui/SelectDropdown";
import type { OrderStatus } from "@/features/orders/domain/order-status";
import type { PaymentStatus } from "@/features/orders/domain/payment-status";
import type { CustomerOrderKind } from "@/features/orders/schemas/change-status";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type CustomerOrdersFiltersProps = {
  total: number;
  totalLabel: string;
  status?: OrderStatus;
  paymentStatus?: string;
  kind?: CustomerOrderKind;
  q?: string;
  copy: Dictionary["admin"]["orders"]["filters"];
  searchPlaceholder: string;
  searchAria: string;
  /** Kind pills (All / Personal / Group) — shown on one line with the total. */
  kindFilter?: ReactNode;
};

export function CustomerOrdersFilters({
  total,
  totalLabel,
  status,
  paymentStatus,
  kind = "all",
  q,
  copy,
  searchPlaceholder,
  searchAria,
  kindFilter,
}: CustomerOrdersFiltersProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [statusValue, setStatusValue] = useState(status ?? "");
  const [paymentValue, setPaymentValue] = useState(paymentStatus ?? "");

  const orderStatusFilters = [
    { label: copy.statusPending, value: "PENDING" as OrderStatus },
    { label: copy.statusProcessing, value: "PROCESSING" as OrderStatus },
    { label: copy.statusCompleted, value: "DELIVERED" as OrderStatus },
    { label: copy.statusCancelled, value: "CANCELLED" as OrderStatus },
  ];

  const paymentStatusFilters = [
    { label: copy.paymentPaid, value: "CAPTURED" as PaymentStatus },
    { label: copy.paymentPending, value: "PENDING" as PaymentStatus },
    { label: copy.paymentFailed, value: "FAILED" as PaymentStatus },
  ];

  function applyStatus(next: string): void {
    flushSync(() => setStatusValue(next));
    formRef.current?.requestSubmit();
  }

  function applyPayment(next: string): void {
    flushSync(() => setPaymentValue(next));
    formRef.current?.requestSubmit();
  }

  return (
    <section className="liquid-glass isolate overflow-visible rounded-3xl px-5 py-6 sm:px-6 sm:py-7">
      <form
        ref={formRef}
        method="get"
        className="relative z-[2] flex flex-col gap-3 xl:flex-row xl:flex-nowrap xl:items-center"
      >
        {kind !== "all" ? (
          <input type="hidden" name="kind" value={kind} />
        ) : null}
        <SelectDropdown
          name="status"
          ariaLabel={copy.orderStatusAria}
          value={statusValue}
          allLabel={copy.allStatuses}
          options={orderStatusFilters}
          className="w-full shrink-0 xl:w-auto"
          fitContent
          onValueChange={applyStatus}
        />
        <SelectDropdown
          name="paymentStatus"
          ariaLabel={copy.paymentStatusAria}
          value={paymentValue}
          allLabel={copy.allPaymentStatuses}
          options={paymentStatusFilters}
          className="w-full shrink-0 xl:w-auto"
          fitContent
          onValueChange={applyPayment}
        />
        <div
          className="flex h-11 min-w-0 items-center gap-2.5 rounded-2xl border border-white/50 bg-white/15 px-4 shadow-sm backdrop-blur-sm transition-colors hover:border-white/70 focus-within:border-white/80 xl:flex-1 xl:shrink"
        >
          <Search className="h-4 w-4 shrink-0 text-white" aria-hidden />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder={searchPlaceholder}
            className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/60"
            aria-label={searchAria}
          />
        </div>
      </form>
      <div className="relative z-[2] mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/35 pt-3">
        {kindFilter}
        <p className="text-sm text-white">
          {totalLabel}: {total}
        </p>
      </div>
    </section>
  );
}
