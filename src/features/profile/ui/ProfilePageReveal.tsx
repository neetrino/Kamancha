"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Reveal } from "@/components/ui/RevealMotion";

type ProfilePageRevealProps = {
  children: ReactNode;
};

/**
 * Rise on section mount / route change. Transform-only (`fade={false}`) so
 * liquid-glass backdrop-filter stays correct for the whole animation.
 */
export function ProfilePageReveal({ children }: ProfilePageRevealProps) {
  const pathname = usePathname() ?? "";

  return (
    <Reveal
      key={pathname}
      immediate
      fade={false}
      className="profile-page-reveal flex min-h-full flex-col"
    >
      {children}
    </Reveal>
  );
}
