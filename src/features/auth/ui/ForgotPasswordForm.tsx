"use client";

import { useActionState } from "react";

import { AppLink } from "@/components/ui/AppLink";
import { KamanchaPillButton } from "@/components/ui/KamanchaPillButton";
import {
  forgotPasswordAction,
  type ForgotPasswordActionState,
} from "@/features/auth/forgot-password-action";
import {
  AUTH_ERROR_CLASS,
  AUTH_FIELD_CLASS,
  AUTH_LABEL_CLASS,
  AUTH_LINK_CLASS,
  AUTH_STATUS_CLASS,
} from "@/features/auth/ui/auth-form-styles";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

const initialState: ForgotPasswordActionState = {};

type ForgotPasswordFormProps = {
  locale: Locale;
  dictionary: Dictionary["auth"];
};

export function ForgotPasswordForm({
  locale,
  dictionary,
}: ForgotPasswordFormProps) {
  const action = forgotPasswordAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="relative flex w-full flex-col items-center">
      <div className="w-full space-y-6 px-4 sm:px-5">
        <p className="text-sm leading-5 text-[#0a0a0a]/70">
          {dictionary.forgotPasswordSubtitle}
        </p>

        <label className={AUTH_LABEL_CLASS}>
          <span className="mb-2 block">{dictionary.email}</span>
          <input
            required
            name="email"
            type="email"
            autoComplete="email"
            disabled={isPending}
            className={AUTH_FIELD_CLASS}
          />
        </label>
      </div>

      {state.error ? (
        <p role="alert" className={AUTH_ERROR_CLASS}>
          {state.error}
        </p>
      ) : null}

      {state.sent ? (
        <p role="status" className={AUTH_STATUS_CLASS}>
          {dictionary.forgotPasswordSuccess}
        </p>
      ) : null}

      <div className="w-full max-w-[575px] px-2 py-5 sm:px-4">
        <KamanchaPillButton
          type="submit"
          variant="dark"
          label={
            isPending
              ? dictionary.submittingForgotPassword
              : dictionary.submitForgotPassword
          }
          disabled={isPending}
          className="max-w-none sm:max-w-none"
        />
      </div>

      <p className="pb-6 text-center text-sm text-[#0a0a0a]">
        <AppLink
          href={`/${locale}/login`}
          prefetchPolicy="intent"
          className={AUTH_LINK_CLASS}
        >
          {dictionary.backToLogin}
        </AppLink>
      </p>
    </form>
  );
}
