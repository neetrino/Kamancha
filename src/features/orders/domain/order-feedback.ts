import type { OrderStatus } from "@/features/orders/domain/order-status";
import { sanitizeReviewComment } from "@/features/reviews/domain/review-rules";

export const ORDER_FEEDBACK_RATING_MIN = 1;
export const ORDER_FEEDBACK_RATING_MAX = 5;
export const ORDER_FEEDBACK_COMMENT_MAX_LENGTH = 2_000;

/**
 * Statuses after admin has confirmed / accepted the order.
 * PENDING / CANCELLED / REFUNDED stay locked for feedback.
 */
export const ORDER_FEEDBACK_ELIGIBLE_STATUSES = [
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
] as const satisfies ReadonlyArray<OrderStatus>;

export function isOrderFeedbackEligibleStatus(status: string): boolean {
  return (ORDER_FEEDBACK_ELIGIBLE_STATUSES as readonly string[]).includes(
    status,
  );
}

export function isValidOrderFeedbackRating(rating: number): boolean {
  return (
    Number.isInteger(rating) &&
    rating >= ORDER_FEEDBACK_RATING_MIN &&
    rating <= ORDER_FEEDBACK_RATING_MAX
  );
}

export function sanitizeOrderFeedbackComment(
  raw: string | null | undefined,
): string {
  return sanitizeReviewComment(raw).slice(0, ORDER_FEEDBACK_COMMENT_MAX_LENGTH);
}

/** Whether the customer may still submit feedback for this order. */
export function canSubmitOrderFeedback(input: {
  status: string;
  hasFeedback: boolean;
}): boolean {
  return isOrderFeedbackEligibleStatus(input.status) && !input.hasFeedback;
}
