import { describe, expect, it } from "vitest";

import {
  ORDER_OPERATOR_NOTE_SOURCE,
  readOperatorNoteBody,
} from "@/features/orders/domain/operator-note";

describe("readOperatorNoteBody", () => {
  it("returns the note for operator note payloads", () => {
    expect(
      readOperatorNoteBody({ note: "Call first", source: ORDER_OPERATOR_NOTE_SOURCE }),
    ).toBe("Call first");
  });

  it("ignores system NOTE payloads", () => {
    expect(readOperatorNoteBody({ note: "status note" })).toBeNull();
    expect(readOperatorNoteBody({ action: "archive" })).toBeNull();
  });

  it("ignores non-object payloads", () => {
    expect(readOperatorNoteBody(null)).toBeNull();
    expect(readOperatorNoteBody("note")).toBeNull();
  });
});
