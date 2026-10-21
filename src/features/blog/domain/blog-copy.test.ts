import { describe, expect, it } from "vitest";

import {
  pickBlogCopy,
  slugifyAddressDraft,
  slugifyTitle,
} from "@/features/blog/domain/blog-copy";

describe("slugifyTitle", () => {
  it("slugifies latin titles", () => {
    expect(slugifyTitle("Hello World")).toBe("hello-world");
  });

  it("transliterates Armenian titles", () => {
    expect(slugifyTitle("Կամանչա")).toBe("kamancha");
  });

  it("keeps an empty title empty", () => {
    expect(slugifyTitle("   ")).toBe("");
  });
});

describe("slugifyAddressDraft", () => {
  it("slugifies a typed address and keeps a trailing hyphen", () => {
    expect(slugifyAddressDraft("Իմ բլոգը")).toBe("im-blogy");
    expect(slugifyAddressDraft("hello ")).toBe("hello-");
  });
});

describe("pickBlogCopy", () => {
  it("falls back when the requested locale is empty", () => {
    const copy = pickBlogCopy(
      {
        hy: { title: "Վերնագիր", body: "Տեքստ" },
      },
      "en",
    );

    expect(copy?.title).toBe("Վերնագիր");
  });
});
