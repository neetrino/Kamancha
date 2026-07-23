"use client";

import { Card } from "@/components/ui/Card";
import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";
import type { CheckoutPaymentMethod } from "@/features/checkout/domain/payment-methods";
import { CheckoutPaymentMethods } from "@/features/checkout/ui/CheckoutPaymentMethods";
import type { Locale } from "@/lib/i18n/config";

const FIELD_CLASS =
  "h-11 w-full rounded-2xl border border-gray-200 px-4 text-gray-900 shadow-sm outline-none transition-colors hover:border-gray-300 focus:border-gray-300 disabled:bg-gray-50";

const RADIO_SELECTED = "border-gray-900 bg-gray-50";
const RADIO_IDLE = "border-gray-300 hover:bg-gray-50";

type CheckoutDetailsLabels = {
  contactInformation: string;
  shippingMethod: string;
  shippingAddress: string;
  paymentMethod: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  phonePlaceholder: string;
  addressPlaceholder: string;
  storePickup: string;
  storePickupDescription: string;
  delivery: string;
  deliveryDescription: string;
  calculatingDelivery: string;
};

type PaymentOption = {
  id: CheckoutPaymentMethod;
  name: string;
  description: string;
  logoSrc: string | null;
};

type CheckoutDetailsSectionsProps = {
  labels: CheckoutDetailsLabels;
  locale: Locale;
  pending: boolean;
  shippingMethod: "pickup" | "delivery";
  onShippingMethodChange: (method: "pickup" | "delivery") => void;
  deliveryEnabled: boolean;
  line1: string;
  onLine1Change: (value: string) => void;
  deliveryQuotePending: boolean;
  deliveryQuoteError: string | null;
  deliveryQuoteHint: string | null;
  paymentMethod: CheckoutPaymentMethod;
  onPaymentMethodChange: (method: CheckoutPaymentMethod) => void;
  paymentOptions: PaymentOption[];
  defaultFirstName: string;
  defaultLastName: string;
  defaultEmail: string;
  defaultPhone: string;
};

export function CheckoutDetailsSections({
  labels,
  locale,
  pending,
  shippingMethod,
  onShippingMethodChange,
  deliveryEnabled,
  line1,
  onLine1Change,
  deliveryQuotePending,
  deliveryQuoteError,
  deliveryQuoteHint,
  paymentMethod,
  onPaymentMethodChange,
  paymentOptions,
  defaultFirstName,
  defaultLastName,
  defaultEmail,
  defaultPhone,
}: CheckoutDetailsSectionsProps) {
  return (
    <div className="space-y-6 lg:col-span-2">
      <Card className="rounded-2xl border border-gray-200/80 p-6 shadow-none">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">
          {labels.contactInformation}
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
              {labels.firstName}
              <input
                name="firstName"
                required
                defaultValue={defaultFirstName}
                disabled={pending}
                className={FIELD_CLASS}
                autoComplete="given-name"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
              {labels.lastName}
              <input
                name="lastName"
                required
                defaultValue={defaultLastName}
                disabled={pending}
                className={FIELD_CLASS}
                autoComplete="family-name"
              />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
              {labels.email}
              <input
                name="contactEmail"
                type="email"
                required
                defaultValue={defaultEmail}
                disabled={pending}
                className={FIELD_CLASS}
                autoComplete="email"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
              {labels.phone}
              <input
                name="contactPhone"
                required
                defaultValue={defaultPhone}
                placeholder={labels.phonePlaceholder}
                disabled={pending}
                className={FIELD_CLASS}
                autoComplete="tel"
              />
            </label>
          </div>
        </div>
      </Card>

      <Card className="rounded-2xl border border-gray-200/80 p-6 shadow-none">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">
          {labels.shippingMethod}
        </h2>
        <div className="space-y-3">
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${
              shippingMethod === "pickup" ? RADIO_SELECTED : RADIO_IDLE
            }`}
          >
            <input
              type="radio"
              name="shippingMethodUi"
              value="pickup"
              checked={shippingMethod === "pickup"}
              onChange={() => onShippingMethodChange("pickup")}
              disabled={pending}
              className="mt-1"
            />
            <div>
              <div className="font-medium text-gray-900">
                {labels.storePickup}
              </div>
              <p className="mt-0.5 text-sm text-gray-600">
                {labels.storePickupDescription}
              </p>
            </div>
          </label>

          <label
            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${
              shippingMethod === "delivery" ? RADIO_SELECTED : RADIO_IDLE
            } ${!deliveryEnabled ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <input
              type="radio"
              name="shippingMethodUi"
              value="delivery"
              checked={shippingMethod === "delivery"}
              onChange={() => onShippingMethodChange("delivery")}
              disabled={pending || !deliveryEnabled}
              className="mt-1"
            />
            <div>
              <div className="font-medium text-gray-900">{labels.delivery}</div>
              <p className="mt-0.5 text-sm text-gray-600">
                {labels.deliveryDescription}
              </p>
            </div>
          </label>
        </div>
      </Card>

      {shippingMethod === "delivery" ? (
        <Card className="rounded-2xl border border-gray-200/80 p-6 shadow-none">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            {labels.shippingAddress}
          </h2>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
            {labels.address}
            <AddressAutocomplete
              name="line1"
              required
              value={line1}
              onValueChange={onLine1Change}
              placeholder={labels.addressPlaceholder}
              disabled={pending}
              className={FIELD_CLASS}
              languageCode={locale}
            />
          </label>
          {deliveryQuotePending ? (
            <p className="mt-2 text-sm text-gray-500">
              {labels.calculatingDelivery}
            </p>
          ) : null}
          {deliveryQuoteError ? (
            <p className="mt-2 text-sm text-red-700">{deliveryQuoteError}</p>
          ) : null}
          {!deliveryQuotePending && !deliveryQuoteError && deliveryQuoteHint ? (
            <p className="mt-2 text-sm text-gray-600">{deliveryQuoteHint}</p>
          ) : null}
        </Card>
      ) : null}

      <CheckoutPaymentMethods
        title={labels.paymentMethod}
        options={paymentOptions}
        value={paymentMethod}
        onChange={onPaymentMethodChange}
        disabled={pending}
      />
    </div>
  );
}
