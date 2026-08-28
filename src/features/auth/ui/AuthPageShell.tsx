"use client";

import type { ReactNode } from "react";
import { motion, type Transition } from "motion/react";

import { ContactHands } from "@/features/contact/ui/ContactHands";
import { usePlayHomeMotion } from "@/features/home/ui/use-play-home-motion";

type AuthPageShellProps = {
  title: string;
  children: ReactNode;
  /** Slightly narrower white card (login / forgot-password). */
  compactForm?: boolean;
  footer?: ReactNode;
  lowerLeftHand?: boolean;
  raiseLeftHand?: boolean;
};

const springLogo: Transition = {
  type: "spring",
  stiffness: 70,
  damping: 18,
  mass: 0.9,
};

const springCard: Transition = {
  type: "spring",
  stiffness: 55,
  damping: 18,
  mass: 0.95,
};

/**
 * Login / register / contact chrome — Figma 253:513 / 267:207.
 */
export function AuthPageShell({
  title,
  children,
  compactForm = false,
  footer,
  lowerLeftHand = false,
  raiseLeftHand = false,
}: AuthPageShellProps) {
  const playMotion = usePlayHomeMotion();
  const instant: Transition = { duration: 0 };
  const titleTransition: Transition = playMotion
    ? { ...springLogo, delay: 0.5 }
    : instant;
  const cardTransition: Transition = playMotion
    ? { ...springCard, delay: 0.12 }
    : instant;

  return (
    <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-visible pt-6 sm:pt-8">
      <ContactHands lowerLeft={lowerLeftHand} raiseLeft={raiseLeftHand} />
      <div className="relative z-[1] mx-auto max-w-[1440px] px-4 pb-8 sm:px-6 xl:px-8">
        <section className="relative z-[1] mx-auto flex max-w-[633px] flex-col items-center pt-2">
          <motion.div
            className="mb-2 flex items-center justify-center gap-2"
            aria-hidden
            initial={playMotion ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={playMotion ? { duration: 0.28, delay: 0.05 } : instant}
          >
            <span className="size-1.5 rounded-full bg-white" />
            <span className="size-1.5 rounded-full bg-white" />
            <span className="size-1.5 rounded-full bg-white" />
          </motion.div>
          <motion.h1
            className="mb-8 text-center font-big-fat-boii text-[44px] leading-[1.1] font-bold tracking-wide text-white uppercase sm:text-[52px] md:text-[62px]"
            initial={
              playMotion
                ? { opacity: 0, y: 18, filter: "blur(4px)" }
                : false
            }
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={titleTransition}
          >
            {title}
          </motion.h1>
          <motion.div
            className={`w-full rounded-[30px] bg-white px-5 pt-10 pb-0 ${
              compactForm ? "max-w-[520px]" : ""
            }`}
            initial={playMotion ? { opacity: 0, y: 28 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={cardTransition}
          >
            {children}
          </motion.div>
        </section>
        {footer ? <div className="relative z-[1]">{footer}</div> : null}
      </div>
    </div>
  );
}
