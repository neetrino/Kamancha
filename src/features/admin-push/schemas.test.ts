import { describe, expect, it } from "vitest";

import { saveAdminPushSubscriptionSchema } from "@/features/admin-push/schemas";

const validInput = {
  locale: "hy",
  endpoint: "https://fcm.googleapis.com/fcm/send/abc123",
  keys: { p256dh: "BPx_-9aZ", auth: "k3y_-A==" },
};

describe("saveAdminPushSubscriptionSchema", () => {
  it("accepts an https endpoint with base64url keys", () => {
    expect(saveAdminPushSubscriptionSchema.safeParse(validInput).success).toBe(
      true,
    );
  });

  it("rejects non-https endpoints", () => {
    const result = saveAdminPushSubscriptionSchema.safeParse({
      ...validInput,
      endpoint: "http://push.example.com/abc",
    });
    expect(result.success).toBe(false);
  });

  it("rejects oversized endpoints and non-base64url keys", () => {
    const longEndpoint = `https://push.example.com/${"a".repeat(2048)}`;
    expect(
      saveAdminPushSubscriptionSchema.safeParse({
        ...validInput,
        endpoint: longEndpoint,
      }).success,
    ).toBe(false);
    expect(
      saveAdminPushSubscriptionSchema.safeParse({
        ...validInput,
        keys: { p256dh: "not base64!", auth: "abc" },
      }).success,
    ).toBe(false);
  });

  it("rejects unknown locales", () => {
    expect(
      saveAdminPushSubscriptionSchema.safeParse({ ...validInput, locale: "de" })
        .success,
    ).toBe(false);
  });
});
