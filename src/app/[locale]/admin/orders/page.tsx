import { notFound } from "next/navigation";

import { AdminPagination } from "@/features/admin/ui/AdminPagination";
import { ADMIN_PAGE_TITLE } from "@/features/admin/ui/admin-form-classes";
import { listAdminOrders } from "@/features/orders/application/queries";
import type { OrderStatus } from "@/features/orders/domain/order-status";
import {
  adminOrdersFilterSchema,
  type CustomerOrderKind,
} from "@/features/orders/schemas/change-status";
import { AdminOrderKindFilter } from "@/features/orders/ui/AdminOrderKindFilter";
import { AdminOrdersFilters } from "@/features/orders/ui/AdminOrdersFilters";
import { AdminOrdersView } from "@/features/orders/ui/AdminOrdersView";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AdminOrdersPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function buildOrdersQuery(
  filters: {
    q?: string;
    status?: OrderStatus;
    paymentStatus?: string;
    kind: CustomerOrderKind;
    page: number;
  },
  page: number,
): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.paymentStatus) params.set("paymentStatus", filters.paymentStatus);
  if (filters.kind !== "all") params.set("kind", filters.kind);
  params.set("page", String(page));
  return params.toString();
}

export default async function AdminOrdersPage({
  params,
  searchParams,
}: AdminOrdersPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const copy = dictionary.admin;

  const raw = await searchParams;
  const parsed = adminOrdersFilterSchema.safeParse({
    status: firstParam(raw.status) || undefined,
    paymentStatus: firstParam(raw.paymentStatus) || undefined,
    archived: "active",
    q: firstParam(raw.q) || undefined,
    kind: firstParam(raw.kind) || "all",
    page: firstParam(raw.page) ?? "1",
  });

  const filters = parsed.success
    ? { ...parsed.data, kind: parsed.data.kind ?? ("all" as const) }
    : {
        page: 1 as const,
        archived: "active" as const,
        status: undefined,
        paymentStatus: undefined,
        dateFrom: undefined,
        dateTo: undefined,
        q: undefined,
        kind: "all" as const,
      };

  const { rows, total, pageSize } = await listAdminOrders(filters);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <section>
      <div className="mb-6">
        <h1 className={ADMIN_PAGE_TITLE}>{copy.orders.title}</h1>
      </div>

      <AdminOrderKindFilter
        locale={locale}
        active={filters.kind}
        baseQuery={{
          q: filters.q,
          status: filters.status,
          paymentStatus: filters.paymentStatus,
        }}
        labels={{
          all: copy.orders.kindFilter.all,
          personal: copy.orders.kindFilter.personal,
          group: copy.orders.kindFilter.group,
          aria: copy.orders.kindFilter.aria,
        }}
      />

      <AdminOrdersFilters
        total={total}
        status={filters.status}
        paymentStatus={filters.paymentStatus}
        kind={filters.kind}
        q={filters.q}
        copy={copy}
      />

      <AdminOrdersView locale={locale} orders={rows} copy={copy} />

      <AdminPagination
        page={filters.page}
        totalPages={totalPages}
        ariaLabel={copy.orders.title}
        previousLabel={copy.common.previous}
        nextLabel={copy.common.next}
        pageOfLabel={copy.common.pageOf}
        prevHref={`/${locale}/admin/orders?${buildOrdersQuery(filters, filters.page - 1)}`}
        nextHref={`/${locale}/admin/orders?${buildOrdersQuery(filters, filters.page + 1)}`}
      />
    </section>
  );
}
