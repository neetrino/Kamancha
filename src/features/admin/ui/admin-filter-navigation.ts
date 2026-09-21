"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Builds an admin list filter href from a GET form and/or URL overrides.
 * Empty values are omitted; `page` is always cleared so search starts at page 1.
 */
export function buildAdminFilterHref(
  pathname: string,
  form: HTMLFormElement | null,
  overrides: Record<string, string | null | undefined> = {},
  fallbackParams?: URLSearchParams,
): string {
  const params = new URLSearchParams();

  if (form) {
    const formData = new FormData(form);
    for (const [key, value] of formData.entries()) {
      if (typeof value !== "string") continue;
      if (value.trim() === "") continue;
      params.set(key, value);
    }
  } else if (fallbackParams) {
    fallbackParams.forEach((value, key) => {
      if (value.trim() === "") return;
      params.set(key, value);
    });
  }

  for (const [key, value] of Object.entries(overrides)) {
    if (value == null || value.trim() === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  }

  params.delete("page");

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

/** Soft-navigates admin filter URLs without a full document reload. */
export function useAdminFilterNavigate() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useCallback(
    (
      form: HTMLFormElement | null,
      overrides: Record<string, string | null | undefined> = {},
    ): void => {
      const href = buildAdminFilterHref(
        pathname,
        form,
        overrides,
        searchParams,
      );
      router.replace(href, { scroll: false });
    },
    [pathname, router, searchParams],
  );
}
