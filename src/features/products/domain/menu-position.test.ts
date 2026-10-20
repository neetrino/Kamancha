import { describe, expect, it } from "vitest";

import {
  insertIdAtPosition,
  sameIdOrder,
} from "@/features/products/domain/menu-position";

describe("insertIdAtPosition", () => {
  const menu = ["a", "b", "c"];

  it("moves an existing product to the front", () => {
    expect(insertIdAtPosition(menu, "c", 1)).toEqual(["c", "a", "b"]);
  });

  it("keeps the sequence when the position is unchanged", () => {
    const next = insertIdAtPosition(menu, "b", 2);
    expect(next).toEqual(menu);
    expect(sameIdOrder(menu, next)).toBe(true);
  });

  it("appends a new product when the position is past the end", () => {
    expect(insertIdAtPosition(menu, "d", 99)).toEqual(["a", "b", "c", "d"]);
  });

  it("clamps a position below 1 to the first place", () => {
    expect(insertIdAtPosition(menu, "d", 0)).toEqual(["d", "a", "b", "c"]);
  });
});
