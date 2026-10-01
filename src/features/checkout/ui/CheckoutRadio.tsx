import type { InputHTMLAttributes } from "react";

type CheckoutRadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  /** Smaller hit target below the desktop checkout breakpoint. */
  compactOnMobile?: boolean;
};

export function CheckoutRadio({
  className = "",
  compactOnMobile = false,
  disabled,
  ...props
}: CheckoutRadioProps) {
  const sizeClass = compactOnMobile
    ? "mr-2.5 h-4 w-4 xl:mr-4 xl:h-5 xl:w-5"
    : "mr-4 h-5 w-5";

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${sizeClass} ${className}`.trim()}
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
