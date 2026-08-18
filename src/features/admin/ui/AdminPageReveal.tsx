"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Reveal } from "@/components/ui/RevealMotion";

type AdminPageRevealProps = {
  children: ReactNode;
};

/** Rise on admin route change. */
export function AdminPageReveal({ children }: AdminPageRevealProps) {
  const pathname = usePathname() ?? "";

  return (
    <Reveal
      key={pathname}
      immediate
      fade={false}
      className="flex min-h-full flex-col"
    >
      {children}
    </Reveal>
  );
}
