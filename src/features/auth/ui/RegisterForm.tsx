"use client";

import { useActionState } from "react";

import { AppLink } from "@/components/ui/AppLink";
import { KamanchaPillButton } from "@/components/ui/KamanchaPillButton";
import { type AuthActionState } from "@/features/auth/auth-action-state";
import { registerAction } from "@/features/auth/register-action";
import {
  AUTH_ERROR_CLASS,
  AUTH_LABEL_CLASS,
  AUTH_LINK_CLASS,
  AUTH_SUBMIT_PILL_CLASS,
  AUTH_SWITCH_LINK_CLASS,
  authFieldClassName,
} from "@/features/auth/ui/auth-form-styles";
import { PasswordField } from "@/features/auth/ui/PasswordField";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

const REQUIRED_MARK = (
  <span className="text-brand-forest" aria-hidden>
    {" "}
    *
  </span>
);

const initialState: AuthActionState = {};

type RegisterFormProps = {
  locale: Locale;
  dictionary: Dictionary["auth"];
};

export function RegisterForm({ locale, dictionary }: RegisterFormProps) {
  const action = registerAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const fieldErrors = state.fieldErrors;

  return (
    <form
      key={state.resetKey ?? 0}
      action={formAction}
      className="relative flex w-full flex-col items-center"
    >
      <div className="w-full space-y-6 px-4 sm:px-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          <label className={AUTH_LABEL_CLASS}>
            <span className="mb-2 block">
              {dictionary.firstName}
              {REQUIRED_MARK}
            </span>
            <input
              required
              name="firstName"
              autoComplete="given-name"
              disabled={isPending}
              defaultValue={state.values?.firstName ?? ""}
              aria-invalid={fieldErrors?.firstName || undefined}
              className={authFieldClassName(fieldErrors?.firstName === true)}
            />
          </label>
          <label className={AUTH_LABEL_CLASS}>
            <span className="mb-2 block">
              {dictionary.lastName}
              {REQUIRED_MARK}
            </span>
            <input
              required
              name="lastName"
              autoComplete="family-name"
              disabled={isPending}
              defaultValue={state.values?.lastName ?? ""}
              aria-invalid={fieldErrors?.lastName || undefined}
              className={authFieldClassName(fieldErrors?.lastName === true)}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          <label className={AUTH_LABEL_CLASS}>
            <span className="mb-2 block">
              {dictionary.email}
              {REQUIRED_MARK}
            </span>
            <input
              required
              name="email"
              type="email"
              autoComplete="email"
              disabled={isPending}
              defaultValue={state.values?.email ?? ""}
              aria-invalid={fieldErrors?.email || undefined}
              className={authFieldClassName(fieldErrors?.email === true)}
            />
          </label>
          <label className={AUTH_LABEL_CLASS}>
            <span className="mb-2 block">
              {dictionary.phone}
              {REQUIRED_MARK}
            </span>
            <input
              required
              name="phone"
              type="tel"
              autoComplete="tel"
              disabled={isPending}
              defaultValue={state.values?.phone ?? ""}
              aria-invalid={fieldErrors?.phone || undefined}
              className={authFieldClassName(fieldErrors?.phone === true)}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          <PasswordField
            name="password"
            label={dictionary.password}
            showPasswordLabel={dictionary.showPassword}
            hidePasswordLabel={dictionary.hidePassword}
            autoComplete="new-password"
            disabled={isPending}
            markRequired
            defaultValue={state.values?.password ?? ""}
            invalid={fieldErrors?.password === true}
          />
          <PasswordField
            name="confirmPassword"
            label={dictionary.confirmPassword}
            showPasswordLabel={dictionary.showPassword}
            hidePasswordLabel={dictionary.hidePassword}
            autoComplete="new-password"
            disabled={isPending}
            markRequired
            defaultValue={state.values?.confirmPassword ?? ""}
            invalid={fieldErrors?.confirmPassword === true}
          />
        </div>

        <label className="flex items-start gap-3 text-sm leading-5 font-medium tracking-[-0.15px] text-[#0a0a0a]">
          <input
            required
            type="checkbox"
            name="acceptTerms"
            value="on"
            disabled={isPending}
            defaultChecked={state.values?.acceptTerms === true}
            aria-invalid={fieldErrors?.acceptTerms || undefined}
            className={`mt-0.5 size-4 shrink-0 accent-brand-forest ${
              fieldErrors?.acceptTerms === true ? "outline outline-2 outline-red-500" : ""
            }`}
          />
          <span>
            {dictionary.agreePrefix}{" "}
            <AppLink
              href={`/${locale}/legal/terms`}
              prefetchPolicy="intent"
              className={AUTH_LINK_CLASS}
            >
              {dictionary.termsLink}
            </AppLink>
            {dictionary.agreeAnd}
            <AppLink
              href={`/${locale}/legal/privacy`}
              prefetchPolicy="intent"
              className={AUTH_LINK_CLASS}
            >
              {dictionary.privacyLink}
            </AppLink>
            {REQUIRED_MARK}
          </span>
        </label>
      </div>

      {state.error ? (
        <p role="alert" className={AUTH_ERROR_CLASS}>
          {state.error}
        </p>
      ) : null}

      <div className="w-full max-w-[575px] px-2 py-5 sm:px-4">
        <KamanchaPillButton
          type="submit"
          variant="dark"
          label={
            isPending
              ? dictionary.submittingRegister
              : dictionary.submitRegister
          }
          disabled={isPending}
          className={AUTH_SUBMIT_PILL_CLASS}
        />
      </div>

      <p className="pb-6 text-center text-[#0a0a0a]">
        {dictionary.hasAccount}{" "}
        <AppLink
          href={`/${locale}/login`}
          prefetchPolicy="intent"
          className={AUTH_SWITCH_LINK_CLASS}
        >
          {dictionary.signInLink}
        </AppLink>
      </p>
    </form>
  );
}
