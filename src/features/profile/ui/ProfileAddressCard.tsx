"use client";

import { SquarePen, Trash2 } from "lucide-react";

import type { CustomerAddressListItem } from "@/features/profile/application/address-queries";
import {
  PROFILE_INNER_CARD,
  PROFILE_PILL_GHOST,
  PROFILE_STATUS_BADGE,
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

const ICON_BUTTON =
  "flex size-8 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-white/70 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50";

export function ProfileAddressCard({
  address,
  disabled,
  labels,
  onSetDefault,
  onEdit,
  onDelete,
}: ProfileAddressCardProps) {
  return (
    <article className={`flex h-full flex-col p-4 sm:p-5 ${PROFILE_INNER_CARD}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {address.isDefaultShipping ? (
            <div className="mb-3">
              <span className={PROFILE_STATUS_BADGE}>{labels.defaultBadge}</span>
            </div>
          ) : null}
          <h2 className="truncate text-base font-semibold text-gray-900">
            {address.line1}
          </h2>
          <p className="mt-1 truncate text-sm text-gray-600">{address.city}</p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            className={ICON_BUTTON}
            aria-label={labels.edit}
            disabled={disabled}
            onClick={() => onEdit(address)}
          >
            <SquarePen className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            className={ICON_BUTTON}
            aria-label={labels.delete}
            disabled={disabled}
            onClick={() => onDelete(address.id)}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      {!address.isDefaultShipping ? (
        <div className="mt-auto pt-5">
          <button
            type="button"
            className={`${PROFILE_PILL_GHOST} w-full`}
            onClick={() => onSetDefault(address.id)}
            disabled={disabled}
          >
            {labels.setDefault}
          </button>
        </div>
      ) : null}
    </article>
  );
}
