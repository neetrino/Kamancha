import { notFound } from "next/navigation";

import { AppLink } from "@/components/ui/AppLink";
import { getProfileDashboard } from "@/features/profile/application/dashboard-queries";
import { ProfileStatCard } from "@/features/profile/ui/ProfileStatCard";
import {
  PROFILE_LINK,
  PROFILE_PAGE_SUBTITLE,
  PROFILE_PAGE_TITLE,
  PROFILE_SECTION,
  PROFILE_SECTION_TITLE,
} from "@/features/profile/ui/profile-surface";
import { requireUser } from "@/lib/auth/policies";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { formatMoneyAmount } from "@/lib/money/format";

type ProfilePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const user = await requireUser(locale);
  const dictionary = getDictionary(locale);
  const { stats, recentOrders } = await getProfileDashboard(user.id);

  return (
    <section className="profile-sheet-keep-frame space-y-8">
      <div>
        <h1 className={PROFILE_PAGE_TITLE}>{dictionary.profile.dashboard}</h1>
        <p className={PROFILE_PAGE_SUBTITLE}>
          {dictionary.profile.welcome}, {user.firstName}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <ProfileStatCard
          label={dictionary.profile.totalOrders}
          value={String(stats.totalOrders)}
        />
        <ProfileStatCard
          label={dictionary.profile.pendingOrders}
          value={String(stats.pendingOrders)}
        />
        <ProfileStatCard
          label={dictionary.profile.completedOrders}
          value={String(stats.completedOrders)}
        />
        <ProfileStatCard
          label={dictionary.profile.totalSpent}
          value={formatMoneyAmount(stats.totalSpent, "AMD", locale)}
        />
      </div>

      <div className={PROFILE_SECTION}>
        <div className="relative z-[2] mb-5 flex items-center justify-between gap-3">
          <h2 className={PROFILE_SECTION_TITLE}>
            {dictionary.profile.recentOrders}
          </h2>
          <AppLink
            href={`/${locale}/profile/orders`}
            prefetchPolicy="intent"
            className={PROFILE_LINK}
          >
            {dictionary.profile.viewAllOrders}
          </AppLink>
        </div>

        {recentOrders.length === 0 ? (
          <p className="relative z-[2] text-sm text-gray-700">
            {dictionary.profile.noOrders}
          </p>
        ) : (
          <ul className="relative z-[2] divide-y divide-white/35">
            {recentOrders.map((order) => (
              <li
                key={order.id}
                className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {dictionary.profile.orderNumber} {order.orderNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    {dictionary.profile.status}: {order.status}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {formatMoneyAmount(order.totalAmount, "AMD", locale)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
