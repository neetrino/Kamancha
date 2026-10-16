import Image from "next/image";
import type { ReactNode } from "react";

import { AppLink } from "@/components/ui/AppLink";
import { armPendingDeliveryNavbarDrop } from "@/features/home/storefront-path-memory";

type HubBannerCardProps = {
  label: string;
  photoSrc: string;
  logoSrc?: string;
  logoWidth?: number;
  logoHeight?: number;
  logo?: ReactNode;
  iconSrc: string;
  href?: string;
  className?: string;
  photoClassName?: string;
  photoNodeId?: string;
  logoClassName?: string;
};

function BannerSurface({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <div
      className={`relative h-[169px] overflow-hidden rounded-[20px] border-2 border-white xl:h-[338px] ${className.includes("bg-") ? "" : "bg-brand-forest"} ${className}`}
    >
      {children}
    </div>
  );
}

function BannerPhoto({
  src,
  className,
  nodeId,
}: {
  src: string;
  className: string;
  nodeId?: string;
}) {
  if (className.includes("absolute")) {
    return (
      <Image
        src={src}
        alt=""
        width={1024}
        height={683}
        className={`pointer-events-none max-w-none ${className}`}
        data-node-id={nodeId}
      />
    );
  }

  return (
    <Image
      src={src}
      alt=""
      fill
      sizes="(min-width: 1280px) 50vw, 100vw"
      className={`pointer-events-none ${className}`}
      data-node-id={nodeId}
    />
  );
}

/**
 * First-page hub tile — photo, brand mark, and white pill (Figma 704:4047).
 */
export function HubBannerCard({
  label,
  photoSrc,
  logoSrc,
  logoWidth = 167,
  logoHeight = 87,
  logo,
  iconSrc,
  href,
  className = "",
  photoClassName = "object-cover",
  photoNodeId,
  logoClassName = "top-3 left-3 h-auto w-[167px]",
}: HubBannerCardProps) {
  const inner = (
    <>
      <BannerPhoto src={photoSrc} className={photoClassName} nodeId={photoNodeId} />
      {logo ?? (
        logoSrc ? (
          <Image
            src={logoSrc}
            alt=""
            width={logoWidth}
            height={logoHeight}
            unoptimized
            className={`pointer-events-none absolute z-[1] max-w-none ${logoClassName}`}
          />
        ) : null
      )}
      <span className="absolute right-4 bottom-4 z-[1] inline-flex h-10 max-w-[calc(100%-2rem)] items-center gap-1.5 rounded-[30px] bg-white px-3 font-big-fat-boii text-base leading-none text-brand-forest xl:right-6 xl:bottom-6">
        <Image
          src={iconSrc}
          alt=""
          width={26}
          height={26}
          unoptimized
          className="size-7 shrink-0"
        />
        <span className="truncate">{label}</span>
      </span>
    </>
  );

  if (href) {
    const isExternal = href.startsWith("http://") || href.startsWith("https://");
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
          aria-label={label}
        >
          <BannerSurface className={className}>{inner}</BannerSurface>
        </a>
      );
    }

    return (
      <AppLink
        href={href}
        prefetchPolicy="intent"
        className="block"
        aria-label={label}
        onPointerDown={() => {
          if (href.includes("/delivery")) {
            armPendingDeliveryNavbarDrop();
          }
        }}
      >
        <BannerSurface className={className}>{inner}</BannerSurface>
      </AppLink>
    );
  }

  return (
    <BannerSurface className={className}>
      {inner}
    </BannerSurface>
  );
}
