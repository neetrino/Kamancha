"use client";

import {
  ADMIN_TABLE_CHECKBOX,
  ADMIN_TABLE_ROW,
  ADMIN_TABLE_TD,
  ADMIN_TABLE_TD_CENTER,
  ADMIN_TABLE_TD_CHECK,
} from "@/features/admin/ui/admin-table-classes";
import { formatAdminPlacedParts } from "@/features/admin/ui/format-admin-placed";
import { AdminCustomerNoteButton } from "@/features/orders/ui/AdminCustomerNoteButton";
import { AdminInlineStatusSelect } from "@/features/orders/ui/AdminInlineStatusSelect";
import { AdminOrderDeliveryCell } from "@/features/orders/ui/AdminOrderDeliveryCell";
import { formatOrderDrawerMoney } from "@/features/orders/ui/order-drawer-format";
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
  bonusEarnedAmount: number;
};

type AdminOrderDeliveryGroupRowsProps = {
  title: string | null;
  countLabel: string;
  orders: BulkOrderRow[];
  locale: string;
  selected: Set<string>;
  isPending: boolean;
  copy: Dictionary["admin"];
  onOpenOrder: (orderNumber: string) => void;
  onToggleOne: (orderNumber: string) => void;
};

const DELIVERY_GROUP_COLSPAN = 10;

/**
 * Optional day header + order rows for one scheduled delivery date group.
 */
export function AdminOrderDeliveryGroupRows({
  title,
  countLabel,
  orders,
  locale,
  selected,
  isPending,
  copy,
  onOpenOrder,
  onToggleOne,
}: AdminOrderDeliveryGroupRowsProps) {
  return (
    <>
      {title ? (
        <tr className="bg-gray-50/90">
          <td
            colSpan={DELIVERY_GROUP_COLSPAN}
            className="px-4 py-2.5 text-left"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">
                {title}
              </span>
              <span className="text-xs text-gray-500">{countLabel}</span>
            </div>
          </td>
        </tr>
      ) : null}
      {orders.map((order) => {
        const placed = formatAdminPlacedParts(order.placedAt);
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
                onChange={() => onToggleOne(order.orderNumber)}
                disabled={isPending || order.isArchived}
                aria-label={copy.orders.bulk.selectOneAria.replace(
                  "{orderNumber}",
                  order.orderNumber,
                )}
              />
            </td>
            <td className={ADMIN_TABLE_TD}>
              <div className="flex flex-col items-start gap-1">
                <span className="font-medium text-gray-900">
                  {order.orderNumber}
                </span>
                {order.isNew || order.isGroupOrder || order.isArchived ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {order.isNew ? (
                      <span className="rounded-full bg-brand-forest px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                        {copy.orders.table.newBadge}
                      </span>
                    ) : null}
                    {order.isGroupOrder ? (
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium uppercase text-indigo-700">
                        {copy.orders.table.groupOrderBadge}
                      </span>
                    ) : null}
                    {order.isArchived ? (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase text-gray-600">
                        {copy.orders.table.archivedBadge}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </td>
            <td className={ADMIN_TABLE_TD}>
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">
                    {order.contactName}
                  </p>
                  <p className="text-xs text-gray-500">{order.contactPhone}</p>
                </div>
                {order.customerAdminNote ? (
                  <div onClick={(event) => event.stopPropagation()}>
                    <AdminCustomerNoteButton
                      note={order.customerAdminNote}
                      customerName={order.contactName}
                      title={copy.orders.customerNote.title}
                      closeLabel={copy.orders.customerNote.close}
                      openAriaLabel={copy.orders.customerNote.openAria.replace(
                        "{name}",
                        order.contactName,
                      )}
                    />
                  </div>
                ) : null}
              </div>
            </td>
            <td className={ADMIN_TABLE_TD_CENTER}>
              <span className="font-semibold text-gray-900">
                {formatOrderDrawerMoney(order.totalAmount, order.baseCurrency)}
              </span>
            </td>
            <td className={ADMIN_TABLE_TD_CENTER}>
              <span className="text-sm font-bold text-brand-forest tabular-nums">
                {order.bonusEarnedAmount > 0
                  ? `+${formatOrderDrawerMoney(order.bonusEarnedAmount, order.baseCurrency)}`
                  : copy.common.none}
              </span>
            </td>
            <td className={ADMIN_TABLE_TD_CENTER}>
              <AdminOrderDeliveryCell
                scheduledDeliveryDate={order.scheduledDeliveryDate}
                scheduledDeliveryStart={order.scheduledDeliveryStart}
                scheduledDeliveryEnd={order.scheduledDeliveryEnd}
                copy={copy.orders.table}
              />
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
    </>
  );
}
