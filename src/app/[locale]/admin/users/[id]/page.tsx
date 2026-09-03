import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  ChevronLeft,
  CircleCheckBig,
  LogIn,
  Mail,
  MailCheck,
  Phone,
  Shield,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { AdminDetailField } from "@/features/admin/ui/AdminDetailField";
import { ADMIN_PAGE_TITLE } from "@/features/admin/ui/admin-form-classes";
import { ADMIN_BADGE } from "@/features/admin/ui/status-badge";
import { getAdminUserById } from "@/features/users/application/queries";
import {
  getEligibleUserStatuses,
  isUserRole,
  isUserStatus,
} from "@/features/users/domain/user-lifecycle";
import { AdminUserBonuses } from "@/features/users/ui/AdminUserBonuses";
import { AdminUserGiftCards } from "@/features/users/ui/AdminUserGiftCards";
import { AdminUserRecentOrders } from "@/features/users/ui/AdminUserRecentOrders";
import { UpdateUserRoleForm } from "@/features/users/ui/UpdateUserRoleForm";
import { UpdateUserStatusForm } from "@/features/users/ui/UpdateUserStatusForm";
import { userRoleLabel, userStatusLabel } from "@/features/users/ui/user-labels";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AdminUserDetailPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

function userStatusBadgeClass(status: string): string {
  const normalized = status.toUpperCase();
  if (normalized === "ACTIVE") return "bg-green-100 text-green-800";
  if (normalized === "PENDING" || normalized === "INVITED") {
    return "bg-yellow-100 text-yellow-800";
  }
  if (
    normalized === "SUSPENDED" ||
    normalized === "BANNED" ||
    normalized === "ANONYMIZED"
  ) {
    return "bg-red-100 text-red-800";
  }
  return "bg-gray-100 text-gray-800";
}

const FIELD_ICON_CLASS = "h-4 w-4";

function userRoleBadgeClass(role: string): string {
  return role.toUpperCase() === "ADMIN"
    ? "bg-blue-100 text-blue-800"
    : "bg-gray-100 text-gray-800";
}

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
        <div className="grid gap-4 md:grid-cols-2 md:gap-x-10">
          <AdminDetailField
            icon={<Shield className={FIELD_ICON_CLASS} />}
            label={t.users.detail.roleLabel}
          >
            <span
              className={`${ADMIN_BADGE} ${userRoleBadgeClass(user.role)}`}
            >
              {userRoleLabel(user.role, t.users.roleLabels)}
            </span>
          </AdminDetailField>
          <AdminDetailField
            icon={<CircleCheckBig className={FIELD_ICON_CLASS} />}
            label={t.common.status}
          >
            <span
              className={`${ADMIN_BADGE} ${userStatusBadgeClass(user.status)}`}
            >
              {userStatusLabel(user.status, t.users.statusLabels)}
            </span>
          </AdminDetailField>
          <AdminDetailField
            icon={<Mail className={FIELD_ICON_CLASS} />}
            label={t.users.detail.emailLabel}
          >
            {user.email}
          </AdminDetailField>
          <AdminDetailField
            icon={<Phone className={FIELD_ICON_CLASS} />}
            label={t.users.detail.phoneLabel}
          >
            {user.phone ?? t.common.none}
          </AdminDetailField>
          <AdminDetailField
            icon={<MailCheck className={FIELD_ICON_CLASS} />}
            label={t.users.detail.emailVerifiedLabel}
          >
            {user.emailVerifiedAt
              ? user.emailVerifiedAt.toISOString().slice(0, 10)
              : t.users.detail.emailVerifiedNo}
          </AdminDetailField>
          <AdminDetailField
            icon={<LogIn className={FIELD_ICON_CLASS} />}
            label={t.users.detail.lastLoginLabel}
          >
            {user.lastLoginAt
              ? `${user.lastLoginAt.toISOString().slice(0, 16).replace("T", " ")} ${t.common.utc}`
              : t.users.detail.lastLoginNever}
          </AdminDetailField>
          <AdminDetailField
            icon={<CalendarDays className={FIELD_ICON_CLASS} />}
            label={t.users.detail.createdLabel}
          >
            {user.createdAt.toISOString().slice(0, 10)}
          </AdminDetailField>
        </div>
      </Card>

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-stretch">
        {role ? (
          <UpdateUserRoleForm
            locale={locale}
            userId={user.id}
            currentRole={role}
            disabled={isAnonymized}
            copy={t}
          />
        ) : (
          <p className="text-sm text-red-700">{t.users.detail.unknownRole}</p>
        )}
        {status ? (
          <UpdateUserStatusForm
            locale={locale}
            userId={user.id}
            currentStatus={status}
            eligibleStatuses={eligibleStatuses}
            copy={t}
          />
        ) : (
          <p className="text-sm text-red-700">{t.users.detail.unknownStatus}</p>
        )}
      </div>

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
