"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";

import { AppLink } from "@/components/ui/AppLink";
import { KamanchaPillButton } from "@/components/ui/KamanchaPillButton";
import { loginAction, type AuthActionState } from "@/features/auth/login-action";
import {
  AUTH_ERROR_CLASS,
  AUTH_FIELD_CLASS,
  AUTH_LABEL_CLASS,
  AUTH_LINK_CLASS,
  AUTH_STATUS_CLASS,
} from "@/features/auth/ui/auth-form-styles";
import { PasswordField } from "@/features/auth/ui/PasswordField";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

const initialState: AuthActionState = {};

type LoginFormProps = {
  locale: Locale;
  dictionary: Dictionary["auth"];
};

export function LoginForm({ locale, dictionary }: LoginFormProps) {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const resetSucceeded = searchParams.get("reset") === "1";
  const action = loginAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="relative flex w-full flex-col items-center">
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}

      <div className="w-full space-y-6 px-4 sm:px-5">
        {resetSucceeded ? (
          <p role="status" className={AUTH_STATUS_CLASS}>
            {dictionary.resetPasswordSuccess}
          </p>
        ) : null}

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

        <PasswordField
          name="password"
          label={dictionary.password}
          showPasswordLabel={dictionary.showPassword}
          hidePasswordLabel={dictionary.hidePassword}
          autoComplete="current-password"
          disabled={isPending}
        />

        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium tracking-[-0.15px] text-[#0a0a0a]">
            <input
              type="checkbox"
              name="rememberMe"
              value="on"
              disabled={isPending}
              className="size-4 shrink-0 accent-brand-forest"
            />
            {dictionary.rememberMe}
          </label>
          <AppLink
            href={`/${locale}/forgot-password`}
            prefetchPolicy="intent"
            className={`shrink-0 text-sm ${AUTH_LINK_CLASS}`}
          >
            {dictionary.forgotPassword}
          </AppLink>
        </div>
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
          label={dictionary.submitLogin}
          disabled={isPending}
          figmaNodeId="253:513"
          className="max-w-none sm:max-w-none"
        />
      </div>

      <p className="pb-6 text-center text-sm text-[#0a0a0a]">
        <AppLink
          href={`/${locale}/register`}
          prefetchPolicy="intent"
          className={AUTH_LINK_CLASS}
        >
          {dictionary.submitRegister}
        </AppLink>
      </p>
    </form>
  );
}
