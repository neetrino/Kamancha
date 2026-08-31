"use client";

import type { KeyboardEvent } from "react";
import { ArrowRight, ShoppingBag } from "lucide-react";

import {
  PROFILE_INNER_CARD,
  PROFILE_STATUS_BADGE,
} from "@/features/profile/ui/profile-surface";

type ProfileRecentOrderCardProps = {
  orderNumber: string;
  status: string;
  totalLabel: string;
  metaLine: string;
  placedOnLine: string;
  orderNumberLabel: string;
  viewDetailsLabel: string;
  groupOrderBadgeLabel?: string;
  isGroupOrder?: boolean;
  onViewDetails: () => void;
};

function handleCardKeyDown(
  event: KeyboardEvent<HTMLElement>,
  onViewDetails: () => void,
): void {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onViewDetails();
  }
}

export function ProfileRecentOrderCard({
  orderNumber,
  status,
  totalLabel,
  metaLine,
  placedOnLine,
  orderNumberLabel,
  viewDetailsLabel,
  groupOrderBadgeLabel,
  isGroupOrder = false,
  onViewDetails,
}: ProfileRecentOrderCardProps) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onViewDetails}
      onKeyDown={(event) => handleCardKeyDown(event, onViewDetails)}
      className={`profile-order-card flex h-full w-full min-w-0 cursor-pointer flex-col items-stretch p-4 text-left transition-transform duration-200 ease-out hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-5 ${PROFILE_INNER_CARD}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-big-fat-boii text-base font-normal tracking-wide text-gray-900 uppercase">
            {orderNumberLabel} {orderNumber}
          </h3>
          <p className="mt-2 font-big-fat-boii text-lg leading-none font-normal tracking-wide text-brand-forest sm:text-xl">
            {totalLabel}
          </p>
        </div>
        <div className="inline-flex shrink-0 flex-col items-stretch gap-1.5">
          <span className={`${PROFILE_STATUS_BADGE} justify-center`}>
            {status}
          </span>
          {isGroupOrder && groupOrderBadgeLabel ? (
            <span className="inline-flex items-center justify-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium normal-case text-emerald-500">
              {groupOrderBadgeLabel}
            </span>
          ) : null}
        </div>
      </div>

      <div className="my-4 h-px rounded-full bg-gray-200" aria-hidden />

      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-forest text-white">
          <ShoppingBag className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 pt-0.5 text-sm leading-snug text-gray-700">
          <p>{metaLine}</p>
          <p className="whitespace-nowrap">{placedOnLine}</p>
        </div>
      </div>

      <div className="mt-auto hidden w-full self-stretch pt-5 sm:block">
        <div
          className="profile-order-card-cta box-border flex w-full min-w-0 items-center gap-2 rounded-full bg-brand-forest py-0.5 pr-0.5 pl-3 font-big-fat-boii text-xs font-normal tracking-wide text-white uppercase"
          aria-hidden
        >
          <span className="min-w-0 flex-1 truncate text-center">
            {viewDetailsLabel}
          </span>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-brand-forest">
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </span>
        </div>
      </div>
    </article>
  );
}
