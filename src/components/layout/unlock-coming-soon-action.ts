"use server";

import { cookies } from "next/headers";

import {
  STOREFRONT_PREVIEW_COOKIE_NAME,
  STOREFRONT_PREVIEW_COOKIE_VALUE,
  STOREFRONT_PREVIEW_MAX_AGE_SECONDS,
} from "@/components/layout/coming-soon-preview";

const PREVIEW_PASSWORD = "12345678";

/** Grants storefront access when the coming-soon preview password matches. */
export async function unlockComingSoonAction(password: string): Promise<boolean> {
  if (password !== PREVIEW_PASSWORD) {
    return false;
  }

  const store = await cookies();
  store.set(STOREFRONT_PREVIEW_COOKIE_NAME, STOREFRONT_PREVIEW_COOKIE_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: STOREFRONT_PREVIEW_MAX_AGE_SECONDS,
  });

  return true;
}
