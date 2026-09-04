import { describe, expect, it } from "vitest";

import {
  buildPlateTokens,
  stepPlateTokens,
} from "@/features/home/ui/home-plate-tokens";

describe("home-plate-tokens", () => {
  it("builds five tablet slots around the active index", () => {
    const tokens = buildPlateTokens(2, 6, true);
    expect(tokens.map((token) => [token.slot, token.categoryIndex])).toEqual([
      ["nextFar", 4],
      ["next", 3],
      ["current", 2],
      ["prev", 1],
      ["prevFar", 0],
    ]);
  });

  it("on forward step keeps instance ids and enters left / exits right", () => {
    const start = buildPlateTokens(2, 6, true);
    const rightId = start.find((token) => token.slot === "prevFar")?.instanceId;
    const stepped = stepPlateTokens(start, 1, 3, 6, true);

    expect(stepped.some((token) => token.instanceId === rightId)).toBe(false);
    expect(stepped.find((token) => token.slot === "nextFar")?.categoryIndex).toBe(
      5,
    );
    expect(
      stepped.find((token) => token.slot === "current")?.instanceId,
    ).toBe(start.find((token) => token.slot === "next")?.instanceId);
  });

  it("on backward step enters right and exits left", () => {
    const start = buildPlateTokens(2, 6, true);
    const leftId = start.find((token) => token.slot === "nextFar")?.instanceId;
    const stepped = stepPlateTokens(start, -1, 1, 6, true);

    expect(stepped.some((token) => token.instanceId === leftId)).toBe(false);
    expect(stepped.find((token) => token.slot === "prevFar")?.categoryIndex).toBe(
      5,
    );
  });
});
