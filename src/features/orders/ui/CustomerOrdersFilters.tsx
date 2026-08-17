"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Search } from "lucide-react";

import { SelectDropdown } from "@/components/ui/SelectDropdown";
import type { OrderStatus } from "@/features/orders/domain/order-status";
import type { PaymentStatus } from "@/features/orders/domain/payment-status";

const ORDER_STATUS_FILTERS = [
  { label: "Pending", value: "PENDING" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Completed", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
] as const satisfies ReadonlyArray<{ label: string; value: OrderStatus }>;

const PAYMENT_STATUS_FILTERS = [
  { label: "Paid", value: "CAPTURED" },
  { label: "Pending", value: "PENDING" },
  { label: "Failed", value: "FAILED" },
] as const satisfies ReadonlyArray<{ label: string; value: PaymentStatus }>;

type CustomerOrdersFiltersProps = {
  total: number;
  status?: OrderStatus;
  paymentStatus?: string;
  q?: string;
};

export function CustomerOrdersFilters({
  total,
  status,
  paymentStatus,
  q,
}: CustomerOrdersFiltersProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [statusValue, setStatusValue] = useState(status ?? "");
  const [paymentValue, setPaymentValue] = useState(paymentStatus ?? "");

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
        className="relative z-[2] flex flex-col gap-3 lg:flex-row lg:flex-nowrap lg:items-center"
      >
        <SelectDropdown
          name="status"
          ariaLabel="Order status"
          value={statusValue}
          allLabel="All statuses"
          options={ORDER_STATUS_FILTERS}
          className="w-full lg:w-[180px] lg:shrink-0"
          onValueChange={applyStatus}
        />
        <SelectDropdown
          name="paymentStatus"
          ariaLabel="Payment status"
          value={paymentValue}
          allLabel="All payment statuses"
          options={PAYMENT_STATUS_FILTERS}
          className="w-full lg:w-[200px] lg:shrink-0"
          onValueChange={applyPayment}
        />
        <div
          className="flex h-11 min-w-0 items-center gap-2.5 rounded-2xl border border-white/50 bg-white/15 px-4 shadow-sm backdrop-blur-sm transition-colors hover:border-white/70 focus-within:border-white/80 lg:flex-1 lg:shrink"
        >
          <Search className="h-4 w-4 shrink-0 text-white" aria-hidden />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search by order #"
            className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/60"
            aria-label="Search orders"
          />
        </div>
      </form>
      <div className="relative z-[2] mt-4 border-t border-white/35 pt-3">
        <p className="text-sm text-white">Total orders: {total}</p>
      </div>
    </section>
  );
}
