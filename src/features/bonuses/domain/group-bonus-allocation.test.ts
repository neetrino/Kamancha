import { describe, expect, it } from "vitest";

import {
  allocateParticipantBonusBases,
  buildGroupOrderBonusShares,
} from "@/features/bonuses/domain/group-bonus-allocation";

describe("buildGroupOrderBonusShares", () => {
  it("attributes guest merchandise to the organizer", () => {
    expect(
      buildGroupOrderBonusShares({
        organizerUserId: "org",
        participants: [
          { userId: "org", subtotalAmount: 1000 },
          { userId: null, subtotalAmount: 500 },
          { userId: "p1", subtotalAmount: 250 },
        ],
      }),
    ).toEqual([
      { userId: "org", merchandiseAmount: 1000 },
      { userId: "org", merchandiseAmount: 500 },
      { userId: "p1", merchandiseAmount: 250 },
    ]);
  });

  it("skips zero merchandise and guests when organizer is missing", () => {
    expect(
      buildGroupOrderBonusShares({
        organizerUserId: null,
        participants: [
          { userId: null, subtotalAmount: 400 },
          { userId: "p1", subtotalAmount: 0 },
          { userId: "p2", subtotalAmount: 200 },
        ],
      }),
    ).toEqual([{ userId: "p2", merchandiseAmount: 200 }]);
  });
});

describe("allocateParticipantBonusBases", () => {
  it("splits 30_000 eligible 1:2 by merchandise with remainder to organizer", () => {
    const result = allocateParticipantBonusBases({
      eligibleMerchandiseAmount: 30_000,
      remainderUserId: "org",
      shares: [
        { userId: "a", merchandiseAmount: 20_000 },
        { userId: "b", merchandiseAmount: 10_000 },
        { userId: "org", merchandiseAmount: 0 },
      ],
    });
    // org has 0 merchandise → skipped; a gets floor, b gets remainder as last
    expect(result).toEqual([
      { userId: "a", eligibleAmount: 20_000 },
      { userId: "b", eligibleAmount: 10_000 },
    ]);
  });

  it("gives flooring remainder to organizer when organizer has items", () => {
    const result = allocateParticipantBonusBases({
      eligibleMerchandiseAmount: 1000,
      remainderUserId: "org",
      shares: [
        { userId: "p1", merchandiseAmount: 333 },
        { userId: "p2", merchandiseAmount: 333 },
        { userId: "org", merchandiseAmount: 334 },
      ],
    });
    expect(result).toEqual([
      { userId: "p1", eligibleAmount: 333 },
      { userId: "p2", eligibleAmount: 333 },
      { userId: "org", eligibleAmount: 334 },
    ]);
  });

  it("returns empty when no registered merchandise shares", () => {
    expect(
      allocateParticipantBonusBases({
        eligibleMerchandiseAmount: 5000,
        remainderUserId: "org",
        shares: [{ userId: "org", merchandiseAmount: 0 }],
      }),
    ).toEqual([]);
  });

  it("merges guest-attributed organizer share before splitting", () => {
    const shares = buildGroupOrderBonusShares({
      organizerUserId: "org",
      participants: [
        { userId: "org", subtotalAmount: 1000 },
        { userId: null, subtotalAmount: 1000 },
        { userId: "p1", subtotalAmount: 2000 },
      ],
    });
    expect(
      allocateParticipantBonusBases({
        eligibleMerchandiseAmount: 4000,
        remainderUserId: "org",
        shares,
      }),
    ).toEqual([
      { userId: "p1", eligibleAmount: 2000 },
      { userId: "org", eligibleAmount: 2000 },
    ]);
  });
});
