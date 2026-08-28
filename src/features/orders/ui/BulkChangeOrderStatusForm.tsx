"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
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
import { bulkArchiveOrdersAction } from "@/features/orders/application/bulk-archive-orders";
import { AdminInlineStatusSelect } from "@/features/orders/ui/AdminInlineStatusSelect";
import { formatOrderDrawerMoney } from "@/features/orders/ui/order-drawer-format";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type BulkOrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  contactName: string;
  contactEmail: string;
  totalAmount: number;
  baseCurrency: string;
  placedAt: string | Date;
  isArchived: boolean;
};

type BulkChangeOrderStatusFormProps = {
  locale: string;
  orders: BulkOrderRow[];
  onOpenOrder: (orderNumber: string) => void;
  copy: Dictionary["admin"];
};

function formatPlacedParts(value: string | Date): {
  time: string;
  date: string;
} {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { time: "—", date: "—" };
  }
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return {
    time: `${hours}:${minutes}`,
    date: `${year}-${month}-${day}`,
  };
}

export function BulkChangeOrderStatusForm({
  locale,
  orders,
  onOpenOrder,
  copy,
}: BulkChangeOrderStatusFormProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const allNumbers = orders.map((order) => order.orderNumber);
  const allSelected =
    allNumbers.length > 0 && allNumbers.every((n) => selected.has(n));

  function toggleOne(orderNumber: string): void {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(orderNumber)) {
        next.delete(orderNumber);
      } else {
        next.add(orderNumber);
      }
      return next;
    });
  }

  function toggleAll(): void {
    setSelected(allSelected ? new Set() : new Set(allNumbers));
  }

  function deleteSelected(): void {
    if (selected.size === 0) {
      setError(copy.orders.bulk.selectAtLeastOne);
      return;
    }
    setConfirmOpen(true);
  }

  function confirmDelete(): void {
    const orderNumbers = [...selected];
    startTransition(async () => {
      setError(null);
      setMessage(null);
      const result = await bulkArchiveOrdersAction(locale, {
        orderNumbers,
      });

      if (!result.ok) {
        setError(result.error.message);
        return;
      }

      setMessage(
        copy.orders.bulk.deletedSummary
          .replace("{archived}", String(result.value.archived))
          .replace("{skipped}", String(result.value.skipped)),
      );
      setSelected(new Set());
      setConfirmOpen(false);
      router.refresh();
    });
  }

  const selectedCountLabel = copy.common.selectedCount
    .replace("{count}", String(selected.size))
    .replace(
      "{entity}",
      selected.size === 1
        ? copy.common.entitySingular.order
        : copy.common.entitySingular.orders,
    );

  return (
    <div className="flex flex-col gap-4">
      {selected.size > 0 ? (
        <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="text-sm text-gray-700">{selectedCountLabel}</p>
          <Button
            type="button"
            size="sm"
            variant="danger"
            disabled={isPending}
            onClick={deleteSelected}
          >
            {isPending ? copy.common.deleting : copy.orders.bulk.deleteSelected}
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
                    disabled={isPending || orders.length === 0}
                    aria-label={copy.orders.bulk.selectAllAria}
                  />
                </th>
                <th className={ADMIN_TABLE_TH}>{copy.orders.table.order}</th>
                <th className={ADMIN_TABLE_TH}>{copy.orders.table.customer}</th>
                <th className={ADMIN_TABLE_TH_CENTER}>
                  {copy.orders.table.total}
                </th>
                <th className={ADMIN_TABLE_TH_CENTER}>
                  {copy.orders.table.placed}
                </th>
                <th className={ADMIN_TABLE_TH_CENTER}>
                  {copy.orders.table.status}
                </th>
                <th className={ADMIN_TABLE_TH_CENTER}>
                  {copy.orders.table.payment}
                </th>
                <th className={ADMIN_TABLE_TH_CENTER}>
                  {copy.orders.table.paymentMethod}
                </th>
              </tr>
            </thead>
            <tbody className={ADMIN_TABLE_TBODY}>
              {orders.map((order) => {
                const placed = formatPlacedParts(order.placedAt);
                return (
                  <tr
                    key={order.id}
                    className={`${ADMIN_TABLE_ROW} cursor-pointer`}
                    onClick={() => onOpenOrder(order.orderNumber)}
                  >
                    <td
                      className={ADMIN_TABLE_TD_CHECK}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        className={ADMIN_TABLE_CHECKBOX}
                        checked={selected.has(order.orderNumber)}
                        onChange={() => toggleOne(order.orderNumber)}
                        disabled={isPending || order.isArchived}
                        aria-label={copy.orders.bulk.selectOneAria.replace(
                          "{orderNumber}",
                          order.orderNumber,
                        )}
                      />
                    </td>
                    <td className={ADMIN_TABLE_TD}>
                      <span className="font-medium text-gray-900">
                        {order.orderNumber}
                      </span>
                      {order.isArchived ? (
                        <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase text-gray-600">
                          {copy.orders.table.archivedBadge}
                        </span>
                      ) : null}
                    </td>
                    <td className={ADMIN_TABLE_TD}>
                      <p className="font-medium text-gray-900">
                        {order.contactName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.contactEmail}
                      </p>
                    </td>
                    <td className={ADMIN_TABLE_TD_CENTER}>
                      <span className="font-semibold text-gray-900">
                        {formatOrderDrawerMoney(
                          order.totalAmount,
                          order.baseCurrency,
                        )}
                      </span>
                    </td>
                    <td className={ADMIN_TABLE_TD_CENTER}>
                      <p className="text-sm text-gray-700">{placed.time}</p>
                      <p className="text-xs text-gray-500">{placed.date}</p>
                    </td>
                    <td
                      className={ADMIN_TABLE_TD_CENTER}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="inline-flex justify-center">
                        <AdminInlineStatusSelect
                          locale={locale}
                          orderNumber={order.orderNumber}
                          kind="order"
                          value={order.status}
                          disabled={isPending || order.isArchived}
                          copy={copy}
                        />
                      </div>
                    </td>
                    <td
                      className={ADMIN_TABLE_TD_CENTER}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="inline-flex justify-center">
                        <AdminInlineStatusSelect
                          locale={locale}
                          orderNumber={order.orderNumber}
                          kind="payment"
                          value={order.paymentStatus}
                          disabled={isPending || order.isArchived}
                          copy={copy}
                        />
                      </div>
                    </td>
                    <td className={ADMIN_TABLE_TD_CENTER}>
                      <span className="text-sm text-gray-700">
                        {order.paymentMethod ?? copy.common.none}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {orders.length === 0 ? (
          <p className={`${ADMIN_TABLE_STATE_INSET} text-sm text-gray-600`}>
            {copy.orders.bulk.empty}
          </p>
        ) : (
          <div className={ADMIN_TABLE_FOOTER_ROUNDED_B}>
            <p className="text-sm text-gray-600">
              {copy.orders.bulk.selectedOnPage.replace(
                "{count}",
                String(selected.size),
              )}
            </p>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title={copy.confirm.deleteTitle}
        description={copy.confirm.deleteSelectedOrders
          .replace("{count}", String(selected.size))
          .replace("{plural}", selected.size === 1 ? "" : "s")}
        confirmLabel={copy.confirm.confirmLabel}
        cancelLabel={copy.confirm.cancelLabel}
        isPending={isPending}
        onClose={() => {
          if (!isPending) setConfirmOpen(false);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
