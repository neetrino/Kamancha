import { Star } from "lucide-react";

import { REVIEW_RATING_MAX } from "@/features/reviews/domain/review-rules";

type AdminReviewStarsProps = {
  rating: number;
  ariaLabel: string;
};

export function AdminReviewStars({ rating, ariaLabel }: AdminReviewStarsProps) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={ariaLabel}>
      {Array.from({ length: REVIEW_RATING_MAX }, (_, index) => (
        <Star
          key={index}
          aria-hidden
          className={`h-4 w-4 ${
            index < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"
          }`}
        />
      ))}
    </span>
  );
}
