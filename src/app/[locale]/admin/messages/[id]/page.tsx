import {
  CalendarDays,
  ChevronLeft,
  CircleCheckBig,
  Mail,
  MessageSquare,
  Phone,
  ShieldAlert,
  User,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Card } from "@/components/ui/Card";
import { AdminDetailField } from "@/features/admin/ui/AdminDetailField";
import {
  ADMIN_PAGE_TITLE,
  ADMIN_SECTION_TITLE,
} from "@/features/admin/ui/admin-form-classes";
import { ADMIN_BADGE } from "@/features/admin/ui/status-badge";
import { getAdminContactMessageById } from "@/features/contact/application/queries";
import {
  getEligibleContactStatuses,
  isContactStatus,
} from "@/features/contact/domain/contact-rules";
import { contactStatusLabel } from "@/features/contact/ui/contact-status-label";
import { UpdateContactStatusForm } from "@/features/contact/ui/UpdateContactStatusForm";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AdminMessageDetailPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

const FIELD_ICON_CLASS = "h-4 w-4";

function contactStatusBadgeClass(status: string): string {
  const normalized = status.toUpperCase();
  if (normalized === "UNREAD") return "bg-blue-100 text-blue-800";
  if (normalized === "READ") return "bg-yellow-100 text-yellow-800";
  if (normalized === "REPLIED") return "bg-green-100 text-green-800";
  if (normalized === "ARCHIVED") return "bg-gray-100 text-gray-800";
  return "bg-gray-100 text-gray-800";
}

export default async function AdminMessageDetailPage({
  params,
}: AdminMessageDetailPageProps) {
  const { locale, id } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const t = dictionary.admin;
  const labels = t.messages.statusLabels;

  const message = await getAdminContactMessageById(id);
  if (!message) {
    notFound();
  }

  const status = isContactStatus(message.status) ? message.status : null;
  const eligible = status ? getEligibleContactStatuses(status) : [];
  const receivedAt = `${message.createdAt.toISOString().slice(0, 19).replace("T", " ")} ${t.common.utc}`;

  return (
    <section>
      <div className="mb-6">
        <Link
          href={`/${locale}/admin/messages`}
          className="mb-4 inline-flex h-11 items-center gap-1.5 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          {t.common.back}
        </Link>
        <h1 className={ADMIN_PAGE_TITLE}>{message.subject}</h1>
      </div>

      <Card className="mb-4 p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2 md:gap-x-10">
          <AdminDetailField
            icon={<User className={FIELD_ICON_CLASS} />}
            label={t.messages.detail.fromLabel}
          >
            {message.name}
          </AdminDetailField>
          <AdminDetailField
            icon={<Mail className={FIELD_ICON_CLASS} />}
            label={t.messages.detail.emailLabel}
          >
            {message.email}
          </AdminDetailField>
          <AdminDetailField
            icon={<Phone className={FIELD_ICON_CLASS} />}
            label={t.messages.detail.phoneLabel}
          >
            {message.phone ?? t.common.none}
          </AdminDetailField>
          <AdminDetailField
            icon={<CircleCheckBig className={FIELD_ICON_CLASS} />}
            label={t.common.status}
          >
            <span
              className={`${ADMIN_BADGE} ${contactStatusBadgeClass(message.status)}`}
            >
              {contactStatusLabel(message.status, labels)}
            </span>
          </AdminDetailField>
          <AdminDetailField
            icon={<ShieldAlert className={FIELD_ICON_CLASS} />}
            label={t.messages.detail.spamScoreLabel}
          >
            {message.spamScore === null
              ? t.common.none
              : String(message.spamScore)}
          </AdminDetailField>
          <AdminDetailField
            icon={<CalendarDays className={FIELD_ICON_CLASS} />}
            label={t.messages.detail.receivedLabel}
          >
            {receivedAt}
          </AdminDetailField>
        </div>
      </Card>

      <Card className="mb-4 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-forest/10 text-brand-forest">
            <MessageSquare className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className={ADMIN_SECTION_TITLE}>{t.messages.detail.message}</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
              {message.message}
            </p>
          </div>
        </div>
      </Card>

      {status ? (
        <UpdateContactStatusForm
          locale={locale}
          messageId={message.id}
          currentStatus={status}
          eligibleStatuses={eligible}
          copy={t}
        />
      ) : (
        <p className="text-sm text-red-700">
          {t.messages.detail.unknownStatus}
        </p>
      )}
    </section>
  );
}
