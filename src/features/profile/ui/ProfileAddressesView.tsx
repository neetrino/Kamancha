"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import type { CustomerAddressListItem } from "@/features/profile/application/address-queries";
import {
  createCustomerAddressAction,
  deleteCustomerAddressAction,
  setDefaultCustomerAddressAction,
  updateCustomerAddressAction,
} from "@/features/profile/application/manage-addresses";
import { ProfileAddressCard } from "@/features/profile/ui/ProfileAddressCard";
import {
  PROFILE_FIELD,
  PROFILE_LABEL,
  PROFILE_PILL_GHOST,
  PROFILE_PILL_LIGHT,
  PROFILE_SECTION,
  PROFILE_SECTION_TITLE,
} from "@/features/profile/ui/profile-surface";

type DeliveryZoneOption = {
  id: string;
  label: string;
};

type AddressFormState = {
  line1: string;
  city: string;
  zoneId: string;
  isDefault: boolean;
};

type ProfileAddressesViewProps = {
  locale: string;
  addresses: CustomerAddressListItem[];
  zones: DeliveryZoneOption[];
  labels: {
    title: string;
    addNew: string;
    defaultBadge: string;
    setDefault: string;
    edit: string;
    delete: string;
    deleteConfirm: string;
    noAddresses: string;
    formAddTitle: string;
    formEditTitle: string;
    line1: string;
    addressPlaceholder: string;
    community: string;
    selectCommunity: string;
    isDefault: string;
    cancel: string;
    add: string;
    update: string;
    saving: string;
  };
};

/** Splits a Google formatted address into street + city when possible. */
function applyMapAddress(
  formatted: string,
  prev: AddressFormState,
): AddressFormState {
  const parts = formatted
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length < 2) {
    return { ...prev, line1: formatted };
  }

  const last = parts[parts.length - 1] ?? "";
  const looksLikeCountry = /armenia|հայաստան|армения/i.test(last);
  const cityIndex = looksLikeCountry ? parts.length - 2 : parts.length - 1;
  const city = parts[cityIndex] ?? prev.city;
  const line1 = parts.slice(0, cityIndex).join(", ") || formatted;
  return { ...prev, line1, city };
}

const emptyForm: AddressFormState = {
  line1: "",
  city: "",
  zoneId: "",
  isDefault: false,
};

