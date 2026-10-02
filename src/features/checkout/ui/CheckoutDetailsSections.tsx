"use client";

import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";
import { AddressMapPicker } from "@/components/ui/AddressMapPicker";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import type { CheckoutPaymentMethod } from "@/features/checkout/domain/payment-methods";
import type { CheckoutInvalidField } from "@/features/checkout/ui/checkout-invalid-fields";
import { CheckoutPaymentMethods } from "@/features/checkout/ui/CheckoutPaymentMethods";
import type { CheckoutPaymentOption } from "@/features/checkout/ui/CheckoutPaymentMethodOption";
import type { CashChangeSelection } from "@/features/checkout/ui/checkout-cash-change-assets";
import { DeliverySlotPicker } from "@/features/checkout/ui/DeliverySlotPicker";
import {
  CHECKOUT_SECTION_TITLE_CLASS,
  CHECKOUT_TITLE_INVALID_CLASS,
} from "@/features/checkout/ui/checkout-ui";
import type { CheckoutDeliveryOption } from "@/features/delivery/application/queries";
import type { CashChangeDenominationView } from "@/features/delivery/domain/cash-change";
import type { DeliveryScheduleSettings } from "@/features/delivery/domain/delivery-schedule";
import type { SelectedDeliverySlot } from "@/features/delivery/domain/delivery-schedule";
import type { Locale } from "@/lib/i18n/config";

const FIELD_CLASS =
  "h-11 w-full rounded-2xl border border-gray-200 bg-white px-4 text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-500 hover:border-gray-300 focus:border-gray-400 disabled:bg-gray-50";

const FIELD_LABEL_CLASS =
  "flex flex-col gap-1.5 text-sm font-medium text-white/80";

const SECTION_CLASS =
  "liquid-glass isolate overflow-hidden rounded-3xl px-5 py-6 sm:px-6 sm:py-7";

function sectionTitleClassName(invalid: boolean): string {
  return invalid
    ? `${CHECKOUT_SECTION_TITLE_CLASS} ${CHECKOUT_TITLE_INVALID_CLASS}`
    : CHECKOUT_SECTION_TITLE_CLASS;
}

type CheckoutDetailsLabels = {
  contactInformation: string;
  shippingAddress: string;
  paymentMethod: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  deliveryZone: string;
  selectDeliveryZone: string;
  floor: string;
  intercomCode: string;
  note: string;
  phonePlaceholder: string;
  addressPlaceholder: string;
  floorPlaceholder: string;
  intercomCodePlaceholder: string;
  notePlaceholder: string;
  openMap: string;
  mapTitle: string;
  mapHint: string;
  mapConfirm: string;
  mapCancel: string;
  mapResolving: string;
  scheduleTitle: string;
  schedulePickDate: string;
  schedulePickTime: string;
  scheduleNoSlots: string;
  schedulePrevMonth: string;
  scheduleNextMonth: string;
  cashChangeTitle: string;
  cashChangeHint: string;
  cashChangeNone: string;
  cashChangeDue: string;
};

type CheckoutDetailsSectionsProps = {
  labels: CheckoutDetailsLabels;
  locale: Locale;
  pending: boolean;
  deliverySchedule: DeliveryScheduleSettings;
  deliverySlot: SelectedDeliverySlot | null;
  onDeliverySlotChange: (value: SelectedDeliverySlot | null) => void;
  cashChangeOptions: CashChangeDenominationView[];
  cashChangeAmount: CashChangeSelection;
  onCashChangeAmountChange: (value: CashChangeSelection) => void;
  payableTotal: number;
  cashChangeDueFormatted: string | null;
  deliveryZones: CheckoutDeliveryOption[];
  deliveryRuleId: string;
  onDeliveryRuleIdChange: (value: string) => void;
  line1: string;
  onLine1Change: (value: string) => void;
  paymentMethod: CheckoutPaymentMethod | null;
  onPaymentMethodChange: (method: CheckoutPaymentMethod) => void;
  paymentOptions: CheckoutPaymentOption[];
  defaultFirstName: string;
  defaultLastName: string;
  defaultEmail: string;
  defaultPhone: string;
  addressLocked?: boolean;
  zoneLocked?: boolean;
  lockedZoneLabel?: string | null;
  prepaidNotice?: { title: string; lines: readonly string[] } | null;
  invalidFields?: Partial<Record<CheckoutInvalidField, true>>;
  onClearInvalidField?: (field: CheckoutInvalidField) => void;
};

