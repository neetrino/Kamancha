/** Marks `order_events` NOTE payloads written by an operator (vs. system notes). */
export const ORDER_OPERATOR_NOTE_SOURCE = "operator_note";

export const ORDER_OPERATOR_NOTE_MAX_LENGTH = 1000;

export type OrderOperatorNote = {
  id: string;
  orderNumber: string;
  body: string;
  authorName: string | null;
  createdAt: Date;
};

/** Returns the note text when the event payload is an operator note, otherwise `null`. */
export function readOperatorNoteBody(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }
  const record = payload as Record<string, unknown>;
  if (record.source !== ORDER_OPERATOR_NOTE_SOURCE) {
    return null;
  }
  return typeof record.note === "string" ? record.note : null;
}
