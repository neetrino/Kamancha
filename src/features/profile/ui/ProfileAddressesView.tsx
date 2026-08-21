"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
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

type AddressFormState = {
  line1: string;
  city: string;
  isDefault: boolean;
};

type ProfileAddressesViewProps = {
  locale: string;
  addresses: CustomerAddressListItem[];
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
    city: string;
    isDefault: string;
    cancel: string;
    add: string;
    update: string;
    saving: string;
  };
};

const emptyForm: AddressFormState = {
  line1: "",
  city: "",
  isDefault: false,
};

export function ProfileAddressesView({
  locale,
  addresses,
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
      const result = editingId
        ? await updateCustomerAddressAction(locale, editingId, form)
        : await createCustomerAddressAction(locale, form);

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
        <div className="relative z-[2] mb-6 flex flex-col gap-4 border-b border-gray-100 pb-5 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:pb-6 lg:border-white/35">
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
            className="relative z-[2] mb-8 space-y-5 overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 p-4 sm:mb-10 sm:p-6 lg:border-white/50 lg:bg-white/35"
          >
            <h2 className="font-big-fat-boii text-base font-normal tracking-wide text-gray-900 uppercase">
              {editingId ? labels.formEditTitle : labels.formAddTitle}
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
              <label className={PROFILE_LABEL}>
                {labels.line1}
                <input
                  required
                  value={form.line1}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, line1: event.target.value }))
                  }
                  className={PROFILE_FIELD}
                  autoComplete="street-address"
                />
              </label>
              <label className={PROFILE_LABEL}>
                {labels.city}
                <input
                  required
                  value={form.city}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, city: event.target.value }))
                  }
                  className={PROFILE_FIELD}
                  autoComplete="address-level2"
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
