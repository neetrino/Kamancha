"use client";

import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SideSheet } from "@/components/ui/SideSheet";
import {
  ADMIN_TABLE,
  ADMIN_TABLE_CARD,
  ADMIN_TABLE_CHECKBOX,
  ADMIN_TABLE_FOOTER_ROUNDED_B,
  ADMIN_TABLE_OUTER_SCROLL,
  ADMIN_TABLE_ROW,
  ADMIN_TABLE_STATE_INSET,
  ADMIN_TABLE_TBODY,
  ADMIN_TABLE_TD,
  ADMIN_TABLE_TD_CENTER,
  ADMIN_TABLE_TD_CHECK,
  ADMIN_TABLE_TH,
  ADMIN_TABLE_TH_CENTER,
  ADMIN_TABLE_TH_CHECK,
  ADMIN_TABLE_THEAD,
} from "@/features/admin/ui/admin-table-classes";
import { formatAdminPlacedParts } from "@/features/admin/ui/format-admin-placed";
import {
  groupOrderStatusBadgeClass,
  paymentStatusBadgeClass,
} from "@/features/admin/ui/status-badge";
import {
  adminBulkCancelGroupOrdersAction,
  adminCancelGroupOrderAction,
  adminCloseJoinsAction,
  adminMarkParticipantPaidAction,
  getAdminGroupOrderDetailAction,
} from "@/features/group-orders/actions";
import type {
  AdminGroupOrderListItem,
  GroupOrderDetailView,
} from "@/features/group-orders/application/queries";
import { PROFILE_INNER_CARD } from "@/features/profile/ui/profile-surface";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Currency } from "@/lib/money/currency";
import { formatMoneyAmount } from "@/lib/money/format";

type AdminGroupOrdersViewProps = {
  locale: Locale;
  currency: Currency;
  rows: AdminGroupOrderListItem[];
  copy: Dictionary["admin"]["groupOrders"];
  confirmCopy: Dictionary["admin"]["confirm"];
  commonCopy: Dictionary["admin"]["common"];
};

function compactGroupOrderId(inviteToken: string): string {
  return inviteToken.slice(0, 8).toUpperCase();
}

function paymentModeLabel(
  mode: string,
  copy: Dictionary["admin"]["groupOrders"],
): string {
  if (mode === "ORGANIZER_PAYS_ALL") {
    return copy.filters.modeOrganizerPays;
  }
  if (mode === "SPLIT_PER_PARTICIPANT") {
    return copy.filters.modeSplit;
  }
  return mode;
}

