"use client";

import { Star } from "lucide-react";
import { useState, useTransition } from "react";

import { submitOrderFeedbackAction } from "@/features/orders/application/submit-order-feedback";
import { ORDER_FEEDBACK_COMMENT_MAX_LENGTH } from "@/features/orders/domain/order-feedback";
import { PROFILE_INNER_CARD } from "@/features/profile/ui/profile-surface";
import { StarRatingInput } from "@/features/reviews/ui/StarRatingInput";
import type { Locale } from "@/lib/i18n/config";

export type OrderFeedbackFormLabels = {
  title: string;
  ratingLabel: string;
  commentLabel: string;
  commentPlaceholder: string;
  submit: string;
  submitting: string;
  thanks: string;
  lockedHint: string;
};

type OrderFeedbackFormProps = {
  locale: Locale;
  orderNumber: string;
  labels: OrderFeedbackFormLabels;
  canSubmit: boolean;
  initialRating: number | null;
  initialComment: string | null;
  onSubmitted?: (value: { rating: number; comment: string | null }) => void;
};

function FeedbackStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-hidden>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= rating;
        return (
          <Star
            key={star}
            className={`h-5 w-5 ${
              filled
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-300"
            }`}
          />
        );
      })}
    </div>
  );
}

/** Profile order feedback: 1–5 stars + optional comment after confirmation. */
export function OrderFeedbackForm({
  locale,
  orderNumber,
  labels,
  canSubmit,
  initialRating,
  initialComment,
  onSubmitted,
}: OrderFeedbackFormProps) {
  const [rating, setRating] = useState(initialRating ?? 0);
  const [comment, setComment] = useState(initialComment ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(initialRating != null);
  const [pending, startTransition] = useTransition();

  if (submitted && (initialRating != null || rating > 0)) {
    const shownRating = initialRating ?? rating;
    return (
      <section className={`${PROFILE_INNER_CARD} space-y-2 p-4`}>
        <h3 className="font-big-fat-boii text-sm font-normal tracking-wide text-gray-900 uppercase">
          {labels.title}
        </h3>
        <FeedbackStars rating={shownRating} />
        <p className="text-sm text-gray-600">{labels.thanks}</p>
      </section>
    );
  }

  if (!canSubmit) {
    return (
      <section className={`${PROFILE_INNER_CARD} space-y-2 p-4`}>
        <h3 className="font-big-fat-boii text-sm font-normal tracking-wide text-gray-900 uppercase">
          {labels.title}
        </h3>
        <p className="text-sm text-gray-600">{labels.lockedHint}</p>
      </section>
    );
  }

  return (
    <section className={`${PROFILE_INNER_CARD} space-y-3 p-4`}>
      <h3 className="font-big-fat-boii text-sm font-normal tracking-wide text-gray-900 uppercase">
        {labels.title}
      </h3>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (rating < 1) return;
          setError(null);
          startTransition(async () => {
            const result = await submitOrderFeedbackAction(locale, {
              orderNumber,
              rating,
              comment: comment.trim() || undefined,
            });
            if (!result.ok) {
              setError(result.error.message);
              return;
            }
            setSubmitted(true);
            setRating(result.value.rating);
            setComment(result.value.comment ?? "");
            onSubmitted?.(result.value);
          });
        }}
      >
        <StarRatingInput
          value={rating}
          onChange={setRating}
          label={labels.ratingLabel}
          disabled={pending}
          tone="onLight"
        />
        <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-900">
          {labels.commentLabel}
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            disabled={pending}
            rows={3}
            maxLength={ORDER_FEEDBACK_COMMENT_MAX_LENGTH}
            placeholder={labels.commentPlaceholder}
            className="min-h-[5rem] w-full resize-y rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-normal text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-brand-forest/40 disabled:bg-gray-50"
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={pending || rating < 1}
          className="inline-flex h-10 items-center justify-center rounded-full bg-brand-forest px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? labels.submitting : labels.submit}
        </button>
      </form>
    </section>
  );
}
