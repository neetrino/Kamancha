"use client";

import type { CustomerAddressListItem } from "@/features/profile/application/address-queries";
import {
  PROFILE_PILL_SM,
  PROFILE_PILL_SM_DANGER,
} from "@/features/profile/ui/profile-surface";

type ProfileAddressCardProps = {
  address: CustomerAddressListItem;
  disabled: boolean;
  labels: {
    defaultBadge: string;
    setDefault: string;
    edit: string;
    delete: string;
  };
  onSetDefault: (addressId: string) => void;
  onEdit: (address: CustomerAddressListItem) => void;
  onDelete: (addressId: string) => void;
};

export function ProfileAddressCard({
  address,
  disabled,
  labels,
  onSetDefault,
  onEdit,
  onDelete,
}: ProfileAddressCardProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/50 bg-white/35 p-4 sm:p-5 lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
        <div className="min-w-0 flex-1 space-y-2">
          {address.isDefaultShipping ? (
            <span className="inline-flex rounded-full bg-brand-forest px-2.5 py-1 font-big-fat-boii text-xs font-normal tracking-wide text-white uppercase">
              {labels.defaultBadge}
            </span>
          ) : null}
          <p className="text-sm text-gray-800 sm:text-base">{address.line1}</p>
          <p className="text-sm text-gray-800 sm:text-base">{address.city}</p>
          {address.phone ? (
            <p className="text-sm text-gray-600 sm:text-base">{address.phone}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2 border-t border-white/35 pt-4 lg:border-0 lg:pt-0">
          {!address.isDefaultShipping ? (
            <button
              type="button"
              className={`${PROFILE_PILL_SM} flex-1 sm:flex-initial`}
              onClick={() => onSetDefault(address.id)}
              disabled={disabled}
            >
              {labels.setDefault}
            </button>
          ) : null}
          <button
            type="button"
            className={`${PROFILE_PILL_SM} flex-1 sm:flex-initial`}
            onClick={() => onEdit(address)}
            disabled={disabled}
          >
            {labels.edit}
          </button>
          <button
            type="button"
            className={`${PROFILE_PILL_SM_DANGER} flex-1 sm:flex-initial`}
            onClick={() => onDelete(address.id)}
            disabled={disabled}
          >
            {labels.delete}
          </button>
        </div>
      </div>
    </div>
  );
}
