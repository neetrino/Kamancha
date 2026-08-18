import { notFound } from "next/navigation";

import { AdminPagination } from "@/features/admin/ui/AdminPagination";
import { listAdminUsers } from "@/features/users/application/queries";
import { adminUsersFilterSchema } from "@/features/users/schemas/admin-users";
import { AdminUsersView } from "@/features/users/ui/AdminUsersView";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AdminUsersPageProps = {
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

function buildUsersQuery(
  filters: {
    q?: string;
    role?: string;
    status?: string;
    page: number;
  },
  page: number,
): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.role) params.set("role", filters.role);
  if (filters.status) params.set("status", filters.status);
  params.set("page", String(page));
  return params.toString();
}

export default async function AdminUsersPage({
  params,
  searchParams,
}: AdminUsersPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const raw = await searchParams;
  const parsed = adminUsersFilterSchema.safeParse({
    q: firstParam(raw.q) || undefined,
    role: firstParam(raw.role) || undefined,
    status: firstParam(raw.status) || undefined,
    page: firstParam(raw.page) ?? "1",
  });

  const filters = parsed.success
    ? parsed.data
    : { page: 1 as const, q: undefined, role: undefined, status: undefined };

  const { rows, total, pageSize } = await listAdminUsers(filters);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <AdminUsersView
        locale={locale}
        users={rows}
        total={total}
        q={filters.q}
        role={filters.role}
        copy={dictionary.admin}
      />

      <AdminPagination
        page={filters.page}
        totalPages={totalPages}
        ariaLabel={dictionary.admin.users.breadcrumb}
        previousLabel={dictionary.admin.common.previous}
        nextLabel={dictionary.admin.common.next}
        pageOfLabel={dictionary.admin.common.pageOf}
        prevHref={`/${locale}/admin/users?${buildUsersQuery(filters, filters.page - 1)}`}
        nextHref={`/${locale}/admin/users?${buildUsersQuery(filters, filters.page + 1)}`}
      />
    </>
  );
}
