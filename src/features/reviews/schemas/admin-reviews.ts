import { z } from "zod";

export const adminReviewsPageSchema = z.coerce
  .number()
  .int()
  .min(1)
  .max(500)
  .default(1);

export const adminReviewProductIdSchema = z.string().uuid();
