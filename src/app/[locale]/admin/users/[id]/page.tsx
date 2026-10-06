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
import { listUserOrderOperatorNotes } from "@/features/orders/application/operator-notes";
import { getAdminUserById } from "@/features/users/application/queries";
import {
  getEligibleUserStatuses,
  isUserRole,
  isUserStatus,
} from "@/features/users/domain/user-lifecycle";
import { AdminUserBonuses } from "@/features/users/ui/AdminUserBonuses";
import { AdminUserCoupons } from "@/features/users/ui/AdminUserCoupons";
import { AdminUserGiftCards } from "@/features/users/ui/AdminUserGiftCards";
import { AdminUserHistoryTabs } from "@/features/users/ui/AdminUserHistoryTabs";
import { AdminUserNoteForm } from "@/features/users/ui/AdminUserNoteForm";
import { AdminUserOrderNotes } from "@/features/users/ui/AdminUserOrderNotes";
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
  const orderNotes = await listUserOrderOperatorNotes(detail.user.id);

  const { user, recentOrders, bonusSummary, giftCards, coupons } = detail;
  const role = isUserRole(user.role) ? user.role : null;
  const status = isUserStatus(user.status) ? user.status : null;
  const eligibleStatuses = status ? getEligibleUserStatuses(status) : [];
  const isAnonymized = status === "ANONYMIZED";

  return (
    <section>
      <div className="-mt-6 mb-6">
        <Link
          href={`/${locale}/admin/users`}
          className="mb-6 inline-flex h-11 items-center gap-1.5 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          {t.common.back}
        </Link>
        <h1 className={ADMIN_PAGE_TITLE}>
          {user.firstName} {user.lastName}
        </h1>
      </div>

      <div className="mb-4 grid gap-4 xl:grid-cols-2">
      <Card className="h-full p-5 sm:p-6">
        <div className="grid gap-4">
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
          <AdminDetailField
            icon={<Mail className={FIELD_ICON_CLASS} />}
            label={t.users.detail.emailLabel}
          >
            {user.email}
          </AdminDetailField>
          <AdminDetailField
            icon={<CalendarDays className={FIELD_ICON_CLASS} />}
            label={t.users.detail.createdLabel}
          >
            {user.createdAt.toISOString().slice(0, 10)}
          </AdminDetailField>
        </div>
      </Card>

      <AdminUserNoteForm
        locale={locale}
        userId={user.id}
        initialNote={user.adminNote}
        disabled={isAnonymized}
        copy={t}
      />
      </div>

      <AdminUserOrderNotes locale={locale} notes={orderNotes} copy={t} />

      <AdminUserHistoryTabs
        ariaLabel={t.users.detail.tabs.aria}
        labels={{
          orders: t.users.detail.tabs.orders,
          bonuses: t.users.detail.tabs.bonuses,
          gifts: t.users.detail.tabs.gifts,
          coupons: t.users.detail.tabs.coupons,
        }}
        panels={{
          orders: (
            <AdminUserRecentOrders
              locale={locale}
              orders={recentOrders}
              copy={t}
            />
          ),
          bonuses: (
            <AdminUserBonuses
              locale={locale}
              summary={bonusSummary}
              copy={t.users.detail.bonuses}
              adminCopy={t}
            />
          ),
          gifts: (
            <AdminUserGiftCards
              locale={locale}
              userId={user.id}
              userEmail={user.email}
              cards={giftCards}
              copy={t.users.detail.giftCards}
              adminCopy={t}
            />
          ),
          coupons: (
            <AdminUserCoupons
              locale={locale}
              coupons={coupons}
              copy={t.users.detail.coupons}
              adminCopy={t}
            />
          ),
        }}
      />
    </section>
  );
}
