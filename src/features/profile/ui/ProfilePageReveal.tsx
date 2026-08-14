"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Reveal } from "@/components/ui/RevealMotion";

type ProfilePageRevealProps = {
  children: ReactNode;
};

/**
 * Fade + rise when a profile section mounts or the route changes.
 */
export function ProfilePageReveal({ children }: ProfilePageRevealProps) {
  const pathname = usePathname() ?? "";

  return (
    <Reveal
      key={pathname}
      immediate
      className="profile-page-reveal flex min-h-full flex-col"
    >
      {children}
    </Reveal>
  );
}
