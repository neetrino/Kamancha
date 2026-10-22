"use client";

import { useEffect } from "react";

const COUNT_PREFIX_PATTERN = /^\(\d+\)\s/;

function stripCountPrefix(title: string): string {
  return title.replace(COUNT_PREFIX_PATTERN, "");
}

function applyCountPrefix(count: number): void {
  const base = stripCountPrefix(document.title);
  const next = count > 0 ? `(${count}) ${base}` : base;
  if (document.title !== next) document.title = next;
}

/**
 * Prefixes `document.title` with the unseen order count, e.g. "(2) Admin".
 * Re-applies when route navigation rewrites the title; strips it on unmount.
 */
export function useAdminUnseenTitle(unseenCount: number): void {
  useEffect(() => {
    applyCountPrefix(unseenCount);
    const observer = new MutationObserver(() => applyCountPrefix(unseenCount));
    observer.observe(document.head, {
      subtree: true,
      childList: true,
      characterData: true,
    });
    return () => {
      observer.disconnect();
      document.title = stripCountPrefix(document.title);
    };
  }, [unseenCount]);
}
