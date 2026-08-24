"use client";

import { useReducedMotion } from "motion/react";
import { useState } from "react";

const SKIP_HOME_MOTION_KEY = "kamancha-skip-home-motion";
/** Locale swap may remount loading + page; keep skip active briefly. */
const SKIP_HOME_MOTION_MS = 4000;

/** Call before navigating to another locale on the home page. */
export function skipNextHomeMotion(): void {
  try {
    sessionStorage.setItem(SKIP_HOME_MOTION_KEY, String(Date.now()));
  } catch {
    // sessionStorage unavailable — animations may replay once.
  }
}

function shouldPlayHomeMotion(): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  try {
    const raw = sessionStorage.getItem(SKIP_HOME_MOTION_KEY);
    if (raw == null) {
      return true;
    }

    const stampedAt = Number(raw);
    if (Number.isFinite(stampedAt) && Date.now() - stampedAt < SKIP_HOME_MOTION_MS) {
      return false;
    }

    sessionStorage.removeItem(SKIP_HOME_MOTION_KEY);
  } catch {
    // ignore
  }

  return true;
}

/**
 * Entrance / scroll-reveal motion for home.
 * False after an in-tab locale switch so content swaps in place.
 */
export function usePlayHomeMotion(): boolean {
  const reduceMotion = useReducedMotion();
  const [play] = useState(() => shouldPlayHomeMotion());
  return Boolean(play && !reduceMotion);
}
