import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ADMIN_PAGE_SUBTITLE,
  ADMIN_PAGE_TITLE,
} from "@/features/admin/ui/admin-form-classes";
import { getAdminProductReviews } from "@/features/reviews/application/admin-queries";
import { adminReviewProductIdSchema } from "@/features/reviews/schemas/admin-reviews";
import { AdminProductReviewsList } from "@/features/reviews/ui/AdminProductReviewsList";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AdminProductReviewsPageProps = {
  params: Promise<{ locale: string; productId: string }>;
};

export default async function AdminProductReviewsPage({
  params,
}: AdminProductReviewsPageProps) {
  const { locale, productId } = await params;
  if (!isLocale(locale) || !adminReviewProductIdSchema.safeParse(productId).success) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const t = dictionary.admin;

  const detail = await getAdminProductReviews(locale, productId);
  if (!detail) {
    notFound();
  }

  const total = detail.reviews.length;
  const countLabel = (total === 1 ? t.reviews.detail.count : t.reviews.detail.countPlural).replace(
    "{total}",
    String(total),
  );

  return (
    <section>
      <div className="mb-6">
        <Link
          href={`/${locale}/admin/reviews`}
          className="mb-4 inline-flex h-11 items-center gap-1.5 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          {t.common.back}
        </Link>
        <h1 className={ADMIN_PAGE_TITLE}>{detail.product.title}</h1>
        <p className={`mt-1 ${ADMIN_PAGE_SUBTITLE}`}>
          {detail.product.sku} · {countLabel}
        </p>
      </div>

      <AdminProductReviewsList locale={locale} reviews={detail.reviews} copy={t} />
    </section>
  );
}
