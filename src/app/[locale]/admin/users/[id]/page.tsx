import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  ChevronLeft,
  CircleCheckBig,
  Mail,
  Phone,
  Shield,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { AdminDetailField } from "@/features/admin/ui/AdminDetailField";
import { ADMIN_PAGE_TITLE } from "@/features/admin/ui/admin-form-classes";
import { getAdminUserById } from "@/features/users/application/queries";
import {
  getEligibleUserStatuses,
  isUserRole,
  isUserStatus,
} from "@/features/users/domain/user-lifecycle";
import { AdminUserBonuses } from "@/features/users/ui/AdminUserBonuses";
import { AdminUserGiftCards } from "@/features/users/ui/AdminUserGiftCards";
import { AdminUserNoteForm } from "@/features/users/ui/AdminUserNoteForm";
import { AdminUserRecentOrders } from "@/features/users/ui/AdminUserRecentOrders";
import { UpdateUserRoleForm } from "@/features/users/ui/UpdateUserRoleForm";
import { UpdateUserStatusForm } from "@/features/users/ui/UpdateUserStatusForm";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AdminUserDetailPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

const FIELD_ICON_CLASS = "h-4 w-4";

export default async function AdminUserDetailPage({
  params,
}: AdminUserDetailPageProps) {
  const { locale, id } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const t = dictionary.admin;

  const detail = await getAdminUserById(id);
  if (!detail) {
    notFound();
  }

  const { user, recentOrders, bonusSummary, giftCards } = detail;
  const role = isUserRole(user.role) ? user.role : null;
  const status = isUserStatus(user.status) ? user.status : null;
  const eligibleStatuses = status ? getEligibleUserStatuses(status) : [];
  const isAnonymized = status === "ANONYMIZED";

  return (
    <section>
      <div className="mb-6">
        <Link
          href={`/${locale}/admin/users`}
          className="mb-4 inline-flex h-11 items-center gap-1.5 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          {t.common.back}
        </Link>
        <h1 className={ADMIN_PAGE_TITLE}>
          {user.firstName} {user.lastName}
        </h1>
      </div>

      <Card className="mb-4 p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-3 md:gap-x-8">
          <AdminDetailField
            icon={<Shield className={FIELD_ICON_CLASS} />}
            label={t.users.detail.roleLabel}
          >
            {role ? (
              <UpdateUserRoleForm
                locale={locale}
                userId={user.id}
                currentRole={role}
                disabled={isAnonymized}
                copy={t}
              />
            ) : (
              <span className="text-sm text-red-700">
                {t.users.detail.unknownRole}
              </span>
            )}
          </AdminDetailField>
          <AdminDetailField
            icon={<Phone className={FIELD_ICON_CLASS} />}
            label={t.users.detail.phoneLabel}
          >
            {user.phone ?? t.common.none}
          </AdminDetailField>
          <AdminDetailField
            icon={<CalendarDays className={FIELD_ICON_CLASS} />}
            label={t.users.detail.createdLabel}
          >
            {user.createdAt.toISOString().slice(0, 10)}
          </AdminDetailField>
          <AdminDetailField
            icon={<CircleCheckBig className={FIELD_ICON_CLASS} />}
            label={t.common.status}
          >
            {status ? (
              <UpdateUserStatusForm
                locale={locale}
                userId={user.id}
                currentStatus={status}
                eligibleStatuses={eligibleStatuses}
                copy={t}
              />
            ) : (
              <span className="text-sm text-red-700">
                {t.users.detail.unknownStatus}
              </span>
            )}
          </AdminDetailField>
          <div className="md:col-span-2">
            <AdminDetailField
              icon={<Mail className={FIELD_ICON_CLASS} />}
              label={t.users.detail.emailLabel}
            >
              {user.email}
            </AdminDetailField>
          </div>
        </div>
      </Card>

      <AdminUserNoteForm
        locale={locale}
        userId={user.id}
        initialNote={user.adminNote}
        disabled={isAnonymized}
        copy={t}
      />

      <AdminUserBonuses
        locale={locale}
        summary={bonusSummary}
        copy={t.users.detail.bonuses}
        adminCopy={t}
      />

      <AdminUserGiftCards
        locale={locale}
        userId={user.id}
        userEmail={user.email}
        cards={giftCards}
        copy={t.users.detail.giftCards}
        adminCopy={t}
      />

      <AdminUserRecentOrders locale={locale} orders={recentOrders} copy={t} />
    </section>
  );
}