export function AdminGroupOrdersView({
  locale,
  currency,
  rows,
  copy,
  confirmCopy,
  commonCopy,
}: AdminGroupOrdersViewProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [detail, setDetail] = useState<GroupOrderDetailView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [activityOpen, setActivityOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);

  const allIds = rows.map((row) => row.id);
  const allSelected =
    allIds.length > 0 && allIds.every((id) => selected.has(id));

  function toggleOne(id: string): void {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleAll(): void {
    setSelected(allSelected ? new Set() : new Set(allIds));
  }

  function openDetail(id: string): void {
    setError(null);
    setActivityOpen(false);
    startTransition(async () => {
      const view = await getAdminGroupOrderDetailAction(id, locale, currency);
      setDetail(view);
    });
  }

  function run(
    action: () => Promise<{ ok: boolean; error?: string }>,
  ): void {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? copy.actionFailed);
        return;
      }
      if (detail) {
        const refreshed = await getAdminGroupOrderDetailAction(
          detail.id,
          locale,
          currency,
        );
        setDetail(refreshed);
      }
      router.refresh();
    });
  }

  function confirmBulkCancel(): void {
    const groupOrderIds = [...selected];
    startTransition(async () => {
      setError(null);
      setMessage(null);
      const result = await adminBulkCancelGroupOrdersAction(
        { groupOrderIds },
        locale,
      );
      if (!result.ok) {
        setError(result.error ?? copy.actionFailed);
        return;
      }
      setMessage(
        copy.bulk.cancelledSummary
          .replace("{cancelled}", String(result.cancelled))
          .replace("{skipped}", String(result.skipped)),
      );
      setSelected(new Set());
      setConfirmOpen(false);
      router.refresh();
    });
  }

  const selectedCountLabel = commonCopy.selectedCount
    .replace("{count}", String(selected.size))
    .replace(
      "{entity}",
      selected.size === 1
        ? copy.bulk.entitySingular
        : copy.bulk.entityPlural,
    );

  return (
    <>
      <div className="flex flex-col gap-4">
        {selected.size > 0 ? (
          <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="text-sm text-gray-700">{selectedCountLabel}</p>
            <Button
              type="button"
              size="sm"
              variant="danger"
              disabled={pending}
              onClick={() => setConfirmOpen(true)}
            >
              {pending ? commonCopy.deleting : copy.bulk.deleteSelected}
            </Button>
            {error ? (
              <p className="w-full text-sm text-red-700">{error}</p>
            ) : null}
            {message ? (
              <p className="w-full text-sm text-green-700">{message}</p>
            ) : null}
          </Card>
        ) : null}

        <Card className={ADMIN_TABLE_CARD}>
          <div className={ADMIN_TABLE_OUTER_SCROLL}>
            <table className={ADMIN_TABLE}>
              <thead className={ADMIN_TABLE_THEAD}>
                <tr>
                  <th className={ADMIN_TABLE_TH_CHECK}>
                    <input
                      type="checkbox"
                      className={ADMIN_TABLE_CHECKBOX}
                      checked={allSelected}
                      onChange={toggleAll}
                      disabled={pending || rows.length === 0}
                      aria-label={copy.bulk.selectAllAria}
                    />
                  </th>
                  <th className={ADMIN_TABLE_TH}>{copy.id}</th>
                  <th className={ADMIN_TABLE_TH}>{copy.organizer}</th>
                  <th className={ADMIN_TABLE_TH_CENTER}>{copy.total}</th>
                  <th className={ADMIN_TABLE_TH_CENTER}>{copy.delivery}</th>
                  <th className={ADMIN_TABLE_TH_CENTER}>{copy.created}</th>
                  <th className={ADMIN_TABLE_TH_CENTER}>{copy.status}</th>
                  <th className={ADMIN_TABLE_TH_CENTER}>{copy.participants}</th>
                  <th className={ADMIN_TABLE_TH}>{copy.mode}</th>
                </tr>
              </thead>
              <tbody className={ADMIN_TABLE_TBODY}>
                {rows.map((row) => {
                  const placed = formatAdminPlacedParts(row.createdAt);
                  const shortId = compactGroupOrderId(row.inviteToken);
                  return (
                    <tr
                      key={row.id}
                      className={`${ADMIN_TABLE_ROW} cursor-pointer`}
                      onClick={() => openDetail(row.id)}
                    >
                      <td
                        className={ADMIN_TABLE_TD_CHECK}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          className={ADMIN_TABLE_CHECKBOX}
                          checked={selected.has(row.id)}
                          onChange={() => toggleOne(row.id)}
                          disabled={pending || row.status === "CANCELLED"}
                          aria-label={copy.bulk.selectOneAria.replace(
                            "{id}",
                            shortId,
                          )}
                        />
                      </td>
                      <td className={ADMIN_TABLE_TD}>
                        <span className="font-medium text-gray-900">
                          {shortId}
                        </span>
                      </td>
                      <td className={ADMIN_TABLE_TD}>
                        <p className="font-medium text-gray-900">
                          {row.organizerDisplayName}
                        </p>
                      </td>
                      <td className={ADMIN_TABLE_TD_CENTER}>
                        <span className="font-semibold text-gray-900">
                          {formatMoneyAmount(row.totalAmount, "AMD", locale)}
                        </span>
                      </td>
                      <td className={ADMIN_TABLE_TD_CENTER}>
                        <span className="font-semibold text-gray-900">
                          {formatMoneyAmount(row.deliveryAmount, "AMD", locale)}
                        </span>
                      </td>
                      <td className={ADMIN_TABLE_TD_CENTER}>
                        <p className="text-sm text-gray-700">{placed.time}</p>
                        <p className="text-xs text-gray-500">{placed.date}</p>
                      </td>
                      <td className={ADMIN_TABLE_TD_CENTER}>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${groupOrderStatusBadgeClass(row.status)}`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className={ADMIN_TABLE_TD_CENTER}>
                        {row.participantCount}
                      </td>
                      <td className={ADMIN_TABLE_TD}>
                        <span className="text-sm text-gray-700">
                          {row.paymentMode}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {rows.length === 0 ? (
            <p className={`${ADMIN_TABLE_STATE_INSET} text-sm text-gray-600`}>
              {copy.empty}
            </p>
          ) : (
            <div className={ADMIN_TABLE_FOOTER_ROUNDED_B}>
              <p className="text-sm text-gray-600">
                {copy.bulk.selectedOnPage.replace(
                  "{count}",
                  String(selected.size),
                )}
              </p>
            </div>
          )}
        </Card>
      </div>

      <SideSheet
        open={detail != null}
        onClose={() => setDetail(null)}
        ariaLabel={copy.sheetAria}
        panelClassName="w-[90%] max-w-[480px]"
        zIndexClassName="z-[200]"
        backdropBlur
        closeButtonClassName="side-sheet-close-stroke bg-[#335329] text-white hover:bg-[#2c4823]"
      >
        {detail ? (
          <>
            <div className="border-b border-gray-100 px-6 py-5">
              <h2 className="font-big-fat-boii text-xl font-normal tracking-wide text-gray-900 uppercase">
                {copy.sheetTitle}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-gray-700">
                  {compactGroupOrderId(detail.inviteToken)}
                </p>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${groupOrderStatusBadgeClass(detail.status)}`}
                >
                  {detail.status}
                </span>
                <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                  {paymentModeLabel(detail.paymentMode, copy)}
                </span>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-4">
              <section className={`${PROFILE_INNER_CARD} space-y-3 p-4`}>
                <h3 className="font-big-fat-boii text-sm font-normal tracking-wide text-gray-900 uppercase">
                  {copy.organizer}
                </h3>
                <p className="text-sm font-medium text-gray-900">
                  {copy.organizerLabel.replace(
                    "{name}",
                    detail.organizerDisplayName,
                  )}
                </p>
                <p className="break-all text-xs text-gray-500">
                  {copy.invite.replace("{path}", detail.invitePath)}
                </p>
                <p className="text-sm text-gray-600">
                  {copy.deliveryTotal
                    .replace("{delivery}", detail.deliveryFormatted)
                    .replace("{total}", detail.grandTotalFormatted)}
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="px-1 font-big-fat-boii text-sm font-normal tracking-wide text-gray-900 uppercase">
                  {copy.participants}
                </h3>
                <ul className="space-y-3">
                  {detail.participants.map((participant) => (
                    <li
                      key={participant.id}
                      className="overflow-hidden rounded-[20px] border border-gray-200 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {participant.displayName}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${paymentStatusBadgeClass(participant.paymentStatus)}`}
                            >
                              {copy.payment.replace(
                                "{status}",
                                participant.paymentStatus,
                              )}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-gray-500">
                            {copy.subtotalDeliveryFinal
                              .replace(
                                "{subtotal}",
                                participant.subtotalFormatted,
                              )
                              .replace(
                                "{delivery}",
                                participant.deliveryShareFormatted,
                              )
                              .replace(
                                "{final}",
                                participant.finalAmountFormatted,
                              )}
                          </p>
                          <ul className="mt-2 space-y-1 text-xs text-gray-600">
                            {participant.items.map((item) => (
                              <li key={item.id}>
                                {item.title} × {item.quantity} —{" "}
                                {item.lineTotalFormatted}
                              </li>
                            ))}
                          </ul>
                        </div>
                        {participant.paymentStatus !== "PAID" &&
                        participant.paymentStatus !== "MARKED_RECEIVED" &&
                        participant.finalAmount > 0 ? (
                          <Button
                            type="button"
                            size="field"
                            variant="secondary"
                            className="shrink-0"
                            onClick={() =>
                              run(async () =>
                                adminMarkParticipantPaidAction(
                                  {
                                    groupOrderId: detail.id,
                                    participantId: participant.id,
                                  },
                                  locale,
                                ),
                              )
                            }
                          >
                            {copy.markPaid}
                          </Button>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section className={`${PROFILE_INNER_CARD} p-4`}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-2 text-left"
                  aria-expanded={activityOpen}
                  onClick={() => setActivityOpen((open) => !open)}
                >
                  <h3 className="font-big-fat-boii text-sm font-normal tracking-wide text-gray-900 uppercase">
                    {copy.activity}
                  </h3>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 ${
                      activityOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden
                  />
                </button>
                {activityOpen ? (
                  <ul className="mt-3 space-y-1.5 text-xs text-gray-500">
                    {detail.events.map((event) => {
                      const placed = formatAdminPlacedParts(event.createdAt);
                      return (
                        <li key={event.id}>
                          {placed.time} {placed.date} — {event.eventType}
                          {event.fromState || event.toState
                            ? ` (${event.fromState ?? "—"} → ${event.toState ?? "—"})`
                            : ""}
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </section>

              {error ? (
                <p className="text-sm text-red-700" role="alert">
                  {error}
                </p>
              ) : null}
            </div>

            <div className="flex flex-nowrap items-center gap-2 border-t border-gray-200 px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <Button
                type="button"
                size="field"
                variant="secondary"
                className="min-w-0 flex-1"
                onClick={() =>
                  run(async () =>
                    adminCloseJoinsAction({ groupOrderId: detail.id }, locale),
                  )
                }
              >
                {copy.closeJoins}
              </Button>
              <Button
                type="button"
                size="field"
                variant="danger"
                className="min-w-0 flex-1"
                onClick={() =>
                  run(async () =>
                    adminCancelGroupOrderAction(
                      { groupOrderId: detail.id },
                      locale,
                    ),
                  )
                }
              >
                {copy.cancel}
              </Button>
            </div>
          </>
        ) : null}
      </SideSheet>

      <ConfirmDialog
        open={confirmOpen}
        title={confirmCopy.deleteTitle}
        description={copy.bulk.deleteConfirm
          .replace("{count}", String(selected.size))
          .replace("{plural}", selected.size === 1 ? "" : "s")}
        confirmLabel={confirmCopy.confirmLabel}
        cancelLabel={confirmCopy.cancelLabel}
        isPending={pending}
        onClose={() => {
          if (!pending) setConfirmOpen(false);
        }}
        onConfirm={confirmBulkCancel}
      />
    </>
  );
}
