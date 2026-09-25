export type VariantOptionRef = {
  attributeId: string;
  valueId: string;
};

/** Stable combination key: sorted attribute value ids. */
export function buildVariantSignature(valueIds: readonly string[]): string {
  return [...valueIds].sort().join(".");
}

export function selectionFromOptions(
  options: readonly VariantOptionRef[],
): Record<string, string> {
  const selection: Record<string, string> = {};
  for (const option of options) {
    selection[option.attributeId] = option.valueId;
  }
  return selection;
}

export function variantMatchesSelection(
  options: readonly VariantOptionRef[],
  selection: Readonly<Record<string, string>>,
): boolean {
  const keys = Object.keys(selection);
  if (options.length !== keys.length) return false;
  return options.every(
    (option) => selection[option.attributeId] === option.valueId,
  );
}

export function formatVariantLabel(parts: readonly string[]): string {
  return parts.filter((part) => part.trim().length > 0).join(" / ");
}

type StockedVariant = {
  stockOnHand: number;
};

/** Prefers an in-stock combination, then the first defined variant. */
export function defaultVariant<T extends StockedVariant>(
  variants: readonly T[],
): T | null {
  return (
    variants.find((variant) => variant.stockOnHand > 0) ?? variants[0] ?? null
  );
}

type SelectableVariant = StockedVariant & {
  options: readonly VariantOptionRef[];
};

/**
 * Keeps the other axes when possible. If that combination does not exist,
 * falls back to a variant that includes the clicked value.
 */
export function pickVariantForValue<T extends SelectableVariant>(
  variants: readonly T[],
  selection: Readonly<Record<string, string>>,
  attributeId: string,
  valueId: string,
): T | null {
  const next = { ...selection, [attributeId]: valueId };
  const exact = variants.find((variant) =>
    variantMatchesSelection(variant.options, next),
  );
  if (exact) return exact;

  const candidates = variants.filter((variant) =>
    variant.options.some(
      (option) =>
        option.attributeId === attributeId && option.valueId === valueId,
    ),
  );
  return (
    candidates.find((variant) => variant.stockOnHand > 0) ??
    candidates[0] ??
    null
  );
}

/** Cartesian product of value-id groups, in attribute order. */
export function cartesianValueIds(
  groups: readonly (readonly string[])[],
): string[][] {
  if (groups.length === 0 || groups.some((group) => group.length === 0)) {
    return [];
  }

  return groups.reduce<string[][]>(
    (prefixes, group) =>
      prefixes.flatMap((prefix) => group.map((id) => [...prefix, id])),
    [[]],
  );
}
