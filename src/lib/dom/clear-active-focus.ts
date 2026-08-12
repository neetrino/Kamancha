/**
 * Clears keyboard focus so UA / :focus-visible rings do not linger after Esc.
 */
export function clearActiveFocus(): void {
  window.setTimeout(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement && active !== document.body) {
      active.blur();
    }
  }, 0);
}
