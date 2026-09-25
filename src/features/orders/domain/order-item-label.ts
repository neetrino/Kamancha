const OPTION_SEPARATOR = " · ";

/**
 * Product title and chosen option (variant or attribute) for order lines.
 * Snapshots store the option both inside the title and on its own field.
 */
export function splitOrderItemTitle(
  title: string,
  optionLabel: string | null,
): { title: string; optionLabel: string | null } {
  const label = optionLabel?.trim() || null;
  if (!label) return { title, optionLabel: null };

  const suffix = `${OPTION_SEPARATOR}${label}`;
  if (!title.endsWith(suffix)) return { title, optionLabel: label };

  return { title: title.slice(0, -suffix.length), optionLabel: label };
}
