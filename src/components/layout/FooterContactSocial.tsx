"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { staticAssetUrl } from "@/lib/media/static-asset-url";

type FooterContactSocialProps = {
  instagramHref: string;
  facebookHref: string;
  tiktokHref: string;
  instagramLabel: string;
  facebookLabel: string;
  tiktokLabel: string;
};

function SocialCircle({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/18 text-white transition-colors hover:border-white/40 hover:bg-white/5"
    >
      {children}
    </a>
  );
}

/**
 * Mobile social row under copyright — contact page only.
 */
export function FooterContactSocial({
  instagramHref,
  facebookHref,
  tiktokHref,
  instagramLabel,
  facebookLabel,
  tiktokLabel,
}: FooterContactSocialProps) {
  const pathname = usePathname() ?? "";
  const isContactPage = /\/contact\/?$/.test(pathname);
  if (!isContactPage) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 xl:hidden">
      <SocialCircle href={instagramHref} label={instagramLabel}>
        <Image
          src={staticAssetUrl("/assets/brand/footer/instagram.svg")}
          alt=""
          width={18}
          height={18}
          unoptimized
        />
      </SocialCircle>
      <SocialCircle href={facebookHref} label={facebookLabel}>
        <Image
          src={staticAssetUrl("/assets/brand/footer/facebook.svg")}
          alt=""
          width={18}
          height={18}
          unoptimized
        />
      </SocialCircle>
      <SocialCircle href={tiktokHref} label={tiktokLabel}>
        <Image
          src={staticAssetUrl("/assets/brand/footer/tiktok.webp")}
          alt=""
          width={18}
          height={18}
          unoptimized
        />
      </SocialCircle>
    </div>
  );
}
