import { notFound, redirect } from "next/navigation";

import { getCustomerBonusSummary } from "@/features/bonuses/application/queries";
import { ProfileBonusesView } from "@/features/profile/ui/ProfileBonusesView";
import { getCurrentUser } from "@/lib/auth/session";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type ProfileBonusesPageProps = {
  params: Promise<{ locale: string }>;
};

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
    <ProfileBonusesView
      locale={rawLocale}
      title={dictionary.profile.bonuses}
      titleShort={dictionary.profile.bonusesLabel}
      availableBalance={summary.availableBalance}
      totalEarned={summary.totalEarned}
      totalRedeemed={summary.totalRedeemed}
      transactions={summary.transactions.map((row) => ({
        id: row.id,
        type: row.type,
        delta: row.delta,
        expiresAt: row.expiresAt?.toISOString() ?? null,
        createdAt: row.createdAt.toISOString(),
        orderNumber: row.orderNumber,
      }))}
      copy={copy}
      adminCopy={dictionary.admin}
    />
  );
}
