"use client";

import type { ReactNode } from "react";

type LiquidGlassPanelProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Order-summary shell. Shared `.liquid-glass-panel` material + document optics.
 */
export function LiquidGlassPanel({
  children,
  className = "",
}: LiquidGlassPanelProps) {
  return (
    <section className={`liquid-glass-panel rounded-3xl ${className}`.trim()}>
      <div className="relative z-[1]">{children}</div>
    </section>
  );
}
