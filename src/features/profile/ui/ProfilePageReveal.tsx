"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Reveal } from "@/components/ui/RevealMotion";

type ProfilePageRevealProps = {
  children: ReactNode;
  /** Entrance rise in px. Use `0` inside the mobile tab sheet. */
  y?: number;
};

/**
 * Rise on section mount / route change. Transform-only (`fade={false}`) so
 * liquid-glass backdrop-filter stays correct for the whole animation.
 */
export function ProfilePageReveal({
  children,
  y = 28,
}: ProfilePageRevealProps) {
  const pathname = usePathname() ?? "";

  return (
    <Reveal
      key={pathname}
      immediate
      fade={false}
      y={y}
      className="profile-page-reveal flex min-h-full flex-col"
    >
      {children}
    </Reveal>
  );
}
