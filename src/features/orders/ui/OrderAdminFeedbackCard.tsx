import { Star } from "lucide-react";

import type { AdminOrderDetailView } from "@/features/orders/application/order-detail-view";
import { PROFILE_INNER_CARD } from "@/features/profile/ui/profile-surface";

type OrderAdminFeedbackCardProps = {
  detail: AdminOrderDetailView;
  title: string;
};

/** Admin-only display of customer rating + comment. */
export function OrderAdminFeedbackCard({
  detail,
  title,
}: OrderAdminFeedbackCardProps) {
  if (detail.customerRating == null) return null;

  return (
    <section className={`${PROFILE_INNER_CARD} space-y-2 p-4`}>
      <h3 className="font-big-fat-boii text-sm font-normal tracking-wide text-gray-900 uppercase">
        {title}
      </h3>
      <div
        className="flex items-center gap-1"
        aria-label={`${detail.customerRating}/5`}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= (detail.customerRating ?? 0);
          return (
            <Star
              key={star}
              className={`h-5 w-5 ${
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-gray-200 text-gray-300"
              }`}
              aria-hidden
            />
          );
        })}
      </div>
      {detail.customerFeedback ? (
        <p className="text-sm font-medium whitespace-pre-wrap text-gray-900">
          {detail.customerFeedback}
        </p>
      ) : null}
    </section>
  );
}
