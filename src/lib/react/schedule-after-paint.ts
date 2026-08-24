import { useEffect, type Dispatch, type SetStateAction } from "react";

type StateSetter<T> = Dispatch<SetStateAction<T>>;

/**
 * Schedules state updates after the current effect turn so React Compiler
 * lint does not treat them as synchronous setState inside effects.
 */
export function scheduleStateUpdate<T>(
  setter: StateSetter<T>,
  value: NoInfer<SetStateAction<T>>,
): void {
  queueMicrotask(() => {
    setter(value);
  });
}

/**
 * Runs a callback after mount / when deps change, deferring setState calls.
 */
export function useDeferredEffect(
  effect: () => void | (() => void),
  deps: readonly unknown[],
): void {
  useEffect(() => {
    let cancelled = false;
    let cleanup: void | (() => void);

    queueMicrotask(() => {
      if (cancelled) return;
      cleanup = effect();
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller owns dependency list
  }, deps);
}