export function ProfileAddressesView({
  locale,
  addresses,
  zones,
  labels,
}: ProfileAddressesViewProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressFormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  function resetForm(): void {
    setForm(emptyForm);
    setEditingId(null);
  }

  function toggleForm(): void {
    if (showForm) {
      setShowForm(false);
      resetForm();
      return;
    }
    resetForm();
    setShowForm(true);
  }

  function startEdit(address: CustomerAddressListItem): void {
    setEditingId(address.id);
    setForm({
      line1: address.line1,
      city: address.city,
      zoneId:
        zones.find((zone) => zone.label === address.region)?.id ?? "",
      isDefault: address.isDefaultShipping,
    });
    setShowForm(true);
    setError(null);
    setMessage(null);
  }

  function onSave(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const zone = zones.find((item) => item.id === form.zoneId);
      if (!zone) {
        setError(labels.selectCommunity);
        return;
      }
      const parsed = applyMapAddress(form.line1, form);
      const payload = {
        ...parsed,
        city: parsed.city.trim() || "Երևան",
        region: zone.label,
      };
      const result = editingId
        ? await updateCustomerAddressAction(locale, editingId, payload)
        : await createCustomerAddressAction(locale, payload);

      if (!result.ok) {
        setError(result.error.message);
        return;
      }

      setMessage(editingId ? "Address updated." : "Address added.");
      setShowForm(false);
      resetForm();
      router.refresh();
    });
  }

  function onDelete(addressId: string): void {
    setPendingDeleteId(addressId);
  }

  function confirmDelete(): void {
    if (!pendingDeleteId) return;
    const addressId = pendingDeleteId;

    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await deleteCustomerAddressAction(locale, addressId);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setMessage("Address deleted.");
      setPendingDeleteId(null);
      if (editingId === addressId) {
        setShowForm(false);
        resetForm();
      }
      router.refresh();
    });
  }

  function onSetDefault(addressId: string): void {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await setDefaultCustomerAddressAction(locale, addressId);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setMessage("Default address updated.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className={PROFILE_SECTION}>
        <div className="relative z-[2] mb-6 flex flex-col gap-4 border-b border-gray-100 pb-5 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:pb-6 xl:border-white/35">
          <h1 className={PROFILE_SECTION_TITLE}>{labels.title}</h1>
          {!showForm ? (
            <button
              type="button"
              className={`${PROFILE_PILL_LIGHT} w-full shrink-0 sm:w-auto`}
              onClick={toggleForm}
              disabled={isPending}
            >
              {`+ ${labels.addNew}`}
            </button>
          ) : null}
        </div>

        {showForm ? (
          <form
            onSubmit={onSave}
            className="relative z-[2] mb-8 space-y-5 overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 p-4 sm:mb-10 sm:p-6 xl:border-white/50 xl:bg-white/35"
          >
            <h2 className="font-big-fat-boii text-base font-normal tracking-wide text-gray-900 uppercase">
              {editingId ? labels.formEditTitle : labels.formAddTitle}
            </h2>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="w-full shrink-0 space-y-1.5 sm:w-auto">
                <span className={PROFILE_LABEL}>{labels.community}</span>
                <SelectDropdown
                  ariaLabel={labels.community}
                  value={form.zoneId}
                  allLabel={labels.selectCommunity}
                  options={zones.map((zone) => ({
                    value: zone.id,
                    label: zone.label,
                  }))}
                  disabled={isPending}
                  fitContent
                  fitContentFromSm
                  onValueChange={(zoneId) =>
                    setForm((prev) => ({ ...prev, zoneId }))
                  }
                />
              </div>
              <label className={`${PROFILE_LABEL} min-w-0 flex-1`}>
              {labels.line1}
              <AddressAutocomplete
                required
                value={form.line1}
                onValueChange={(line1) =>
                  setForm((prev) => ({ ...prev, line1 }))
                }
                placeholder={labels.addressPlaceholder}
                disabled={isPending}
                className={PROFILE_FIELD}
                languageCode={
                  locale === "en" || locale === "ru" ? locale : "hy"
                }
              />
            </label>
            </div>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    isDefault: event.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-white/60 text-brand-forest focus:ring-brand-forest"
              />
              <span className="text-sm text-gray-800">{labels.isDefault}</span>
            </label>
            <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:gap-3">
              <button
                type="button"
                className={`${PROFILE_PILL_GHOST} w-full sm:w-auto`}
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                disabled={isPending}
              >
                {labels.cancel}
              </button>
              <button
                type="submit"
                className={`${PROFILE_PILL_LIGHT} w-full sm:w-auto`}
                disabled={isPending}
              >
                {isPending
                  ? labels.saving
                  : editingId
                    ? labels.update
                    : labels.add}
              </button>
            </div>
          </form>
        ) : null}

        {error ? (
          <p className="relative z-[2] mb-4 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="relative z-[2] mb-4 text-sm text-brand-forest" role="status">
            {message}
          </p>
        ) : null}

        <div className="relative z-[2] grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          {addresses.length > 0 ? (
            addresses.map((address) => (
              <ProfileAddressCard
                key={address.id}
                address={address}
                disabled={isPending}
                labels={{
                  defaultBadge: labels.defaultBadge,
                  setDefault: labels.setDefault,
                  edit: labels.edit,
                  delete: labels.delete,
                }}
                onSetDefault={onSetDefault}
                onEdit={startEdit}
                onDelete={onDelete}
              />
            ))
          ) : (
            <p className="col-span-full py-12 text-center text-sm text-gray-700 sm:py-16">
              {labels.noAddresses}
            </p>
          )}
        </div>
      </section>

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title={labels.delete}
        description={labels.deleteConfirm}
        confirmLabel={labels.delete}
        cancelLabel={labels.cancel}
        isPending={isPending}
        onClose={() => {
          if (!isPending) setPendingDeleteId(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
