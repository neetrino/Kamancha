/** Upper bound for the product-card quantity stepper. */
export const MAX_QUICK_ADD_QUANTITY = 99;

/** Safety cap for a plain cart line. The drawer can pass the card stepper's cap. */
export const MAX_PLAIN_LINE_QUANTITY = 999;

export type PlainCartLine = {
  productId: string;
  itemId: string;
  quantity: number;
};

export type PlainCartLineResult =
  | { ok: true; itemId: string | null; quantity: number }
  | { ok: false; error: string };

type QuickAddLineShape = {
  modifiers: readonly unknown[];
  variant: unknown | null;
  attributeId: string | null;
};

/**
 * A line the product card can edit directly: no variant, attribute, or modifiers.
 * Configured dishes stay on their own cart rows.
 */
export function isQuickAddLine(line: QuickAddLineShape): boolean {
  return (
    line.modifiers.length === 0 &&
    line.variant == null &&
    line.attributeId == null
  );
}

/** Fills `{count}` in a pieces label such as `{count}pcs`. */
export function formatPiecesCount(template: string, count: number): string {
  return template.replaceAll("{count}", String(count));
}
