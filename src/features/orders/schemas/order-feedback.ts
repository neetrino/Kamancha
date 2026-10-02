import { z } from "zod";

import {
  ORDER_FEEDBACK_COMMENT_MAX_LENGTH,
  ORDER_FEEDBACK_RATING_MAX,
  ORDER_FEEDBACK_RATING_MIN,
} from "@/features/orders/domain/order-feedback";

export const submitOrderFeedbackSchema = z.object({
  orderNumber: z.string().trim().min(1).max(64),
  rating: z.coerce
    .number()
    .int()
    .min(ORDER_FEEDBACK_RATING_MIN)
    .max(ORDER_FEEDBACK_RATING_MAX),
  comment: z.string().trim().max(ORDER_FEEDBACK_COMMENT_MAX_LENGTH).optional(),
});

export type SubmitOrderFeedbackInput = z.infer<
  typeof submitOrderFeedbackSchema
>;
