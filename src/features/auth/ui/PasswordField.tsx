"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import {
  AUTH_LABEL_CLASS,
  authFieldClassName,
} from "@/features/auth/ui/auth-form-styles";

type PasswordFieldProps = {
  name: string;
  label: string;
  showPasswordLabel: string;
  hidePasswordLabel: string;
  autoComplete: string;
  disabled?: boolean;
  markRequired?: boolean;
  defaultValue?: string;
  invalid?: boolean;
};

export function PasswordField({
  name,
  label,
  showPasswordLabel,
  hidePasswordLabel,
  autoComplete,
  disabled = false,
  markRequired = false,
  defaultValue = "",
  invalid = false,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <label className={AUTH_LABEL_CLASS}>
      <span className="mb-2 block">
        {label}
        {markRequired ? (
          <span className="text-brand-forest" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </span>
      <span className="relative block">
        <input
          required
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          disabled={disabled}
          defaultValue={defaultValue}
          aria-invalid={invalid || undefined}
          aria-required={markRequired || undefined}
          className={`${authFieldClassName(invalid)} pr-11`}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-brand-forest/70 transition hover:text-brand-forest"
          aria-label={visible ? hidePasswordLabel : showPasswordLabel}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </span>
    </label>
  );
}
