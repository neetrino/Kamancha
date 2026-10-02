import { describe, expect, it } from "vitest";

import {
  canSubmitOrderFeedback,
  isOrderFeedbackEligibleStatus,
  isValidOrderFeedbackRating,
  sanitizeOrderFeedbackComment,
} from "@/features/orders/domain/order-feedback";

describe("order feedback rules", () => {
  it("accepts ratings 1–5 only", () => {
    expect(isValidOrderFeedbackRating(1)).toBe(true);
    expect(isValidOrderFeedbackRating(5)).toBe(true);
    expect(isValidOrderFeedbackRating(0)).toBe(false);
    expect(isValidOrderFeedbackRating(6)).toBe(false);
    expect(isValidOrderFeedbackRating(3.5)).toBe(false);
  });

  it("unlocks feedback after admin confirmation statuses", () => {
    expect(isOrderFeedbackEligibleStatus("PENDING")).toBe(false);
    expect(isOrderFeedbackEligibleStatus("CANCELLED")).toBe(false);
    expect(isOrderFeedbackEligibleStatus("CONFIRMED")).toBe(true);
    expect(isOrderFeedbackEligibleStatus("PROCESSING")).toBe(true);
    expect(isOrderFeedbackEligibleStatus("DELIVERED")).toBe(true);
  });

  it("allows submit only once when eligible", () => {
    expect(
      canSubmitOrderFeedback({ status: "PROCESSING", hasFeedback: false }),
    ).toBe(true);
    expect(
      canSubmitOrderFeedback({ status: "PROCESSING", hasFeedback: true }),
    ).toBe(false);
    expect(
      canSubmitOrderFeedback({ status: "PENDING", hasFeedback: false }),
    ).toBe(false);
  });

  it("sanitizes comment text", () => {
    expect(sanitizeOrderFeedbackComment("  Hello <b>world</b>  ")).toBe(
      "Hello world",
    );
  });
});
