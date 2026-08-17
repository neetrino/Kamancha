import type { ZodError } from "zod";

export type AuthFieldName =
  | "email"
  | "password"
  | "confirmPassword"
  | "firstName"
  | "lastName"
  | "phone"
  | "acceptTerms";

export type AuthFieldErrors = Partial<Record<AuthFieldName, true>>;

export type AuthFormValues = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  rememberMe?: boolean;
  firstName?: string;
  lastName?: string;
  phone?: string;
  acceptTerms?: boolean;
};

export type AuthActionState = {
  error?: string;
  values?: AuthFormValues;
  fieldErrors?: AuthFieldErrors;
  /** Remounts the form so defaultValues re-apply after React resets submitted fields. */
  resetKey?: number;
};

export function readFormString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function nextAuthResetKey(previous: AuthActionState): number {
  return (previous.resetKey ?? 0) + 1;
}

export function fieldErrorsFromZod(error: ZodError): AuthFieldErrors {
  const fieldErrors: AuthFieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (
      key === "email" ||
      key === "password" ||
      key === "confirmPassword" ||
      key === "firstName" ||
      key === "lastName" ||
      key === "phone" ||
      key === "acceptTerms"
    ) {
      fieldErrors[key] = true;
    }
  }
  return fieldErrors;
}
