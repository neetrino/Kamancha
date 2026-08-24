"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  ADMIN_PAGINATION_CENTER,
  ADMIN_PAGINATION_CIRCLE,
  ADMIN_PAGINATION_CIRCLE_DISABLED,
} from "@/features/admin/ui/admin-form-classes";

type AdminPaginationProps = {
  page: number;
  totalPages: number;
  ariaLabel: string;
  previousLabel: string;
  nextLabel: string;
  pageOfLabel: string;
  prevHref?: string;
  nextHref?: string;
  onPrevious?: () => void;
  onNext?: () => void;
};

export function AdminPagination({
  page,
  totalPages,
  ariaLabel,
  previousLabel,
  nextLabel,
  pageOfLabel,
  prevHref,
  nextHref,
  onPrevious,
  onNext,
}: AdminPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className={ADMIN_PAGINATION_CENTER} aria-label={ariaLabel}>
      <PaginationCircle
        enabled={page > 1}
        href={prevHref}
        onClick={onPrevious}
        ariaLabel={previousLabel}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </PaginationCircle>
      <span>
        {pageOfLabel
          .replace("{page}", String(page))
          .replace("{totalPages}", String(totalPages))}
      </span>
      <PaginationCircle
        enabled={page < totalPages}
        href={nextHref}
        onClick={onNext}
        ariaLabel={nextLabel}
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
      </PaginationCircle>
    </nav>
  );
}

function PaginationCircle({
  enabled,
  href,
  onClick,
  ariaLabel,
  children,
}: {
  enabled: boolean;
  href?: string;
  onClick?: () => void;
  ariaLabel: string;
  children: ReactNode;
}) {
  if (!enabled) {
    return (
      <span className={ADMIN_PAGINATION_CIRCLE_DISABLED} aria-disabled>
        {children}
      </span>
    );
  }

  if (href) {
    return (
      <Link href={href} className={ADMIN_PAGINATION_CIRCLE} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={ADMIN_PAGINATION_CIRCLE}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
