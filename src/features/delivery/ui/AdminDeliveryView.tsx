"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";
import {
  ADMIN_INPUT,
  ADMIN_LABEL,
  ADMIN_PAGE_SUBTITLE,
  ADMIN_PAGE_TITLE,
} from "@/features/admin/ui/admin-form-classes";
import { saveDeliverySettingsAction } from "@/features/delivery/application/save-delivery-settings";
import type { StoreDeliverySettings } from "@/features/delivery/domain/delivery-settings";
import { formatMoneyAmount } from "@/lib/money/format";
import type { Locale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/config";

type AdminDeliveryViewProps = {
  locale: string;
  settings: StoreDeliverySettings;
};

export function AdminDeliveryView({
  locale,
  settings,
}: AdminDeliveryViewProps) {
  const router = useRouter();
  const [originAddress, setOriginAddress] = useState(settings.originAddress);
  const [pricePerKmAmount, setPricePerKmAmount] = useState(
    settings.pricePerKmAmount > 0 ? String(settings.pricePerKmAmount) : "",
  );
  const [isActive, setIsActive] = useState(settings.isActive);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const languageCode: Locale = isLocale(locale) ? locale : "hy";

  return (
    <section>
      <div className="mb-6">
        <h1 className={ADMIN_PAGE_TITLE}>Delivery</h1>
        <p className={`mt-1 ${ADMIN_PAGE_SUBTITLE}`}>
          Set the store address and AMD price per kilometer. Checkout calculates
          delivery from driving distance (fractional km kept, e.g. 1.101 km ×
          1000 AMD = 1101 AMD).
        </p>
      </div>

      {error ? <p className="mb-3 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="mb-3 text-sm text-green-700">{message}</p> : null}

      <Card className="max-w-2xl p-6">
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            startTransition(async () => {
              setError(null);
              setMessage(null);
              const result = await saveDeliverySettingsAction(locale, {
                originAddress,
                pricePerKmAmount: Number(pricePerKmAmount),
                isActive,
              });
              if (!result.ok) {
                setError(result.error.message);
                return;
              }
              setOriginAddress(result.value.originAddress);
              setMessage("Delivery settings saved.");
              router.refresh();
            });
          }}
        >
          <label>
            <span className={ADMIN_LABEL}>Store address</span>
            <AddressAutocomplete
              value={originAddress}
              onValueChange={setOriginAddress}
              placeholder="օր. Անդրանիկի 108/10, Երևան"
              required
              className={ADMIN_INPUT}
              disabled={isPending}
              languageCode={languageCode}
            />
            <span className="mt-1 block text-xs text-gray-500">
              Start typing a street name — pick from Google suggestions, then
              Save.
            </span>
            {settings.originLat != null && settings.originLng != null ? (
              <span className="mt-1 block text-xs text-gray-500">
                Geocoded: {settings.originLat.toFixed(5)},{" "}
                {settings.originLng.toFixed(5)}
              </span>
            ) : null}
          </label>

          <label>
            <span className={ADMIN_LABEL}>Price per kilometer (AMD)</span>
            <input
              type="number"
              min={0}
              step={1}
              required
              value={pricePerKmAmount}
              onChange={(event) => setPricePerKmAmount(event.target.value)}
              placeholder="1000"
              className={ADMIN_INPUT}
              disabled={isPending}
            />
            {pricePerKmAmount !== "" && Number.isFinite(Number(pricePerKmAmount)) ? (
              <span className="mt-1 block text-xs text-gray-500">
                Example: 1.101 km →{" "}
                {formatMoneyAmount(
                  Math.round((1101 * Number(pricePerKmAmount)) / 1000),
                  "AMD",
                  locale,
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
            Offer delivery at checkout
          </label>

          <div>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
}
