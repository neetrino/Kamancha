"use client";

import { useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";

import { Card } from "@/components/ui/Card";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { useAdminFilterNavigate } from "@/features/admin/ui/admin-filter-navigation";
import { AdminSearchInput } from "@/features/admin/ui/AdminSearchInput";
import { ADMIN_LABEL } from "@/features/admin/ui/admin-form-classes";
import { CONTACT_STATUSES } from "@/features/contact/domain/contact-rules";
import { contactStatusLabel } from "@/features/contact/ui/contact-status-label";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AdminMessagesFiltersProps = {
  q?: string;
  status?: string;
  copy: Dictionary["admin"]["messages"];
};

/** Soft-navigating search + status filters for admin contact messages. */
export function AdminMessagesFilters({
  q,
  status,
  copy,
}: AdminMessagesFiltersProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const navigateFilters = useAdminFilterNavigate();
  const [statusValue, setStatusValue] = useState(status ?? "");
  const statusOptions = CONTACT_STATUSES.filter((item) => item !== "REPLIED").map((item) => ({
    value: item,
    label: contactStatusLabel(item, copy.statusLabels),
  }));

  function applyStatus(next: string): void {
    flushSync(() => setStatusValue(next));
    navigateFilters(formRef.current, {
      status: next.trim() === "" ? null : next,
    });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    navigateFilters(formRef.current);
  }

  return (
    <Card className="mb-6 overflow-visible p-4">
      <form
        ref={formRef}
        method="get"
        onSubmit={onSubmit}
        className="flex flex-wrap items-end gap-3"
      >
        <div className="min-w-[140px]">
          <span className={ADMIN_LABEL}>{copy.status}</span>
          <SelectDropdown
            name="status"
            ariaLabel={copy.status}
            value={statusValue}
            allLabel={copy.all}
            options={statusOptions}
            fitContent
            onValueChange={applyStatus}
          />
        </div>
        <label className="min-w-[180px] flex-1">
          <span className={ADMIN_LABEL}>{copy.search}</span>
          <AdminSearchInput
            name="q"
            defaultValue={q ?? ""}
            placeholder={copy.searchPlaceholder}
          />
        </label>
      </form>
    </Card>
  );
}
