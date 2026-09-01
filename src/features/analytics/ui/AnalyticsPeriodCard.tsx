"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { AdminDatePickerField } from "@/features/admin/ui/AdminDatePickerField";
import { ADMIN_LABEL } from "@/features/admin/ui/admin-form-classes";
import { ADMIN_CARD_CLASS } from "@/features/admin/ui/admin-ui";
import {
  ANALYTICS_PERIOD_PRESETS,
  formatAnalyticsDisplayDate,
  rangeForAnalyticsPeriod,
  type AnalyticsPeriodPreset,
} from "@/features/analytics/domain/date-range";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";

type AnalyticsPeriodCardProps = {
  locale: string;
  from: string;
  to: string;
  preset: AnalyticsPeriodPreset;
  exportQuery: string;
  rangeInvalid: boolean;
  copy: Dictionary["admin"];
};

function AnalyticsPeriodCardForm({
  locale,
  from,
  to,
  preset,
  exportQuery,
  rangeInvalid,
  copy,
}: AnalyticsPeriodCardProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [forceCustom, setForceCustom] = useState(preset === "custom");
  const [customFrom, setCustomFrom] = useState(from);
  const [customTo, setCustomTo] = useState(to);
  const selectedPreset: AnalyticsPeriodPreset = forceCustom
    ? "custom"
    : preset;
  const resolvedLocale: Locale = isLocale(locale) ? locale : defaultLocale;

  const presetLabel = (next: AnalyticsPeriodPreset): string => {
    const map: Record<AnalyticsPeriodPreset, string> = {
      last_7_days: copy.analytics.period.last7Days,
      last_30_days: copy.analytics.period.last30Days,
      last_90_days: copy.analytics.period.last90Days,
      this_month: copy.analytics.period.thisMonth,
      custom: copy.analytics.period.customRange,
    };
    return map[next];
  };

  function navigate(nextFrom: string, nextTo: string): void {
    const params = new URLSearchParams({ from: nextFrom, to: nextTo });
    setForceCustom(false);
    startTransition(() => {
      router.push(`/${locale}/admin/analytics?${params.toString()}`);
    });
  }

  function onPeriodChange(value: string): void {
    const next = value as AnalyticsPeriodPreset;
    if (next === "custom") {
      setForceCustom(true);
      return;
    }
    const range = rangeForAnalyticsPeriod(next);
    navigate(range.from, range.to);
  }

  function onCustomSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const nextFrom = String(data.get("from") ?? "");
    const nextTo = String(data.get("to") ?? "");
    if (!nextFrom || !nextTo) {
      return;
    }
    navigate(nextFrom, nextTo);
  }

  return (
    <div className={`mb-3 ${ADMIN_CARD_CLASS} p-4 sm:p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            {copy.analytics.period.title}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <SelectDropdown
              ariaLabel={copy.analytics.period.aria}
              value={selectedPreset}
              options={ANALYTICS_PERIOD_PRESETS.map((option) => ({
                label: presetLabel(option),
                value: option,
              }))}
              disabled={pending}
              deferChange={false}
              fitContent
              className="shrink-0"
              onValueChange={onPeriodChange}
            />
            <p className="text-sm font-medium text-gray-700">
              {formatAnalyticsDisplayDate(from, resolvedLocale)} –{" "}
              {formatAnalyticsDisplayDate(to, resolvedLocale)}
            </p>
          </div>
        </div>
        <a
          href={`/api/exports/admin/analytics?${exportQuery}`}
          className="rounded-[12px] px-3 py-1.5 text-xs font-medium text-brand-forest ring-1 ring-brand-forest/20 hover:bg-brand-forest/5"
        >
          {copy.analytics.period.downloadCsv}
        </a>
      </div>

      {selectedPreset === "custom" ? (
        <form
          onSubmit={onCustomSubmit}
          className="mt-3 flex flex-wrap items-end gap-3"
        >
          <label className="min-w-[140px] flex-1">
            <span className={ADMIN_LABEL}>{copy.analytics.period.from}</span>
            <AdminDatePickerField
              name="from"
              value={customFrom}
              onChange={setCustomFrom}
              disabled={pending}
              locale={locale}
              common={copy.common}
            />
          </label>
          <label className="min-w-[140px] flex-1">
            <span className={ADMIN_LABEL}>{copy.analytics.period.to}</span>
            <AdminDatePickerField
              name="to"
              value={customTo}
              onChange={setCustomTo}
              disabled={pending}
              locale={locale}
              common={copy.common}
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="h-11 shrink-0 rounded-2xl bg-brand-forest px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {copy.analytics.period.apply}
          </button>
        </form>
      ) : null}

      {rangeInvalid ? (
        <p className="mt-3 text-sm text-red-700">
          {copy.analytics.period.invalidRange}
        </p>
      ) : null}
    </div>
  );
}

export function AnalyticsPeriodCard(props: AnalyticsPeriodCardProps) {
  return (
    <AnalyticsPeriodCardForm
      key={`${props.from}-${props.to}-${props.preset}`}
      {...props}
    />
  );
}
