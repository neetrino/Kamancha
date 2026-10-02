"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  ADMIN_LABEL,
  ADMIN_PAGE_SUBTITLE,
  ADMIN_PAGE_TITLE,
} from "@/features/admin/ui/admin-form-classes";
import { useAdminSidebarCollapse } from "@/features/admin/ui/AdminSidebarCollapseContext";
import { deleteDeliveryLocationAction } from "@/features/delivery/application/manage-delivery";
import type { AdminDeliveryLocation } from "@/features/delivery/application/queries";
import { saveDeliverySettingsAction } from "@/features/delivery/application/save-delivery-settings";
import type { CashChangeDenomination } from "@/features/delivery/domain/cash-change";
import type { StoreDeliverySettings } from "@/features/delivery/domain/delivery-settings";
import type { DeliveryScheduleSettings } from "@/features/delivery/domain/delivery-schedule";
import { timeToMinutes } from "@/features/delivery/domain/delivery-schedule";
import { AdminCashChangeEditor } from "@/features/delivery/ui/AdminCashChangeEditor";
import { AdminDeliveryScheduleEditor } from "@/features/delivery/ui/AdminDeliveryScheduleEditor";
import { DeliveryLocationDrawer } from "@/features/delivery/ui/DeliveryLocationDrawer";
import { formatMoneyAmount } from "@/lib/money/format";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AdminDeliveryViewCopy = {
  delivery: Dictionary["admin"]["delivery"];
  common: Dictionary["admin"]["common"];
  confirm: Dictionary["admin"]["confirm"];
};

type AdminDeliveryViewProps = {
  locale: string;
  settings: StoreDeliverySettings;
  zones: AdminDeliveryLocation[];
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
  zones,
  initialImageUrls,
  copy,
}: AdminDeliveryViewProps) {
  const router = useRouter();
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
  const { collapsed } = useAdminSidebarCollapse();
  const stickyBarOffsetClass = collapsed ? "lg:left-16" : "lg:left-64";
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<AdminDeliveryLocation | null>(
    null,
  );
  const [pendingDelete, setPendingDelete] = useState<AdminDeliveryLocation | null>(
    null,
  );
  const [savedSnapshot, setSavedSnapshot] = useState(() => ({
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
  }, [imageUrls, isActive, savedSnapshot, schedule, sortedDenominations]);

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
      setCashChangeDenominations(nextDenominations);
      setSavedSnapshot({
        isActive,
        schedule: nextSchedule,
        cashChangeDenominations: nextDenominations,
        imageUrls,
      });
      setMessage(copy.delivery.saved);
    });
  }

  function onCancel(): void {
    setIsActive(savedSnapshot.isActive);
    setSchedule(savedSnapshot.schedule);
    setCashChangeDenominations(savedSnapshot.cashChangeDenominations);
    setImageUrls(savedSnapshot.imageUrls);
    setError(null);
    setMessage(null);
  }

  function openCreateZone(): void {
    setEditingZone(null);
    setDrawerOpen(true);
  }

  function openEditZone(zone: AdminDeliveryLocation): void {
    setEditingZone(zone);
    setDrawerOpen(true);
  }

  function confirmDeleteZone(): void {
    if (!pendingDelete) return;
    const zoneId = pendingDelete.id;
    startTransition(async () => {
      setError(null);
      const result = await deleteDeliveryLocationAction(locale, zoneId);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setPendingDelete(null);
      router.refresh();
    });
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
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {copy.delivery.zonesTitle}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {copy.delivery.zonesHint}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={openCreateZone}
                className="shrink-0 gap-1.5"
              >
                <Plus className="h-4 w-4" aria-hidden />
                {copy.delivery.addZone}
              </Button>
            </div>

            {zones.length === 0 ? (
              <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-600">
                {copy.delivery.zonesEmpty}
              </p>
            ) : (
              <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200">
                {zones.map((zone) => (
                  <li
                    key={zone.id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {zone.label}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatMoneyAmount(zone.priceAmount, "AMD", locale)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditZone(zone)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        aria-label={copy.delivery.locationDrawer.editAria}
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(zone)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-700"
                        aria-label={copy.common.delete}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <label className="inline-flex items-center gap-2 text-sm text-gray-800">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                disabled={isPending}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className={ADMIN_LABEL}>{copy.delivery.offerDelivery}</span>
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

      <DeliveryLocationDrawer
        locale={locale}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingZone(null);
        }}
        location={editingZone}
        copy={{
          locationDrawer: copy.delivery.locationDrawer,
          common: copy.common,
        }}
      />

      <ConfirmDialog
        open={pendingDelete != null}
        title={copy.delivery.deleteZoneTitle}
        description={
          pendingDelete
            ? copy.delivery.deleteZoneDescription.replace(
                "{name}",
                pendingDelete.label,
              )
            : ""
        }
        confirmLabel={copy.common.delete}
        cancelLabel={copy.common.cancel}
        onConfirm={confirmDeleteZone}
        onClose={() => setPendingDelete(null)}
        isPending={isPending}
      />
    </section>
  );
}
