"use client";

import { useActionState, useState } from "react";

import {
  updateProfileAction,
  type UpdateProfileActionState,
} from "@/features/auth/update-profile-action";
import { useProfileSession } from "@/features/profile/ui/ProfileSessionContext";
import {
  PROFILE_FIELD,
  PROFILE_LABEL,
  PROFILE_PILL_GHOST,
  PROFILE_PILL_LIGHT,
  PROFILE_SECTION,
  PROFILE_SECTION_DIVIDER,
  PROFILE_SECTION_TITLE,
} from "@/features/profile/ui/profile-surface";

type PersonalInformationFormProps = {
  locale: string;
  labels: {
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    cancel: string;
    save: string;
    saving: string;
    firstNamePlaceholder: string;
    lastNamePlaceholder: string;
    emailPlaceholder: string;
    phonePlaceholder: string;
  };
};

const initialState: UpdateProfileActionState = {};

export function PersonalInformationForm({
  locale,
  labels,
}: PersonalInformationFormProps) {
  const user = useProfileSession();
  const firstName = user.firstName;
  const lastName = user.lastName;
  const email = user.email;
  const phone = user.phone ?? "";
  const action = updateProfileAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [values, setValues] = useState({
    firstName,
    lastName,
    email,
    phone,
  });

  function resetToSaved(): void {
    setValues({ firstName, lastName, email, phone });
  }

  return (
    <section className={PROFILE_SECTION}>
      <div className={PROFILE_SECTION_DIVIDER}>
        <h1 className={PROFILE_SECTION_TITLE}>{labels.title}</h1>
      </div>

      <form
        action={formAction}
        className="relative z-[2] mx-auto max-w-xl space-y-6 xl:mx-0 xl:max-w-2xl"
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
          <label className={PROFILE_LABEL}>
            {labels.firstName}
            <input
              name="firstName"
              required
              value={values.firstName}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  firstName: event.target.value,
                }))
              }
              placeholder={labels.firstNamePlaceholder}
              className={PROFILE_FIELD}
              autoComplete="given-name"
            />
          </label>
          <label className={PROFILE_LABEL}>
            {labels.lastName}
            <input
              name="lastName"
              required
              value={values.lastName}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  lastName: event.target.value,
                }))
              }
              placeholder={labels.lastNamePlaceholder}
              className={PROFILE_FIELD}
              autoComplete="family-name"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
          <label className={PROFILE_LABEL}>
            {labels.email}
            <input
              name="email"
              type="email"
              required
              value={values.email}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, email: event.target.value }))
              }
              placeholder={labels.emailPlaceholder}
              className={PROFILE_FIELD}
              autoComplete="email"
            />
          </label>
          <label className={PROFILE_LABEL}>
            {labels.phone}
            <input
              name="phone"
              type="tel"
              required
              value={values.phone}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, phone: event.target.value }))
              }
              placeholder={labels.phonePlaceholder}
              className={PROFILE_FIELD}
              autoComplete="tel"
            />
          </label>
        </div>

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

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:gap-4 sm:pt-4">
          <button
            type="button"
            className={`${PROFILE_PILL_GHOST} w-full sm:w-auto`}
            onClick={resetToSaved}
            disabled={isPending}
          >
            {labels.cancel}
          </button>
          <button
            type="submit"
            className={`${PROFILE_PILL_LIGHT} w-full sm:w-auto`}
            disabled={isPending}
          >
            {isPending ? labels.saving : labels.save}
          </button>
        </div>
      </form>
    </section>
  );
}
