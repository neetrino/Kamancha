"use client";

import type { KeyboardEvent } from "react";
import { ShoppingBag } from "lucide-react";

import { KamanchaPillButton } from "@/components/ui/KamanchaPillButton";
import { orderStatusBadgeClass } from "@/features/admin/ui/status-badge";
import { PROFILE_INNER_CARD } from "@/features/profile/ui/profile-surface";

type ProfileRecentOrderCardProps = {
  orderNumber: string;
  status: string;
  statusCode: string;
  totalLabel: string;
  bonusEarnedLabel?: string | null;
  metaLine: string;
  placedOnLine: string;
  rateLabel: string;
  rated?: boolean;
  orderNumberLabel: string;
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
  statusCode,
  totalLabel,
  bonusEarnedLabel = null,
  metaLine,
  placedOnLine,
  rateLabel,
  rated = false,
  orderNumberLabel,
  groupOrderBadgeLabel,
  isGroupOrder = false,
  onViewDetails,
}: ProfileRecentOrderCardProps) {
  const showRate = statusCode === "DELIVERED" && !rated;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onViewDetails}
      onKeyDown={(event) => handleCardKeyDown(event, onViewDetails)}
      className={`profile-order-card flex h-full w-full min-w-0 cursor-pointer flex-col items-stretch p-4 text-left transition-transform duration-200 ease-out hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${PROFILE_INNER_CARD}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-big-fat-boii text-base font-normal tracking-wide whitespace-nowrap text-gray-900 uppercase">
            {orderNumberLabel} {orderNumber}
          </h3>
          <p className="mt-2 font-big-fat-boii text-lg leading-none font-normal tracking-wide text-brand-forest">
            {totalLabel}
          </p>
        </div>
        <div className="inline-flex shrink-0 flex-col items-end gap-1.5">
          <span
            className={`inline-flex justify-center rounded-full px-3 py-1 text-xs font-medium capitalize ${orderStatusBadgeClass(statusCode)}`}
          >
            {status}
          </span>
          <div className="flex min-h-6 flex-wrap items-center justify-end gap-1.5">
            {bonusEarnedLabel ? (
              <p className="inline-flex items-center rounded-full bg-brand-forest px-2.5 py-1 text-xs font-bold text-white">
                {bonusEarnedLabel}
              </p>
            ) : null}
            {isGroupOrder && groupOrderBadgeLabel ? (
              <span className="inline-flex items-center justify-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium normal-case text-emerald-500">
                {groupOrderBadgeLabel}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-auto flex flex-col">
        <div
          className={`h-px rounded-full bg-gray-200 ${showRate ? "mt-4" : "my-4"}`}
          aria-hidden
        />

        {showRate ? (
          <div className="-mb-4 flex h-[72px] items-center">
            <KamanchaPillButton
              type="button"
              variant="dark"
              label={rateLabel}
              onClick={(event) => {
                event.stopPropagation();
                onViewDetails();
              }}
              className="kamancha-pill-button--guest-cta !h-12 !min-h-0 !max-h-12 !max-w-none !py-0 !text-lg !leading-none xl:!text-base [&>span]:w-full [&>span]:shrink-0 [&>span]:text-center [&>span]:text-white"
            />
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-forest text-white">
              <ShoppingBag className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 pt-0.5 text-sm leading-snug text-gray-700">
              <p>{metaLine}</p>
              <p className="whitespace-nowrap">{placedOnLine}</p>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
