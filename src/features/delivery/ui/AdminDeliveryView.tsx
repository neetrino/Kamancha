"use client";

import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";
import {
  ADMIN_INPUT,
  ADMIN_LABEL,
  ADMIN_PAGE_SUBTITLE,
  ADMIN_PAGE_TITLE,
} from "@/features/admin/ui/admin-form-classes";
import { useAdminSidebarCollapse } from "@/features/admin/ui/AdminSidebarCollapseContext";
import { saveDeliverySettingsAction } from "@/features/delivery/application/save-delivery-settings";
import type { CashChangeDenomination } from "@/features/delivery/domain/cash-change";
import type { StoreDeliverySettings } from "@/features/delivery/domain/delivery-settings";
import type { DeliveryScheduleSettings } from "@/features/delivery/domain/delivery-schedule";
import { timeToMinutes } from "@/features/delivery/domain/delivery-schedule";
import { AdminCashChangeEditor } from "@/features/delivery/ui/AdminCashChangeEditor";
import { AdminDeliveryScheduleEditor } from "@/features/delivery/ui/AdminDeliveryScheduleEditor";
import { formatMoneyAmount } from "@/lib/money/format";
import type { Locale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AdminDeliveryViewCopy = {
  delivery: Dictionary["admin"]["delivery"];
  common: Dictionary["admin"]["common"];
  confirm: Dictionary["admin"]["confirm"];
};

type AdminDeliveryViewProps = {
  locale: string;
  settings: StoreDeliverySettings;
  initialImageUrls: Record<string, string>;
  copy: AdminDeliveryViewCopy;
};

function minutesToTime(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function normalizeScheduleForSave(
  schedule: DeliveryScheduleSettings,
): DeliveryScheduleSettings["weekly"] {
  const weekly = { ...schedule.weekly };
  for (const day of [1, 2, 3, 4, 5, 6, 7] as const) {
    const hours = weekly[day];
    if (!hours.isOpen) continue;
    const openMinutes = timeToMinutes(hours.openTime);
    const closeMinutes = timeToMinutes(hours.closeTime);
    if (closeMinutes > openMinutes) continue;
    const preferredClose = openMinutes + 60;
    weekly[day] =
      preferredClose <= 23 * 60 + 59
        ? { ...hours, closeTime: minutesToTime(preferredClose) }
        : {
            ...hours,
            openTime: minutesToTime(Math.max(0, closeMinutes - 60)),
          };
  }
  return weekly;
}

export function AdminDeliveryView({
  locale,
  settings,
  initialImageUrls,
  copy,
}: AdminDeliveryViewProps) {
  const [originAddress, setOriginAddress] = useState(settings.originAddress);
  const [originLat, setOriginLat] = useState(settings.originLat);
  const [originLng, setOriginLng] = useState(settings.originLng);
  const [pricePerKmAmount, setPricePerKmAmount] = useState(
    settings.pricePerKmAmount > 0 ? String(settings.pricePerKmAmount) : "",
  );
  const [isActive, setIsActive] = useState(settings.isActive);
  const [schedule, setSchedule] = useState<DeliveryScheduleSettings>(
    settings.schedule,
  );
  const [cashChangeDenominations, setCashChangeDenominations] = useState<
    CashChangeDenomination[]
  >(settings.cashChangeDenominations);
  const [imageUrls, setImageUrls] = useState(initialImageUrls);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const languageCode: Locale = isLocale(locale) ? locale : "hy";
  const { collapsed } = useAdminSidebarCollapse();
  const stickyBarOffsetClass = collapsed ? "lg:left-16" : "lg:left-64";
  const [savedSnapshot, setSavedSnapshot] = useState(() => ({
    originAddress: settings.originAddress,
    originLat: settings.originLat,
    originLng: settings.originLng,
    pricePerKmAmount:
      settings.pricePerKmAmount > 0 ? String(settings.pricePerKmAmount) : "",
    isActive: settings.isActive,
    schedule: settings.schedule,
    cashChangeDenominations: settings.cashChangeDenominations,
    imageUrls: initialImageUrls,
  }));

  const sortedDenominations = useMemo(
    () =>
      [...cashChangeDenominations].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.amount - b.amount,
      ),
    [cashChangeDenominations],
  );

  const isDirty = useMemo(() => {
    if (originAddress !== savedSnapshot.originAddress) return true;
    if (originLat !== savedSnapshot.originLat) return true;
    if (originLng !== savedSnapshot.originLng) return true;
    if (pricePerKmAmount !== savedSnapshot.pricePerKmAmount) return true;
    if (isActive !== savedSnapshot.isActive) return true;
    if (JSON.stringify(schedule) !== JSON.stringify(savedSnapshot.schedule)) {
      return true;
    }
    if (
      JSON.stringify(sortedDenominations) !==
      JSON.stringify(
        [...savedSnapshot.cashChangeDenominations].sort(
          (a, b) => a.sortOrder - b.sortOrder || a.amount - b.amount,
        ),
      )
    ) {
      return true;
    }
    if (JSON.stringify(imageUrls) !== JSON.stringify(savedSnapshot.imageUrls)) {
      return true;
    }
    return false;
  }, [
    imageUrls,
    isActive,
    originAddress,
    originLat,
    originLng,
    pricePerKmAmount,
    savedSnapshot,
    schedule,
    sortedDenominations,
  ]);

  function onSave(): void {
    if (!isDirty) return;
    startTransition(async () => {
      setError(null);
      setMessage(null);
      const weekly = normalizeScheduleForSave(schedule);
      const nextSchedule = { ...schedule, weekly };
      setSchedule(nextSchedule);
      const nextDenominations = sortedDenominations.map((item, index) => ({
        ...item,
        sortOrder: index,
      }));
      const result = await saveDeliverySettingsAction(locale, {
        originAddress,
        pricePerKmAmount: Number(pricePerKmAmount),
        isActive,
        schedule: {
          slotMinutes: nextSchedule.slotMinutes,
          maxDaysAhead: nextSchedule.maxDaysAhead,
          weekly,
          closedDates: nextSchedule.closedDates,
        },
        cashChangeDenominations: nextDenominations,
      });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setOriginAddress(result.value.originAddress);
      setOriginLat(result.value.originLat);
      setOriginLng(result.value.originLng);
      setCashChangeDenominations(nextDenominations);
      setSavedSnapshot({
        originAddress: result.value.originAddress,
        originLat: result.value.originLat,
        originLng: result.value.originLng,
        pricePerKmAmount,
        isActive,
        schedule: nextSchedule,
        cashChangeDenominations: nextDenominations,
        imageUrls,
      });
      setMessage(copy.delivery.saved);
    });
  }

  function onCancel(): void {
    setOriginAddress(savedSnapshot.originAddress);
    setOriginLat(savedSnapshot.originLat);
    setOriginLng(savedSnapshot.originLng);
    setPricePerKmAmount(savedSnapshot.pricePerKmAmount);
    setIsActive(savedSnapshot.isActive);
    setSchedule(savedSnapshot.schedule);
    setCashChangeDenominations(savedSnapshot.cashChangeDenominations);
    setImageUrls(savedSnapshot.imageUrls);
    setError(null);
    setMessage(null);
  }

  return (
    <section className="pb-24">
      <div className="mb-6">
        <h1 className={ADMIN_PAGE_TITLE}>{copy.delivery.title}</h1>
        <p className={`mt-1 ${ADMIN_PAGE_SUBTITLE}`}>{copy.delivery.subtitle}</p>
      </div>

      {error ? <p className="mb-3 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="mb-3 text-sm text-green-700">{message}</p> : null}

      <form
        className="grid gap-6 xl:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          onSave();
        }}
      >
        <Card className="p-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                {copy.delivery.storeAndPricing}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {copy.delivery.storeAndPricingHint}
              </p>
            </div>

            <label>
              <span className={ADMIN_LABEL}>{copy.delivery.storeAddress}</span>
              <AddressAutocomplete
                value={originAddress}
                onValueChange={setOriginAddress}
                placeholder={copy.delivery.storeAddressPlaceholder}
                required
                className={ADMIN_INPUT}
                disabled={isPending}
                languageCode={languageCode}
              />
              <span className="mt-1 block text-xs text-gray-500">
                {copy.delivery.storeAddressHint}
              </span>
              {originLat != null && originLng != null ? (
                <span className="mt-1 block text-xs text-gray-500">
                  {copy.delivery.geocoded
                    .replace("{lat}", originLat.toFixed(5))
                    .replace("{lng}", originLng.toFixed(5))}
                </span>
              ) : null}
            </label>

            <label>
              <span className={ADMIN_LABEL}>{copy.delivery.pricePerKm}</span>
              <input
                type="number"
                min={0}
                step={1}
                required
                value={pricePerKmAmount}
                onChange={(event) => setPricePerKmAmount(event.target.value)}
                placeholder={copy.delivery.pricePerKmPlaceholder}
                className={ADMIN_INPUT}
                disabled={isPending}
              />
              {pricePerKmAmount !== "" &&
              Number.isFinite(Number(pricePerKmAmount)) ? (
                <span className="mt-1 block text-xs text-gray-500">
                  {copy.delivery.pricePerKmExample.replace(
                    "{amount}",
                    formatMoneyAmount(
                      Math.round((1101 * Number(pricePerKmAmount)) / 1000),
                      "AMD",
                      locale,
                    ),
                  )}
                </span>
              ) : null}
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-gray-800">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                disabled={isPending}
                className="h-4 w-4 rounded border-gray-300"
              />
              {copy.delivery.offerDelivery}
            </label>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col gap-5">
            <AdminDeliveryScheduleEditor
              value={schedule}
              onChange={setSchedule}
              disabled={isPending}
              locale={locale}
              common={copy.common}
              copy={copy.delivery.schedule}
              confirm={copy.confirm}
            />
          </div>
        </Card>

        <Card className="p-6 xl:col-span-2">
          <AdminCashChangeEditor
            locale={locale}
            value={sortedDenominations}
            imageUrls={imageUrls}
            onChange={setCashChangeDenominations}
            onImageUrlsChange={setImageUrls}
            disabled={isPending}
            copy={copy.delivery.cashChange}
            confirm={copy.confirm}
          />
        </Card>

        <div
          className={`fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white px-4 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] sm:px-6 lg:px-8 ${stickyBarOffsetClass}`}
        >
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending || !isDirty}
              className="min-w-[160px] px-10"
            >
              {copy.common.cancel}
            </Button>
            <Button
              type="submit"
              className="min-w-[180px] px-10"
              disabled={isPending || !isDirty}
            >
              {isPending ? copy.common.saving : copy.common.save}
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
