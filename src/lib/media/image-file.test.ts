import { describe, expect, it } from "vitest";

import {
  resolveImageMimeType,
  validateImageFile,
} from "@/lib/media/image-file";

describe("validateImageFile", () => {
  it("accepts jpeg by mime type", () => {
    const file = new File([new Uint8Array([1, 2, 3])], "photo.jpg", {
      type: "image/jpeg",
    });
    expect(validateImageFile(file)).toBeNull();
  });

  it("accepts png when mime is empty but extension is present", () => {
    const file = new File([new Uint8Array([1, 2, 3])], "photo.png", {
      type: "",
    });
    expect(validateImageFile(file)).toBeNull();
    expect(resolveImageMimeType(file)).toBe("image/png");
  });

  it("rejects heic with a clear message", () => {
    const file = new File([new Uint8Array([1, 2, 3])], "photo.heic", {
      type: "image/heic",
    });
    expect(validateImageFile(file)).toMatch(/HEIC/i);
  });
});
