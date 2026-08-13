"use client";

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
  onViewDetails: () => void;
};

export function ProfileRecentOrderCard({
  orderNumber,
  status,
  totalLabel,
  metaLine,
  placedOnLine,
  orderNumberLabel,
  viewDetailsLabel,
  onViewDetails,
}: ProfileRecentOrderCardProps) {
  return (
    <button
      type="button"
      onClick={onViewDetails}
      className={`flex h-full w-full flex-col p-4 text-left transition-transform duration-200 ease-out hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-5 ${PROFILE_INNER_CARD}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 font-big-fat-boii text-base font-normal tracking-wide text-gray-900 uppercase">
          {orderNumberLabel} {orderNumber}
        </h3>
        <span className={`${PROFILE_STATUS_BADGE} shrink-0`}>{status}</span>
      </div>
      <p className="mt-2 font-big-fat-boii text-lg leading-none font-normal tracking-wide text-brand-forest sm:text-xl">
        {totalLabel}
      </p>

      <div className="my-4 h-px rounded-full bg-white/55" aria-hidden />

      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-forest text-white">
          <ShoppingBag className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 pt-0.5 text-sm leading-snug text-gray-700">
          <p>{metaLine}</p>
          <p className="whitespace-nowrap">{placedOnLine}</p>
        </div>
      </div>

      <div className="mt-auto pt-5">
        <span className="flex min-h-9 w-full items-center gap-2 rounded-full bg-brand-forest py-0.5 pr-0.5 pl-3 font-big-fat-boii text-xs font-normal tracking-wide text-white uppercase">
          <span className="min-w-0 flex-1 truncate text-center">
            {viewDetailsLabel}
          </span>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-brand-forest">
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </span>
        </span>
      </div>
    </button>
  );
}
