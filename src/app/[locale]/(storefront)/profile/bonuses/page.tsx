import { notFound, redirect } from "next/navigation";

import { AppLink } from "@/components/ui/AppLink";
import { getCustomerBonusSummary } from "@/features/bonuses/application/queries";
import { ProfileStatCard } from "@/features/profile/ui/ProfileStatCard";
import {
  PROFILE_BODY,
  PROFILE_INNER_CARD,
  PROFILE_LINK,
  PROFILE_PAGE_TITLE,
  PROFILE_SECTION,
  PROFILE_SECTION_TITLE,
} from "@/features/profile/ui/profile-surface";
import { getCurrentUser } from "@/lib/auth/session";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { formatMoneyAmount } from "@/lib/money/format";

type ProfileBonusesPageProps = {
  params: Promise<{ locale: string }>;
};

function typeLabel(type: string, labels: Record<string, string>): string {
  return labels[type] ?? type;
}

export default async function ProfileBonusesPage({
  params,
}: ProfileBonusesPageProps) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) {
    notFound();
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${rawLocale}/login`);
  }

  const dictionary = getDictionary(rawLocale);
  const copy = dictionary.profile.bonusesPage;
  const summary = await getCustomerBonusSummary(user.id);

  return (
    <section className="profile-sheet-keep-frame space-y-8">
      <h1 className={PROFILE_PAGE_TITLE}>{dictionary.profile.bonuses}</h1>

      <div className="grid grid-cols-1 gap-3 overflow-visible sm:grid-cols-3 sm:gap-4">
        <ProfileStatCard
          label={copy.available}
          value={formatMoneyAmount(summary.availableBalance, "AMD", rawLocale)}
        />
        <ProfileStatCard
          label={copy.totalEarned}
          value={formatMoneyAmount(summary.totalEarned, "AMD", rawLocale)}
        />
        <ProfileStatCard
          label={copy.totalRedeemed}
          value={formatMoneyAmount(summary.totalRedeemed, "AMD", rawLocale)}
        />
      </div>

      <div className={PROFILE_SECTION}>
        <div className="relative z-[2] mb-6 border-b border-gray-100 pb-5 sm:mb-8 sm:pb-6 lg:border-white/35">
          <h2 className={PROFILE_SECTION_TITLE}>{copy.history}</h2>
        </div>

        {summary.transactions.length === 0 ? (
          <p className={PROFILE_BODY}>{copy.empty}</p>
        ) : (
          <ul className="relative z-[2] space-y-3">
            {summary.transactions.map((row) => {
              const positive = row.delta > 0;
              return (
                <li
                  key={row.id}
                  className={`${PROFILE_INNER_CARD} flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5`}
                >
                  <div className="min-w-0 space-y-1">
                    <p className="font-big-fat-boii text-sm font-normal tracking-wide text-gray-900 uppercase">
                      {typeLabel(row.type, copy.types)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {row.createdAt.toISOString().slice(0, 16).replace("T", " ")}{" "}
                      UTC
                      {row.orderNumber ? (
                        <>
                          {" · "}
                          <AppLink
                            href={`/${rawLocale}/profile/orders`}
                            className={PROFILE_LINK}
                          >
                            {copy.order} {row.orderNumber}
                          </AppLink>
                        </>
                      ) : null}
                    </p>
                    {row.type === "EARN" ? (
                      <p className="text-xs text-gray-500">
                        {row.expiresAt
                          ? copy.expires.replace(
                              "{date}",
                              row.expiresAt.toISOString().slice(0, 10),
                            )
                          : copy.noExpiry}
                      </p>
                    ) : null}
                  </div>
                  <p
                    className={
                      positive
                        ? "font-big-fat-boii text-base font-normal tracking-wide text-brand-forest"
                        : "font-big-fat-boii text-base font-normal tracking-wide text-gray-900"
                    }
                  >
                    {positive ? "+" : ""}
                    {formatMoneyAmount(row.delta, "AMD", rawLocale)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
