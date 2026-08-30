import { describe, expect, it } from "vitest";

import { localeFromPathname } from "@/lib/i18n/request-locale";

describe("localeFromPathname", () => {
  it("reads the first segment of an app path", () => {
    expect(localeFromPathname("/hy/products")).toBe("hy");
    expect(localeFromPathname("/en/cart")).toBe("en");
  });

  it("reads locale from an absolute URL", () => {
    expect(localeFromPathname("https://example.com/ru/checkout")).toBe("ru");
  });

  it("returns null when the first segment is not a locale", () => {
    expect(localeFromPathname("/products")).toBeNull();
    expect(localeFromPathname("")).toBeNull();
  });
});
