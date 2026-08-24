"use client";

import {
  CalendarDays,
  CircleCheckBig,
  Mail,
  MessageSquare,
  Phone,
  ShieldAlert,
  User,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { SideSheet } from "@/components/ui/SideSheet";
import { AdminDetailField } from "@/features/admin/ui/AdminDetailField";
import { ADMIN_SECTION_TITLE } from "@/features/admin/ui/admin-form-classes";
import { ADMIN_BADGE } from "@/features/admin/ui/status-badge";
import type { AdminContactMessageDetail } from "@/features/contact/application/queries";
import {
  getEligibleContactStatuses,
  isContactStatus,
} from "@/features/contact/domain/contact-rules";
import { contactStatusBadgeClass } from "@/features/contact/ui/contact-status-badge-class";
import { contactStatusLabel } from "@/features/contact/ui/contact-status-label";
import { UpdateContactStatusForm } from "@/features/contact/ui/UpdateContactStatusForm";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

const FIELD_ICON_CLASS = "h-4 w-4";

type AdminMessageDetailSheetProps = {
  open: boolean;
  onClose: () => void;
  message: AdminContactMessageDetail | null;
  isLoading: boolean;
  locale: string;
  copy: Dictionary["admin"];
  onStatusUpdated: () => void;
};

export function AdminMessageDetailSheet({
  open,
  onClose,
  message,
  isLoading,
  locale,
  copy,
  onStatusUpdated,
}: AdminMessageDetailSheetProps) {
  const labels = copy.messages.statusLabels;
  const status = message && isContactStatus(message.status) ? message.status : null;
  const eligible = status ? getEligibleContactStatuses(status) : [];
  const receivedAt = message
    ? `${new Date(message.createdAt).toISOString().slice(0, 19).replace("T", " ")} ${copy.common.utc}`
    : "";

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      ariaLabel={copy.messages.sheetAria}
      panelClassName="w-full sm:w-[65%] lg:w-[55%] max-w-4xl"
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="shrink-0 border-b border-gray-200 px-5 py-4 sm:px-6">
          {message ? (
            <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
              {message.subject}
            </h2>
          ) : (
            <h2 className="text-lg font-semibold text-gray-900">
              {copy.messages.sheetTitle}
            </h2>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-28 animate-pulse rounded-2xl bg-gray-100" />
            <div className="h-36 animate-pulse rounded-2xl bg-gray-100" />
          </div>
        ) : null}

        {!isLoading && message ? (
          <div className="space-y-4">
            <Card className="p-4 sm:p-5">
              <div className="grid gap-4 md:grid-cols-2 md:gap-x-8">
                <AdminDetailField
                  icon={<User className={FIELD_ICON_CLASS} />}
                  label={copy.messages.detail.fromLabel}
                >
                  {message.name}
                </AdminDetailField>
                <AdminDetailField
                  icon={<Mail className={FIELD_ICON_CLASS} />}
                  label={copy.messages.detail.emailLabel}
                >
                  {message.email}
                </AdminDetailField>
                <AdminDetailField
                  icon={<Phone className={FIELD_ICON_CLASS} />}
                  label={copy.messages.detail.phoneLabel}
                >
                  {message.phone ?? copy.common.none}
                </AdminDetailField>
                <AdminDetailField
                  icon={<CircleCheckBig className={FIELD_ICON_CLASS} />}
                  label={copy.common.status}
                >
                  <span
                    className={`${ADMIN_BADGE} ${contactStatusBadgeClass(message.status)}`}
                  >
                    {contactStatusLabel(message.status, labels)}
                  </span>
                </AdminDetailField>
                <AdminDetailField
                  icon={<ShieldAlert className={FIELD_ICON_CLASS} />}
                  label={copy.messages.detail.spamScoreLabel}
                >
                  {message.spamScore === null
                    ? copy.common.none
                    : String(message.spamScore)}
                </AdminDetailField>
                <AdminDetailField
                  icon={<CalendarDays className={FIELD_ICON_CLASS} />}
                  label={copy.messages.detail.receivedLabel}
                >
                  {receivedAt}
                </AdminDetailField>
              </div>
            </Card>

            <Card className="p-4 sm:p-5">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-forest/10 text-brand-forest">
                  <MessageSquare className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className={ADMIN_SECTION_TITLE}>
                    {copy.messages.detail.message}
                  </h3>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                    {message.message}
                  </p>
                </div>
              </div>
            </Card>

            {status ? (
              <UpdateContactStatusForm
                key={`${message.id}-${message.status}`}
                locale={locale}
                messageId={message.id}
                currentStatus={status}
                eligibleStatuses={eligible}
                copy={copy}
                onSuccess={onStatusUpdated}
              />
            ) : (
              <p className="text-sm text-red-700">
                {copy.messages.detail.unknownStatus}
              </p>
            )}
          </div>
        ) : null}
        </div>
      </div>
    </SideSheet>
  );
}
