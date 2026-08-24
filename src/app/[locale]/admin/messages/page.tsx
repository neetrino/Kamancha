import { notFound } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AdminSearchInput } from "@/features/admin/ui/AdminSearchInput";
import { AdminPagination } from "@/features/admin/ui/AdminPagination";
import {
  ADMIN_LABEL,
  ADMIN_PAGE_SUBTITLE,
  ADMIN_PAGE_TITLE,
  ADMIN_SELECT,
} from "@/features/admin/ui/admin-form-classes";
import { listAdminContactMessages } from "@/features/contact/application/queries";
import { AdminMessagesView } from "@/features/contact/ui/AdminMessagesView";
import { CONTACT_STATUSES } from "@/features/contact/domain/contact-rules";
import { adminContactFilterSchema } from "@/features/contact/schemas/contact";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AdminMessagesPageProps = {
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

function buildMessagesQuery(
  filters: { q?: string; status?: string; page: number },
  page: number,
): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  params.set("page", String(page));
  return params.toString();
}

export default async function AdminMessagesPage({
  params,
  searchParams,
}: AdminMessagesPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const t = dictionary.admin.messages;

  const raw = await searchParams;
  const parsed = adminContactFilterSchema.safeParse({
    status: firstParam(raw.status) || undefined,
    q: firstParam(raw.q) || undefined,
    page: firstParam(raw.page) ?? "1",
  });

  const filters = parsed.success
    ? parsed.data
    : { page: 1 as const, status: undefined, q: undefined };

  const { rows, total, pageSize } = await listAdminContactMessages(filters);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const countLabel = filters.status
    ? t.countWithStatus
        .replace("{total}", String(total))
        .replace("{plural}", total === 1 ? "" : "s")
        .replace("{status}", filters.status)
    : total === 1
      ? t.count.replace("{total}", String(total))
      : t.countPlural.replace("{total}", String(total));

  return (
    <section>
      <div className="mb-6">
        <h1 className={ADMIN_PAGE_TITLE}>{t.title}</h1>
        <p className={`mt-1 ${ADMIN_PAGE_SUBTITLE}`}>{countLabel}</p>
      </div>

      <Card className="mb-6 p-4">
        <form method="get" className="flex flex-wrap items-end gap-3">
          <label className="min-w-[180px] flex-1">
            <span className={ADMIN_LABEL}>{t.search}</span>
            <AdminSearchInput
              name="q"
              defaultValue={filters.q ?? ""}
              placeholder={t.searchPlaceholder}
            />
          </label>
          <label className="min-w-[140px]">
            <span className={ADMIN_LABEL}>{t.status}</span>
            <select
              name="status"
              defaultValue={filters.status ?? ""}
              className={ADMIN_SELECT}
            >
              <option value="">{t.all}</option>
              {CONTACT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" size="field">
            {t.filter}
          </Button>
        </form>
      </Card>

      <AdminMessagesView
        locale={locale}
        rows={rows}
        copy={dictionary.admin}
      />

      <AdminPagination
        page={filters.page}
        totalPages={totalPages}
        ariaLabel={t.title}
        previousLabel={dictionary.admin.common.previous}
        nextLabel={dictionary.admin.common.next}
        pageOfLabel={dictionary.admin.common.pageOf}
        prevHref={`/${locale}/admin/messages?${buildMessagesQuery(filters, filters.page - 1)}`}
        nextHref={`/${locale}/admin/messages?${buildMessagesQuery(filters, filters.page + 1)}`}
      />
    </section>
  );
}
