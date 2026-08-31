"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import {
  fieldErrorsFromZod,
  nextAuthResetKey,
  readFormString,
  type AuthActionState,
  type AuthFieldErrors,
} from "@/features/auth/auth-action-state";
import { loginSchema } from "@/features/auth/schemas";
import { claimGuestGroupOrderParticipantsForUser } from "@/features/group-orders/application/claim-guest-participants";
import { createSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";

function loginErrorState(
  previous: AuthActionState,
  formData: FormData,
  error: string,
  fieldErrors: AuthFieldErrors,
): AuthActionState {
  return {
    error,
    fieldErrors,
    resetKey: nextAuthResetKey(previous),
    values: {
      email: readFormString(formData, "email"),
      password: readFormString(formData, "password"),
      rememberMe: formData.get("rememberMe") === "on",
    },
  };
}

function resolveSafeNextPath(locale: Locale, raw: FormDataEntryValue | null): string {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) {
    return `/${locale}/profile`;
  }

  if (!raw.startsWith(`/${locale}/`)) {
    return `/${locale}/profile`;
  }

  return raw;
}

export async function loginAction(
  localeInput: string,
  previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  const locale: Locale = isLocale(localeInput) ? localeInput : defaultLocale;

  if (!parsed.success) {
    return loginErrorState(
      previousState,
      formData,
      "Invalid email or password.",
      fieldErrorsFromZod(parsed.error),
    );
  }

  const [user] = await getDb()
    .select()
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);
  const passwordMatches = user
    ? await verifyPassword(parsed.data.password, user.passwordHash)
    : false;

  if (!user || !passwordMatches || user.status !== "ACTIVE") {
    return loginErrorState(
      previousState,
      formData,
      "Invalid email or password.",
      { email: true, password: true },
    );
  }

  await getDb()
    .update(users)
    .set({ lastLoginAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, user.id));
  await createSession(user.id, {
    persistent: parsed.data.rememberMe === "on",
  });
  await claimGuestGroupOrderParticipantsForUser(user.id);
  redirect(resolveSafeNextPath(locale, formData.get("next")));
}
