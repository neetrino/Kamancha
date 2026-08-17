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
import { registerSchema } from "@/features/auth/schemas";
import { createSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { createId } from "@/lib/id";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";

const CURRENT_TERMS_VERSION = "1.0";

function registerErrorState(
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
      firstName: readFormString(formData, "firstName"),
      lastName: readFormString(formData, "lastName"),
      email: readFormString(formData, "email"),
      phone: readFormString(formData, "phone"),
      password: readFormString(formData, "password"),
      confirmPassword: readFormString(formData, "confirmPassword"),
      acceptTerms: formData.get("acceptTerms") === "on",
    },
  };
}

export async function registerAction(
  localeInput: string,
  previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  const locale: Locale = isLocale(localeInput) ? localeInput : defaultLocale;

  if (!parsed.success) {
    return registerErrorState(
      previousState,
      formData,
      parsed.error.issues[0]?.message ?? "Invalid registration details.",
      fieldErrorsFromZod(parsed.error),
    );
  }

  const [existingUser] = await getDb()
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);
  if (existingUser) {
    return registerErrorState(
      previousState,
      formData,
      "Unable to create account with those details.",
      { email: true },
    );
  }

  const {
    password,
    confirmPassword: _confirmPassword,
    acceptTerms: _acceptTerms,
    ...registration
  } = parsed.data;
  const [user] = await getDb()
    .insert(users)
    .values({
      id: createId(),
      ...registration,
      passwordHash: await hashPassword(password),
      passwordUpdatedAt: new Date(),
      termsAcceptedAt: new Date(),
      termsVersion: CURRENT_TERMS_VERSION,
      // Temporary Phase 3 bypass until the verification provider is connected.
      emailVerifiedAt: new Date(),
      role: "CUSTOMER",
      status: "ACTIVE",
    })
    .returning({ id: users.id });

  if (!user) {
    return registerErrorState(
      previousState,
      formData,
      "Unable to create account with those details.",
      { email: true },
    );
  }

  await createSession(user.id);
  redirect(`/${locale}/profile`);
}
