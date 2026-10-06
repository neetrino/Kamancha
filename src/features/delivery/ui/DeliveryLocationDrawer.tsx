"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { SideSheet } from "@/components/ui/SideSheet";
import {
  ADMIN_INPUT,
  ADMIN_LABEL,
} from "@/features/admin/ui/admin-form-classes";
import {
  createDeliveryLocationAction,
  updateDeliveryLocationAction,
} from "@/features/delivery/application/manage-delivery";
import type { AdminDeliveryLocation } from "@/features/delivery/application/queries";
import type { DeliveryZoneTranslationsJson } from "@/db/schema";
import { localeLabels, locales, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type LocationDrawerCopy = {
  locationDrawer: Dictionary["admin"]["delivery"]["locationDrawer"];
  common: Dictionary["admin"]["common"];
};

type DeliveryLocationDrawerProps = {
  locale: string;
  open: boolean;
  onClose: () => void;
  location?: AdminDeliveryLocation | null;
  copy: LocationDrawerCopy;
};

type DeliveryLocationFormProps = {
  locale: string;
  location: AdminDeliveryLocation | null;
  onClose: () => void;
  copy: LocationDrawerCopy;
};

type LocaleFields = {
  area: string;
  district: string;
};

const EMPTY_LOCALE_FIELDS: LocaleFields = { area: "", district: "" };

function emptyLocalizedFields(): Record<Locale, LocaleFields> {
  return {
    hy: { ...EMPTY_LOCALE_FIELDS },
    en: { ...EMPTY_LOCALE_FIELDS },
    ru: { ...EMPTY_LOCALE_FIELDS },
  };
}

function fromTranslations(
  translations: DeliveryZoneTranslationsJson | null | undefined,
): Record<Locale, LocaleFields> {
  const next = emptyLocalizedFields();
  if (!translations) return next;
  for (const loc of locales) {
    next[loc] = {
      area: translations[loc]?.area ?? "",
      district: translations[loc]?.district ?? "",
    };
  }
  return next;
}

function DeliveryLocationForm({
  locale,
  location,
  onClose,
  copy,
}: DeliveryLocationFormProps) {
  const router = useRouter();
  const isEdit = location != null;
  const [activeLocale, setActiveLocale] = useState<Locale>("hy");
  const [localized, setLocalized] = useState<Record<Locale, LocaleFields>>(
    () => fromTranslations(location?.translations),
  );
  const [priceAmount, setPriceAmount] = useState(
    location ? String(location.priceAmount) : "",
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateActiveField(
    field: keyof LocaleFields,
    value: string,
  ): void {
    setLocalized((prev) => ({
      ...prev,
      [activeLocale]: {
        ...prev[activeLocale],
        [field]: value,
      },
    }));
  }

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(event) => {
        event.preventDefault();

        const missingLocale = locales.find(
          (loc) => !localized[loc].area.trim(),
        );
        if (missingLocale) {
          setError(
            `${localeLabels[missingLocale]} — ${copy.locationDrawer.areaName} ${copy.common.requiredMark}`,
          );
          setActiveLocale(missingLocale);
          return;
        }

        const translations: DeliveryZoneTranslationsJson = {
          hy: {
            area: localized.hy.area.trim(),
            district: localized.hy.district.trim() || null,
          },
          en: {
            area: localized.en.area.trim(),
            district: localized.en.district.trim() || null,
          },
          ru: {
            area: localized.ru.area.trim(),
            district: localized.ru.district.trim() || null,
          },
        };

        const payload = {
          translations,
          priceAmount: Number(priceAmount),
        };

        startTransition(async () => {
          setError(null);
          const result =
            isEdit && location
              ? await updateDeliveryLocationAction(
                  locale,
                  location.id,
                  payload,
                )
              : await createDeliveryLocationAction(locale, payload);

          if (!result.ok) {
            setError(result.error.message);
            return;
          }

          onClose();
          router.refresh();
        });
      }}
    >
      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
            {copy.locationDrawer.translations}
          </p>
          <div className="flex flex-wrap gap-2">
            {locales.map((loc) => {
              const selected = loc === activeLocale;
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setActiveLocale(loc)}
                  className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${
                    selected
                      ? "bg-brand-forest text-white"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {localeLabels[loc]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4">
          <label>
            <span className={ADMIN_LABEL}>
              {copy.locationDrawer.areaName}
              <span className="text-red-600"> {copy.common.requiredMark}</span>
            </span>
            <input
              value={localized[activeLocale].area}
              onChange={(event) => updateActiveField("area", event.target.value)}
              placeholder={copy.locationDrawer.areaNamePlaceholder}
              required
              maxLength={80}
              className={ADMIN_INPUT}
              disabled={isPending}
            />
          </label>

          <label>
            <span className={ADMIN_LABEL}>
              {copy.locationDrawer.districtName}
            </span>
            <input
              value={localized[activeLocale].district}
              onChange={(event) =>
                updateActiveField("district", event.target.value)
              }
              placeholder={copy.locationDrawer.districtNamePlaceholder}
              maxLength={80}
              className={ADMIN_INPUT}
              disabled={isPending}
            />
          </label>

          <label>
            <span className={ADMIN_LABEL}>{copy.locationDrawer.priceAmd}</span>
            <input
              type="number"
              min={0}
              step={1}
              required
              value={priceAmount}
              onChange={(event) => setPriceAmount(event.target.value)}
              placeholder={copy.locationDrawer.pricePlaceholder}
              className={ADMIN_INPUT}
              disabled={isPending}
            />
          </label>
        </div>
        <p className="text-xs text-gray-500">
          {copy.locationDrawer.districtNameHint}
        </p>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}
      </div>

      <div className="flex items-center gap-4 border-t border-gray-200 px-5 py-4 sm:px-6">
        <Button type="submit" disabled={isPending}>
          {isPending ? copy.common.saving : copy.common.save}
        </Button>
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          {copy.common.cancel}
        </button>
      </div>
    </form>
  );
}

export function DeliveryLocationDrawer({
  locale,
  open,
  onClose,
  location = null,
  copy,
}: DeliveryLocationDrawerProps) {
  const formKey = location?.id ?? "new";

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      ariaLabel={
        location
          ? copy.locationDrawer.editAria
          : copy.locationDrawer.addAria
      }
    >
      <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {location
            ? copy.locationDrawer.editTitle
            : copy.locationDrawer.addTitle}
        </h2>
      </div>

      <DeliveryLocationForm
        key={formKey}
        locale={locale}
        location={location}
        onClose={onClose}
        copy={copy}
      />
    </SideSheet>
  );
}
