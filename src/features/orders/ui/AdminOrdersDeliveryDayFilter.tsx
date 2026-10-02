"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { AdminDatePickerField } from "@/features/admin/ui/AdminDatePickerField";
import { formatYerevanDate } from "@/features/delivery/domain/delivery-schedule";
import { addCalendarDaysYmd } from "@/features/orders/domain/admin-delivery-day";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type DeliveryDayPreset = "all" | "today" | "tomorrow" | "custom";

type AdminOrdersDeliveryDayFilterProps = {
  locale: string;
  deliveryDate?: string;
  baseQuery: Record<string, string | undefined>;
  copy: Dictionary["admin"];
};

function resolvePreset(
  deliveryDate: string | undefined,
  today: string,
  tomorrow: string,
): DeliveryDayPreset {
  if (!deliveryDate) return "all";
  if (deliveryDate === today) return "today";
  if (deliveryDate === tomorrow) return "tomorrow";
  return "custom";
}

function hrefForDeliveryDate(
  locale: string,
  deliveryDate: string | undefined,
  baseQuery: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(baseQuery)) {
    if (value) params.set(key, value);
  }
  if (deliveryDate) {
    params.set("deliveryDate", deliveryDate);
  }
  params.set("page", "1");
  const query = params.toString();
  return query
    ? `/${locale}/admin/orders?${query}`
    : `/${locale}/admin/orders`;
}

/**
 * Admin orders filter by scheduled delivery day — All / Today / Tomorrow / date.
 */
export function AdminOrdersDeliveryDayFilter({
  locale,
  deliveryDate,
  baseQuery,
  copy,
}: AdminOrdersDeliveryDayFilterProps) {
  const router = useRouter();
  const labels = copy.orders.deliveryDayFilter;
  const today = formatYerevanDate(new Date());
  const tomorrow = addCalendarDaysYmd(today, 1);
  const preset = resolvePreset(deliveryDate, today, tomorrow);
  const [customDate, setCustomDate] = useState(
    preset === "custom" && deliveryDate ? deliveryDate : "",
  );

  const options: Array<{ value: DeliveryDayPreset; label: string }> = [
    { value: "all", label: labels.all },
    { value: "today", label: labels.today },
    { value: "tomorrow", label: labels.tomorrow },
    { value: "custom", label: labels.pickDate },
  ];

  function navigate(nextDate: string | undefined): void {
    router.push(hrefForDeliveryDate(locale, nextDate, baseQuery));
  }

  function onPresetSelect(next: DeliveryDayPreset): void {
    if (next === "all") {
      setCustomDate("");
      navigate(undefined);
      return;
    }
    if (next === "today") {
      setCustomDate("");
      navigate(today);
      return;
    }
    if (next === "tomorrow") {
      setCustomDate("");
      navigate(tomorrow);
      return;
    }
    if (customDate) {
      navigate(customDate);
    }
  }

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <SegmentedControl
        aria-label={labels.aria}
        value={preset}
        options={options}
        onSelect={onPresetSelect}
      />
      {preset === "custom" ? (
        <div className="w-full max-w-[180px] sm:w-auto">
          <AdminDatePickerField
            name="deliveryDate"
            value={customDate}
            onChange={(value) => {
              setCustomDate(value);
              if (value) navigate(value);
            }}
            locale={locale}
            common={copy.common}
            labels={{ placeholder: labels.datePlaceholder }}
          />
        </div>
      ) : null}
    </div>
  );
}
