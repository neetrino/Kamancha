"use client";

import { useActionState, useState } from "react";

import {
  changePasswordAction,
  type ChangePasswordActionState,
} from "@/features/auth/change-password-action";
import {
  PROFILE_FIELD,
  PROFILE_LABEL,
  PROFILE_PILL_LIGHT,
  PROFILE_SECTION,
  PROFILE_SECTION_DIVIDER,
  PROFILE_SECTION_TITLE,
} from "@/features/profile/ui/profile-surface";

type ChangePasswordFormProps = {
  locale: string;
  labels: {
    title: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    currentPasswordPlaceholder: string;
    newPasswordPlaceholder: string;
    confirmPasswordPlaceholder: string;
    change: string;
    changing: string;
  };
};

const emptyForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const initialState: ChangePasswordActionState = {};

export function ChangePasswordForm({ locale, labels }: ChangePasswordFormProps) {
  const action = changePasswordAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [values, setValues] = useState(emptyForm);
  const formKey = state.success ? "reset" : "active";

  return (
    <section className={PROFILE_SECTION}>
      <div className={PROFILE_SECTION_DIVIDER}>
        <h1 className={PROFILE_SECTION_TITLE}>{labels.title}</h1>
      </div>

      <form
        key={formKey}
        action={formAction}
        className="relative z-[2] mx-auto max-w-xl space-y-6 xl:mx-0 xl:max-w-2xl"
      >
        <label className={PROFILE_LABEL}>
          {labels.currentPassword}
          <input
            name="currentPassword"
            type="password"
            required
            value={values.currentPassword}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                currentPassword: event.target.value,
              }))
            }
            placeholder={labels.currentPasswordPlaceholder}
            className={PROFILE_FIELD}
            autoComplete="current-password"
          />
        </label>

        <label className={PROFILE_LABEL}>
          {labels.newPassword}
          <input
            name="newPassword"
            type="password"
            required
            value={values.newPassword}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                newPassword: event.target.value,
              }))
            }
            placeholder={labels.newPasswordPlaceholder}
            className={PROFILE_FIELD}
            autoComplete="new-password"
          />
        </label>

        <label className={PROFILE_LABEL}>
          {labels.confirmPassword}
          <input
            name="confirmPassword"
            type="password"
            required
            value={values.confirmPassword}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                confirmPassword: event.target.value,
              }))
            }
            placeholder={labels.confirmPasswordPlaceholder}
            className={PROFILE_FIELD}
            autoComplete="new-password"
          />
        </label>

        {state.error ? (
          <p className="text-sm text-red-700" role="alert">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-brand-forest" role="status">
            {state.success}
          </p>
        ) : null}

        <div className="pt-2 sm:pt-4">
          <button
            type="submit"
            className={`${PROFILE_PILL_LIGHT} w-full sm:w-auto`}
            disabled={isPending}
          >
            {isPending ? labels.changing : labels.change}
          </button>
        </div>
      </form>
    </section>
  );
}
