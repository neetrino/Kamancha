import type { InputHTMLAttributes } from "react";

type CheckoutRadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function CheckoutRadio({
  className = "",
  disabled,
  ...props
}: CheckoutRadioProps) {
  return (
    <span
      className={`relative mr-4 inline-flex h-5 w-5 shrink-0 items-center justify-center ${className}`.trim()}
    >
      <input type="radio" disabled={disabled} className="peer sr-only" {...props} />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full border-2 border-gray-300 bg-white transition-colors peer-checked:border-brand-forest peer-disabled:opacity-50"
      />
      <span
        aria-hidden
        className="pointer-events-none h-2.5 w-2.5 scale-0 rounded-full bg-brand-forest transition-transform peer-checked:scale-100 peer-disabled:opacity-50"
      />
    </span>
  );
}
