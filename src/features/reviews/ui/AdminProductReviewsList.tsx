import Link from "next/link";

import { Card } from "@/components/ui/Card";
import type { AdminProductReview } from "@/features/reviews/application/admin-queries";
import { AdminReviewStars } from "@/features/reviews/ui/AdminReviewStars";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AdminProductReviewsListProps = {
  locale: string;
  reviews: AdminProductReview[];
  copy: Dictionary["admin"];
};

export function AdminProductReviewsList({ locale, reviews, copy }: AdminProductReviewsListProps) {
  const t = copy.reviews;

  if (reviews.length === 0) {
    return (
      <Card className="p-5 sm:p-6">
        <p className="text-sm text-gray-600">{t.detail.empty}</p>
      </Card>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {reviews.map((review) => (
        <li key={review.orderId}>
          <Card className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-gray-900">{review.authorName}</p>
                <p className="text-xs text-gray-500">{review.authorEmail}</p>
              </div>
              <AdminReviewStars
                rating={review.rating}
                ariaLabel={t.ratingAria.replace("{rating}", String(review.rating))}
              />
            </div>
            <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
              {review.comment?.trim() ? review.comment : t.detail.noComment}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
              <Link
                href={`/${locale}/admin/orders/${review.orderNumber}`}
                className="font-medium text-brand-forest hover:underline"
              >
                {t.detail.order.replace("{orderNumber}", review.orderNumber)}
              </Link>
              {review.createdAt ? (
                <span>
                  {review.createdAt.toISOString().slice(0, 16).replace("T", " ")} {copy.common.utc}
                </span>
              ) : null}
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}
