import { AppLink } from "@/components/ui/AppLink";
import {
  SITE_HEADER_GROUP_ORDER,
  SITE_HEADER_GROUP_ORDER_ON_LIGHT,
} from "@/components/layout/site-header-classes";

type GroupOrderHeaderButtonProps = {
  href: string;
  label: string;
  tone?: "onDark" | "onLight";
  className?: string;
  onClick?: () => void;
};

/**
 * Storefront group-order CTA. White pill on the dark header; forest fill in the mobile menu.
 */
export function GroupOrderHeaderButton({
  href,
  label,
  tone = "onDark",
  className = "",
  onClick,
}: GroupOrderHeaderButtonProps) {
  const toneClass =
    tone === "onLight"
      ? SITE_HEADER_GROUP_ORDER_ON_LIGHT
      : SITE_HEADER_GROUP_ORDER;

  return (
    <AppLink
      href={href}
      prefetchPolicy="intent"
      onClick={onClick}
      className={`${toneClass} ${className}`}
    >
      {label}
    </AppLink>
  );
}
