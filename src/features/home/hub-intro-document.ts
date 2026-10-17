export const HUB_INTRO_STATE_ATTR = "data-hub-intro";

export type HubIntroDocumentState = "playing" | "nav" | "done";

export function writeHubIntroState(state: HubIntroDocumentState): void {
  document.documentElement.setAttribute(HUB_INTRO_STATE_ATTR, state);
}

export function readHubIntroState(): HubIntroDocumentState | null {
  const value = document.documentElement.getAttribute(HUB_INTRO_STATE_ATTR);
  if (value === "playing" || value === "nav" || value === "done") {
    return value;
  }
  return null;
}

/** Navbar may drop once intro is `nav` (mobile lead) or `done`. */
export function isHubNavbarRevealState(
  state: HubIntroDocumentState | null,
): boolean {
  return state === "nav" || state === "done";
}
