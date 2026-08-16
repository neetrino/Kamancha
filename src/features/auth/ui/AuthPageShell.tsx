import type { ReactNode } from "react";

import { ContactHands } from "@/features/contact/ui/ContactHands";

type AuthPageShellProps = {
  title: string;
  children: ReactNode;
  /** Slightly narrower white card (login). */
  compactForm?: boolean;
};

/**
 * Login / register chrome — same layout as Contact Us (Figma 253:513 / 267:207).
 */
export function AuthPageShell({
  title,
  children,
  compactForm = false,
}: AuthPageShellProps) {
  return (
    <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-visible pt-2 sm:pt-3">
      <ContactHands />
      <div className="relative z-[1] mx-auto max-w-[1440px] px-4 pb-8 sm:px-6 lg:px-8">
        <section className="relative z-[1] mx-auto flex max-w-[633px] flex-col items-center pt-0">
          <div
            className="mb-2 flex items-center justify-center gap-2"
            aria-hidden
          >
            <span className="size-1.5 rounded-full bg-white" />
            <span className="size-1.5 rounded-full bg-white" />
            <span className="size-1.5 rounded-full bg-white" />
          </div>
          <h1 className="mb-8 text-center font-big-fat-boii text-[40px] leading-[1.1] font-normal tracking-wide text-white uppercase sm:text-[48px] md:text-[58px]">
            {title}
          </h1>
          <div
            className={`w-full rounded-[30px] bg-white px-5 pt-10 pb-0 ${
              compactForm ? "max-w-[520px]" : ""
            }`}
          >
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}
