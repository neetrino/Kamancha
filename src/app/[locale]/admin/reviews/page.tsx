import { notFound } from "next/navigation";

import { AdminPagination } from "@/features/admin/ui/AdminPagination";
import {
  ADMIN_PAGE_SUBTITLE,
  ADMIN_PAGE_TITLE,
} from "@/features/admin/ui/admin-form-classes";
import { listAdminOrderReviews } from "@/features/reviews/application/admin-queries";
import { adminReviewsPageSchema } from "@/features/reviews/schemas/admin-reviews";
import { AdminOrderReviewsTable } from "@/features/reviews/ui/AdminOrderReviewsTable";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AdminReviewsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminReviewsPage({
  params,
  searchParams,
}: AdminReviewsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const t = dictionary.admin.reviews;

  const raw = await searchParams;
  const rawPage = Array.isArray(raw.page) ? raw.page[0] : raw.page;
  const parsedPage = adminReviewsPageSchema.safeParse(rawPage ?? "1");
  const page = parsedPage.success ? parsedPage.data : 1;

  const { rows, total, pageSize } = await listAdminOrderReviews(page);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const countLabel = (total === 1 ? t.count : t.countPlural).replace(
    "{total}",
    String(total),
  );

  return (
    <section>
      <div className="mb-6">
        <h1 className={ADMIN_PAGE_TITLE}>{t.title}</h1>
        <p className={`mt-1 ${ADMIN_PAGE_SUBTITLE}`}>{countLabel}</p>
      </div>

      <AdminOrderReviewsTable locale={locale} rows={rows} copy={dictionary.admin} />

      <AdminPagination
        page={page}
        totalPages={totalPages}
        ariaLabel={t.title}
        previousLabel={dictionary.admin.common.previous}
        nextLabel={dictionary.admin.common.next}
        pageOfLabel={dictionary.admin.common.pageOf}
        prevHref={`/${locale}/admin/reviews?page=${page - 1}`}
        nextHref={`/${locale}/admin/reviews?page=${page + 1}`}
      />
    </section>
  );
}
