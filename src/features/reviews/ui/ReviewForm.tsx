"use client";

import { useState, useTransition } from "react";

import { RatingStars } from "@/features/products/ui/ProductReviewRating";
import { submitReviewAction } from "@/features/reviews/application/submit-review";
import { updateReviewAction } from "@/features/reviews/application/update-review";
import { StarRatingInput } from "@/features/reviews/ui/StarRatingInput";
import type { Locale } from "@/lib/i18n/config";

type ReviewFormLabels = {
  title: string;
  ratingLabel: string;
  yourReviewLabel: string;
  placeholder: string;
  submit: string;
  submitting: string;
  cancel: string;
  pending: string;
};

type ReviewFormProps = {
  locale: Locale;
  productId: string;
  labels: ReviewFormLabels;
  onCancel: () => void;
  /** When set, form updates an existing review instead of creating one. */
  reviewId?: string;
  initialRating?: number;
  initialComment?: string;
};

const primaryBtnClassName =
  "inline-flex items-center justify-center rounded-full bg-white px-10 py-3 text-sm font-semibold text-brand-forest transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60";

const secondaryBtnClassName =
  "inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-10 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-60";
export function ReviewForm({
  locale,
  productId,
  labels,
  onCancel,
  reviewId,
  initialRating = 0,
  initialComment = "",
}: ReviewFormProps) {
  const isEdit = Boolean(reviewId);
  const [rating, setRating] = useState(initialRating);
  const [commentDraft, setCommentDraft] = useState(initialComment);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <div className="flex w-full flex-col gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 sm:p-5">
        <RatingStars average={rating} />
        {commentDraft ? (
          <p className="text-sm whitespace-pre-wrap text-white/70">
            {commentDraft}
          </p>
        ) : null}
        <p className="text-sm text-white/50">{labels.pending}</p>
      </div>
    );
  }

  return (
    <form
      className="flex w-full flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        const comment = commentDraft.trim();
        if (rating < 1 || comment.length === 0) {
          return;
        }
        setError(null);
        startTransition(async () => {
          const result =
            isEdit && reviewId
              ? await updateReviewAction(locale, {
                  reviewId,
                  rating,
                  comment,
                })
              : await submitReviewAction(locale, {
                  productId,
                  rating,
                  comment,
                });
          if (!result.ok) {
            setError(result.error.message);
            return;
          }
          setDone(true);
        });
      }}
    >
      <h3 className="font-big-fat-boii text-2xl font-normal tracking-[0.3px] text-white uppercase md:text-3xl">
        {labels.title}
      </h3>

      <StarRatingInput
        value={rating}
        onChange={setRating}
        label={labels.ratingLabel}
        disabled={pending}
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white" htmlFor="comment">
          {labels.yourReviewLabel}
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={5}
          maxLength={2000}
          required
          disabled={pending}
          value={commentDraft}
          onChange={(event) => setCommentDraft(event.target.value)}
          placeholder={labels.placeholder}
          className="min-h-[8rem] resize-y rounded-2xl border border-white/20 bg-white px-4 py-3 text-base text-brand-forest placeholder:text-brand-forest/40 disabled:opacity-60"
        />
      </div>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending || rating < 1 || commentDraft.trim().length === 0}
          className={primaryBtnClassName}
        >
          {pending ? labels.submitting : labels.submit}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className={secondaryBtnClassName}
        >
          {labels.cancel}
        </button>
      </div>
    </form>
  );
}
