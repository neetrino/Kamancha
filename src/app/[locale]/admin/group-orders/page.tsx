import { notFound } from "next/navigation";

import { ADMIN_PAGE_TITLE } from "@/features/admin/ui/admin-form-classes";
import { listAdminGroupOrders } from "@/features/group-orders/application/queries";
import { adminGroupOrdersFilterSchema } from "@/features/group-orders/schemas";
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

export default async function AdminGroupOrdersPage({
  params,
  searchParams,
}: PageProps) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;

  await requireAdmin(locale);
  const copy = getDictionary(locale).admin.groupOrders;
  const currency = await getSelectedCurrency();

  const raw = await searchParams;
  const parsed = adminGroupOrdersFilterSchema.safeParse({
    q: firstParam(raw.q) || undefined,
    status: firstParam(raw.status) || undefined,
    paymentMode: firstParam(raw.paymentMode) || undefined,
  });
  const filters = parsed.success ? parsed.data : {};

  const { rows, total } = await listAdminGroupOrders({
    ...filters,
    limit: 100,
  });

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
      />
    </div>
  );
}
