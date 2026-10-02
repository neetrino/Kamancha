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
  ADMIN_TABLE_STATE_INSET,
  ADMIN_TABLE_TBODY,
  ADMIN_TABLE_TH,
  ADMIN_TABLE_TH_CENTER,
  ADMIN_TABLE_TH_CHECK,
  ADMIN_TABLE_THEAD,
} from "@/features/admin/ui/admin-table-classes";
import { bulkArchiveOrdersAction } from "@/features/orders/application/bulk-archive-orders";
import {
  classifyAdminDeliveryDay,
  formatYmdDisplay,
  groupOrdersByDeliveryDate,
} from "@/features/orders/domain/admin-delivery-day";
import { AdminOrderDeliveryGroupRows } from "@/features/orders/ui/AdminOrderDeliveryGroupRows";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type BulkOrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  contactName: string;
  contactPhone: string;
  totalAmount: number;
  baseCurrency: string;
  placedAt: string | Date;
  isArchived: boolean;
  isGroupOrder: boolean;
  isNew: boolean;
  customerAdminNote: string | null;
  scheduledDeliveryDate: string | null;
  scheduledDeliveryStart: string | null;
  scheduledDeliveryEnd: string | null;
};

function deliveryGroupTitle(
  date: string | null,
  copy: Dictionary["admin"]["orders"]["table"],
): string {
  if (!date) return copy.deliveryGroupNone;
  const kind = classifyAdminDeliveryDay(date);
  const formatted = formatYmdDisplay(date);
  if (kind === "today") {
    return copy.deliveryGroupToday.replace("{date}", formatted);
  }
  if (kind === "tomorrow") {
    return copy.deliveryGroupTomorrow.replace("{date}", formatted);
  }
  return copy.deliveryGroupDate.replace("{date}", formatted);
}

type BulkChangeOrderStatusFormProps = {
  locale: string;
  orders: BulkOrderRow[];
  onOpenOrder: (orderNumber: string) => void;
  copy: Dictionary["admin"];
};

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

  const deliveryGroups = groupOrdersByDeliveryDate(orders);
  const showDeliveryGroups = deliveryGroups.length > 1;

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
                  {copy.orders.table.delivery}
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
              {deliveryGroups.map((group) => {
                const headerKey = group.date ?? "none";
                return (
                  <AdminOrderDeliveryGroupRows
                    key={headerKey}
                    title={
                      showDeliveryGroups
                        ? deliveryGroupTitle(group.date, copy.orders.table)
                        : null
                    }
                    countLabel={copy.orders.table.deliveryGroupCount.replace(
                      "{count}",
                      String(group.orders.length),
                    )}
                    orders={group.orders}
                    locale={locale}
                    selected={selected}
                    isPending={isPending}
                    copy={copy}
                    onOpenOrder={onOpenOrder}
                    onToggleOne={toggleOne}
                  />
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
