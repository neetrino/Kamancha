"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { AdminOrderDetailView } from "@/features/orders/application/order-detail-view";
import { getAdminOrderDetailAction } from "@/features/orders/application/get-order-detail";
import { BulkChangeOrderStatusForm } from "@/features/orders/ui/BulkChangeOrderStatusForm";
import { CustomerOrderDetailsSheet } from "@/features/orders/ui/CustomerOrderDetailsSheet";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AdminOrdersViewOrder = {
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

type AdminOrdersViewProps = {
  locale: string;
  orders: AdminOrdersViewOrder[];
  copy: Dictionary["admin"];
};

export function AdminOrdersView({ locale, orders, copy }: AdminOrdersViewProps) {
  const router = useRouter();
  const [rows, setRows] = useState(orders);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detail, setDetail] = useState<AdminOrderDetailView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setRows(orders);
  }, [orders]);

  function openOrder(orderNumber: string): void {
    setDrawerOpen(true);
    setDetail(null);
    setError(null);
    setRows((current) =>
      current.map((row) =>
        row.orderNumber === orderNumber ? { ...row, isNew: false } : row,
      ),
    );

    startTransition(async () => {
      const detailResult = await getAdminOrderDetailAction(locale, orderNumber);
      if (!detailResult.ok) {
        setError(detailResult.error.message);
        setDetail(null);
        return;
      }
      setDetail(detailResult.value);
      router.refresh();
    });
  }

  function closeDrawer(): void {
    setDrawerOpen(false);
    setDetail(null);
    setError(null);
  }

  return (
    <>
      <BulkChangeOrderStatusForm
        locale={locale}
        orders={rows}
        onOpenOrder={openOrder}
        copy={copy}
      />
      <CustomerOrderDetailsSheet
        open={drawerOpen}
        onClose={closeDrawer}
        detail={detail}
        error={error}
        isLoading={isPending}
        copy={copy}
        includeAdminDetails
        groupOrderBadgeLabel={copy.orders.table.groupOrderBadge}
        panelClassName="w-[92%] max-w-none sm:w-1/2"
      />
    </>
  );
}
