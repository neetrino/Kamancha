import Image from "next/image";

import { AppLink } from "@/components/ui/AppLink";

type KamanchaPillButtonProps = {
  href: string;
  label: string;
  variant?: "light" | "dark";
  className?: string;
};

function PillOrnament({ mirrored = false }: { mirrored?: boolean }) {
  return (
    <span
      className={`relative flex h-[49px] w-[62px] shrink-0 items-center justify-center overflow-hidden ${
        mirrored ? "-scale-y-100 rotate-90" : "rotate-90"
      }`}
      aria-hidden
    >
      <Image
        src="/assets/brand/hero/pill-ornament.webp"
        alt=""
        width={62}
        height={49}
        className="h-[62px] w-[49px] rounded-[20px] object-cover"
      />
    </span>
  );
}

/**
 * Figma BUTTON (22:435) — pill CTA with carved end ornaments.
 */
export function KamanchaPillButton({
  href,
  label,
  variant = "light",
  className = "",
}: KamanchaPillButtonProps) {
  const tones =
    variant === "light"
      ? "bg-white text-brand-forest"
      : "bg-brand-forest text-white";

  return (
    <AppLink
      href={href}
      prefetchPolicy="intent"
      className={`inline-flex h-16 w-full max-w-[280px] items-center justify-between overflow-hidden rounded-full pt-2 pb-[7px] text-[20px] leading-6 transition hover:opacity-95 sm:max-w-[316px] ${tones} ${className}`}
    >
      <PillOrnament />
      <span className="min-w-0 flex-1 text-center font-big-fat-boii font-normal tracking-wide">
        {label}
      </span>
      <PillOrnament mirrored />
    </AppLink>
  );
}
