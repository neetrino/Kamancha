import { useSyncExternalStore } from "react";

function subscribe(): () => void {
  return () => {};
}

/**
 * True after hydration; false during SSR. Use for client-only portals and DOM APIs.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
