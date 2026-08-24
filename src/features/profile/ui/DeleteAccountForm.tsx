"use client";

import { useActionState, useState } from "react";

import {
  deleteAccountAction,
  type DeleteAccountActionState,
} from "@/features/auth/delete-account-action";
import {
  PROFILE_FIELD,
  PROFILE_LABEL,
  PROFILE_PILL_DANGER,
  PROFILE_SECTION,
  PROFILE_SECTION_TITLE,
} from "@/features/profile/ui/profile-surface";

type DeleteAccountFormProps = {
  locale: string;
  labels: {
    title: string;
    description: string;
    pointOrders: string;
    pointLogin: string;
    pointData: string;
    currentPassword: string;
    currentPasswordPlaceholder: string;
    acknowledge: string;
    submit: string;
    deleting: string;
  };
};

const initialState: DeleteAccountActionState = {};

export function DeleteAccountForm({ locale, labels }: DeleteAccountFormProps) {
  const action = deleteAccountAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [password, setPassword] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <section className={PROFILE_SECTION}>
      <div className="relative z-[2] mb-6 space-y-2 sm:mb-8">
        <h1 className={PROFILE_SECTION_TITLE}>{labels.title}</h1>
        <p className="relative z-[2] text-sm leading-relaxed text-gray-600 xl:text-white">
          {labels.description}
        </p>
      </div>

      <ul className="relative z-[2] mb-8 max-w-2xl list-disc space-y-2 pl-5 text-sm text-gray-600 sm:mb-10 xl:text-white">
        <li>{labels.pointOrders}</li>
        <li>{labels.pointLogin}</li>
        <li>{labels.pointData}</li>
      </ul>

      <form
        action={formAction}
        className="relative z-[2] mx-auto max-w-xl space-y-6 xl:mx-0 xl:max-w-2xl"
      >
        <label className={PROFILE_LABEL}>
          {labels.currentPassword}
          <input
            name="password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={labels.currentPasswordPlaceholder}
            className={PROFILE_FIELD}
            autoComplete="current-password"
          />
        </label>

        <label className="flex cursor-pointer items-start gap-3">
          <input
            name="acknowledged"
            type="checkbox"
            value="on"
            className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-forest focus:ring-brand-forest xl:border-white/60"
            checked={acknowledged}
            onChange={(event) => setAcknowledged(event.target.checked)}
          />
          <span className="text-sm leading-snug text-gray-900 xl:text-white">
            {labels.acknowledge}
          </span>
        </label>

        {state.error ? (
          <p className="text-sm text-red-700" role="alert">
            {state.error}
          </p>
        ) : null}

        <div className="pt-1 sm:pt-2">
          <button
            type="submit"
            className={`${PROFILE_PILL_DANGER} w-full sm:w-auto`}
            disabled={isPending || !acknowledged}
          >
            {isPending ? labels.deleting : labels.submit}
          </button>
        </div>
      </form>
    </section>
  );
}