export function CheckoutDetailsSections({
  labels,
  locale,
  pending,
  deliverySchedule,
  deliverySlot,
  onDeliverySlotChange,
  cashChangeOptions,
  cashChangeAmount,
  onCashChangeAmountChange,
  payableTotal,
  cashChangeDueFormatted,
  deliveryZones,
  deliveryRuleId,
  onDeliveryRuleIdChange,
  line1,
  onLine1Change,
  paymentMethod,
  onPaymentMethodChange,
  paymentOptions,
  defaultFirstName,
  defaultLastName,
  defaultEmail,
  defaultPhone,
  addressLocked = false,
  zoneLocked = false,
  lockedZoneLabel = null,
  prepaidNotice = null,
  invalidFields = {},
  onClearInvalidField,
}: CheckoutDetailsSectionsProps) {
  function clearField(field: CheckoutInvalidField): void {
    onClearInvalidField?.(field);
  }

  const contactInvalid = Boolean(
    invalidFields.firstName ||
      invalidFields.contactEmail ||
      invalidFields.contactPhone,
  );
  const shippingInvalid = Boolean(
    invalidFields.deliveryRuleId ||
      invalidFields.line1 ||
      invalidFields.deliverySlot,
  );

  const zoneOptions = deliveryZones.map((zone) => ({
    value: zone.id,
    label: zone.label,
  }));

  return (
    <div className="space-y-6">
      <section className={SECTION_CLASS}>
        <h2 className={sectionTitleClassName(contactInvalid)}>
          {labels.contactInformation}
        </h2>
        <div className="relative z-[2] space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className={FIELD_LABEL_CLASS}>
              {labels.firstName}
              <input
                name="firstName"
                data-checkout-field="firstName"
                required
                defaultValue={defaultFirstName}
                disabled={pending}
                aria-invalid={invalidFields.firstName || undefined}
                className={FIELD_CLASS}
                autoComplete="given-name"
                onChange={() => clearField("firstName")}
              />
            </label>
            <label className={FIELD_LABEL_CLASS}>
              {labels.lastName}
              <input
                name="lastName"
                data-checkout-field="lastName"
                defaultValue={defaultLastName}
                disabled={pending}
                className={FIELD_CLASS}
                autoComplete="family-name"
              />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className={FIELD_LABEL_CLASS}>
              {labels.email}
              <input
                name="contactEmail"
                data-checkout-field="contactEmail"
                type="email"
                required
                defaultValue={defaultEmail}
                disabled={pending}
                aria-invalid={invalidFields.contactEmail || undefined}
                className={FIELD_CLASS}
                autoComplete="email"
                onChange={() => clearField("contactEmail")}
              />
            </label>
            <label className={FIELD_LABEL_CLASS}>
              {labels.phone}
              <input
                name="contactPhone"
                data-checkout-field="contactPhone"
                required
                defaultValue={defaultPhone}
                placeholder={labels.phonePlaceholder}
                disabled={pending}
                aria-invalid={invalidFields.contactPhone || undefined}
                className={FIELD_CLASS}
                autoComplete="tel"
                onChange={() => clearField("contactPhone")}
              />
            </label>
          </div>
        </div>
      </section>

      <section className={SECTION_CLASS} id="checkout-shipping-address">
        <h2 className={sectionTitleClassName(shippingInvalid)}>
          {labels.shippingAddress}
        </h2>
        <div className="relative z-[2] space-y-4">
          <div className="space-y-1.5" data-checkout-field="deliveryRuleId">
            <span className="text-sm font-medium text-white/80">
              {labels.deliveryZone}
            </span>
            {zoneLocked ? (
              <p className="rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 text-sm font-medium text-gray-900">
                {lockedZoneLabel ?? labels.selectDeliveryZone}
              </p>
            ) : (
              <SelectDropdown
                ariaLabel={labels.deliveryZone}
                value={deliveryRuleId}
                allLabel={labels.selectDeliveryZone}
                options={zoneOptions}
                disabled={pending}
                onValueChange={(value) => {
                  clearField("deliveryRuleId");
                  onDeliveryRuleIdChange(value);
                }}
                className="w-full"
              />
            )}
          </div>
          <div className="space-y-1.5">
            <span className="text-sm font-medium text-white/80">
              {labels.address}
            </span>
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1" data-checkout-field="line1">
                <AddressAutocomplete
                  name="line1"
                  required
                  value={line1}
                  onValueChange={(value) => {
                    clearField("line1");
                    onLine1Change(value);
                  }}
                  placeholder={labels.addressPlaceholder}
                  disabled={pending || addressLocked}
                  className={FIELD_CLASS}
                  languageCode={locale}
                />
              </div>
              {addressLocked ? null : (
                <AddressMapPicker
                  addressValue={line1}
                  disabled={pending}
                  onAddressSelected={(value) => {
                    clearField("line1");
                    onLine1Change(value);
                  }}
                  labels={{
                    openMap: labels.openMap,
                    title: labels.mapTitle,
                    hint: labels.mapHint,
                    confirm: labels.mapConfirm,
                    cancel: labels.mapCancel,
                    resolving: labels.mapResolving,
                  }}
                />
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className={FIELD_LABEL_CLASS}>
              {labels.floor}
              <input
                name="floor"
                disabled={pending}
                placeholder={labels.floorPlaceholder}
                className={FIELD_CLASS}
              />
            </label>
            <label className={FIELD_LABEL_CLASS}>
              {labels.intercomCode}
              <input
                name="intercomCode"
                disabled={pending}
                placeholder={labels.intercomCodePlaceholder}
                className={FIELD_CLASS}
              />
            </label>
          </div>
          <label className={FIELD_LABEL_CLASS}>
            {labels.note}
            <textarea
              name="customerNote"
              disabled={pending}
              rows={3}
              maxLength={500}
              placeholder={labels.notePlaceholder}
              className="min-h-[5.5rem] w-full resize-y rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-500 hover:border-gray-300 focus:border-gray-400 disabled:bg-gray-50"
            />
          </label>
          <DeliverySlotPicker
            schedule={deliverySchedule}
            selected={deliverySlot}
            onChange={(value) => {
              clearField("deliverySlot");
              onDeliverySlotChange(value);
            }}
            disabled={pending}
            locale={locale}
            labels={{
              title: labels.scheduleTitle,
              pickDate: labels.schedulePickDate,
              pickTime: labels.schedulePickTime,
              noSlots: labels.scheduleNoSlots,
              prevMonth: labels.schedulePrevMonth,
              nextMonth: labels.scheduleNextMonth,
            }}
          />
        </div>
      </section>

      {prepaidNotice ? (
        <section className={SECTION_CLASS}>
          <h2 className={CHECKOUT_SECTION_TITLE_CLASS}>{prepaidNotice.title}</h2>
          <div className="relative z-[2] space-y-1 text-sm text-white">
            {prepaidNotice.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </section>
      ) : null}

      <CheckoutPaymentMethods
        title={labels.paymentMethod}
        options={paymentOptions}
        value={paymentMethod}
        onChange={(method) => {
          clearField("paymentMethod");
          onPaymentMethodChange(method);
        }}
        disabled={pending}
        invalid={Boolean(invalidFields.paymentMethod)}
        cashChangeOptions={cashChangeOptions}
        cashChangeValue={cashChangeAmount}
        onCashChangeChange={onCashChangeAmountChange}
        cashChangeLabels={{
          title: labels.cashChangeTitle,
          hint: labels.cashChangeHint,
          noneLabel: labels.cashChangeNone,
          dueLabel: labels.cashChangeDue,
        }}
        payableTotal={payableTotal}
        cashChangeDueFormatted={cashChangeDueFormatted}
      />
    </div>
  );
}
