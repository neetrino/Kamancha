import { notFound } from "next/navigation";

import { AdminPagination } from "@/features/admin/ui/AdminPagination";
import { ADMIN_PAGE_TITLE } from "@/features/admin/ui/admin-form-classes";
import { listAdminGroupOrders } from "@/features/group-orders/application/queries";
import {
  adminGroupOrdersFilterSchema,
  type AdminGroupOrdersFilterInput,
} from "@/features/group-orders/schemas";
import { AdminGroupOrdersFilters } from "@/features/group-orders/ui/AdminGroupOrdersFilters";
import { AdminGroupOrdersView } from "@/features/group-orders/ui/AdminGroupOrdersView";
import { requireAdmin } from "@/lib/auth/policies";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getSelectedCurrency } from "@/lib/money/display-price";

type PageProps = {
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

function buildGroupOrdersQuery(
  filters: AdminGroupOrdersFilterInput,
  page: number,
): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.paymentMode) params.set("paymentMode", filters.paymentMode);
  params.set("page", String(page));
  return params.toString();
}

export default async function AdminGroupOrdersPage({
  params,
  searchParams,
}: PageProps) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;

  await requireAdmin(locale);
  const dictionary = getDictionary(locale);
  const copy = dictionary.admin.groupOrders;
  const currency = await getSelectedCurrency();

  const raw = await searchParams;
  const parsed = adminGroupOrdersFilterSchema.safeParse({
    q: firstParam(raw.q) || undefined,
    status: firstParam(raw.status) || undefined,
    paymentMode: firstParam(raw.paymentMode) || undefined,
    page: firstParam(raw.page) ?? "1",
  });
  const filters: AdminGroupOrdersFilterInput = parsed.success
    ? parsed.data
    : { page: 1 };

  const { rows, total, pageSize } = await listAdminGroupOrders(filters);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <h1 className={ADMIN_PAGE_TITLE}>{copy.title}</h1>
      <AdminGroupOrdersFilters
        total={total}
        q={filters.q}
        status={filters.status}
        paymentMode={filters.paymentMode}
        copy={copy.filters}
      />
      <AdminGroupOrdersView
        locale={locale}
        currency={currency}
        rows={rows}
        copy={copy}
        confirmCopy={dictionary.admin.confirm}
        commonCopy={dictionary.admin.common}
      />
      <AdminPagination
        page={filters.page}
        totalPages={totalPages}
        ariaLabel={copy.title}
        previousLabel={dictionary.admin.common.previous}
        nextLabel={dictionary.admin.common.next}
        pageOfLabel={dictionary.admin.common.pageOf}
        prevHref={`/${locale}/admin/group-orders?${buildGroupOrdersQuery(filters, filters.page - 1)}`}
        nextHref={`/${locale}/admin/group-orders?${buildGroupOrdersQuery(filters, filters.page + 1)}`}
      />
    </div>
  );
}
