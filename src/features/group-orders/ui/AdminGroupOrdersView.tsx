"use client";

import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { SideSheet } from "@/components/ui/SideSheet";
import {
  groupOrderStatusBadgeClass,
  paymentStatusBadgeClass,
} from "@/features/admin/ui/status-badge";
import {
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

type AdminGroupOrdersViewProps = {
  locale: Locale;
  currency: Currency;
  rows: AdminGroupOrderListItem[];
  copy: Dictionary["admin"]["groupOrders"];
};

export function AdminGroupOrdersView({
  locale,
  currency,
  rows,
  copy,
}: AdminGroupOrdersViewProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [detail, setDetail] = useState<GroupOrderDetailView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activityOpen, setActivityOpen] = useState(false);

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

  return (
    <>
      <div
        className={`overflow-x-auto rounded-xl border border-gray-200 bg-white ${pending ? "opacity-70" : ""}`}
      >
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">{copy.id}</th>
              <th className="px-4 py-3">{copy.organizer}</th>
              <th className="px-4 py-3">{copy.mode}</th>
              <th className="px-4 py-3 text-center">{copy.status}</th>
              <th className="px-4 py-3 text-center">{copy.participants}</th>
              <th className="px-4 py-3 text-center">{copy.delivery}</th>
              <th className="px-4 py-3">{copy.created}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  {copy.empty}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer border-b border-gray-50 hover:bg-gray-50"
                  onClick={() => openDetail(row.id)}
                >
                  <td className="px-4 py-3 font-mono text-xs">
                    {row.id.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3">{row.organizerDisplayName}</td>
                  <td className="px-4 py-3 text-xs">{row.paymentMode}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${groupOrderStatusBadgeClass(row.status)}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.participantCount}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.deliveryAmount} ֏
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(row.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
                <p className="font-mono text-xs text-gray-500">
                  {detail.id.slice(0, 8)}…
                </p>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${groupOrderStatusBadgeClass(detail.status)}`}
                >
                  {detail.status}
                </span>
                <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                  {detail.paymentMode}
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
                    {detail.events.map((event) => (
                      <li key={event.id}>
                        {new Date(event.createdAt).toLocaleString()} —{" "}
                        {event.eventType}
                        {event.fromState || event.toState
                          ? ` (${event.fromState ?? "—"} → ${event.toState ?? "—"})`
                          : ""}
                      </li>
                    ))}
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
    </>
  );
}
