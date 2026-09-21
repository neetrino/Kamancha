"use client";

import { useRef, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAdminFilterNavigate } from "@/features/admin/ui/admin-filter-navigation";
import { AdminSearchInput } from "@/features/admin/ui/AdminSearchInput";
import {
  ADMIN_LABEL,
  ADMIN_SELECT,
} from "@/features/admin/ui/admin-form-classes";
import { CONTACT_STATUSES } from "@/features/contact/domain/contact-rules";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AdminMessagesFiltersProps = {
  q?: string;
  status?: string;
  copy: Dictionary["admin"]["messages"];
  filterLabel: string;
};

/** Soft-navigating search + status filters for admin contact messages. */
export function AdminMessagesFilters({
  q,
  status,
  copy,
  filterLabel,
}: AdminMessagesFiltersProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const navigateFilters = useAdminFilterNavigate();

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    navigateFilters(formRef.current);
  }

  return (
    <Card className="mb-6 p-4">
      <form
        ref={formRef}
        method="get"
        onSubmit={onSubmit}
        className="flex flex-wrap items-end gap-3"
      >
        <label className="min-w-[180px] flex-1">
          <span className={ADMIN_LABEL}>{copy.search}</span>
          <AdminSearchInput
            name="q"
            defaultValue={q ?? ""}
            placeholder={copy.searchPlaceholder}
          />
        </label>
        <label className="min-w-[140px]">
          <span className={ADMIN_LABEL}>{copy.status}</span>
          <select
            name="status"
            defaultValue={status ?? ""}
            className={ADMIN_SELECT}
            onChange={(event) => {
              navigateFilters(formRef.current, {
                status:
                  event.target.value.trim() === ""
                    ? null
                    : event.target.value,
              });
            }}
          >
            <option value="">{copy.all}</option>
            {CONTACT_STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" size="field">
          {filterLabel}
        </Button>
      </form>
    </Card>
  );
}
