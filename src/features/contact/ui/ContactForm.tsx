"use client";

import { useState, useTransition } from "react";

import { KamanchaPillButton } from "@/components/ui/KamanchaPillButton";
import { submitContactMessageAction } from "@/features/contact/application/submit-contact";

type ContactFormCopy = {
  name: string;
  email: string;
  subject: string;
  message: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  subjectPlaceholder: string;
  messagePlaceholder: string;
  submit: string;
  success: string;
  error: string;
};

type ContactFormProps = {
  copy: ContactFormCopy;
};

const FIELD_CLASS =
  "h-12 w-full rounded-[20px] border-0 bg-[rgba(97,135,98,0.13)] px-[13px] text-sm text-gray-900 outline-none transition placeholder:text-[#717182] focus:ring-2 focus:ring-brand-forest/30 disabled:opacity-60";

const LABEL_CLASS = "block text-sm font-medium tracking-[-0.15px] text-[#0a0a0a]";

export function ContactForm({ copy }: ContactFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (success) {
    return (
      <p
        role="status"
        className="rounded-[20px] bg-[rgba(97,135,98,0.13)] px-4 py-6 text-center text-sm text-gray-900"
      >
        {copy.success}
      </p>
    );
  }

  return (
    <form
      className="relative flex w-full flex-col items-center"
      data-node-id="244:464"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        startTransition(async () => {
          setError(null);
          const result = await submitContactMessageAction({
            name: String(formData.get("name") ?? ""),
            email: String(formData.get("email") ?? ""),
            subject: String(formData.get("subject") ?? ""),
            message: String(formData.get("message") ?? ""),
            companyWebsite: String(formData.get("companyWebsite") ?? ""),
          });

          if (!result.ok) {
            setError(result.error.message || copy.error);
            return;
          }

          setSuccess(true);
        });
      }}
    >
      <div className="w-full space-y-6 px-4 sm:px-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          <label className={LABEL_CLASS}>
            <span className="mb-2 block">{copy.name}</span>
            <input
              name="name"
              required
              maxLength={120}
              placeholder={copy.namePlaceholder}
              className={FIELD_CLASS}
              disabled={isPending}
              autoComplete="name"
            />
          </label>
          <label className={LABEL_CLASS}>
            <span className="mb-2 block">{copy.email}</span>
            <input
              name="email"
              type="email"
              required
              maxLength={254}
              placeholder={copy.emailPlaceholder}
              className={FIELD_CLASS}
              disabled={isPending}
              autoComplete="email"
            />
          </label>
        </div>

        <label className={LABEL_CLASS}>
          <span className="mb-2 block">{copy.subject}</span>
          <input
            name="subject"
            required
            maxLength={160}
            placeholder={copy.subjectPlaceholder}
            className={FIELD_CLASS}
            disabled={isPending}
          />
        </label>

        <label className={LABEL_CLASS}>
          <span className="mb-2 block">{copy.message}</span>
          <textarea
            name="message"
            required
            minLength={10}
            maxLength={5000}
            rows={4}
            placeholder={copy.messagePlaceholder}
            className={`${FIELD_CLASS} h-24 resize-none py-2.5`}
            disabled={isPending}
          />
        </label>
      </div>

      <input
        type="text"
        name="companyWebsite"
        tabIndex={-1}
        autoComplete="off"
        className="sr-only"
        aria-hidden
      />

      {error ? (
        <p role="alert" className="w-full px-4 pt-3 text-sm text-red-600 sm:px-5">
          {error}
        </p>
      ) : null}

      <div className="w-full max-w-[575px] px-2 py-5 sm:px-4">
        <KamanchaPillButton
          type="submit"
          variant="dark"
          label={copy.submit}
          disabled={isPending}
          figmaNodeId="244:499"
          className="max-w-none sm:max-w-none"
        />
      </div>
    </form>
  );
}
