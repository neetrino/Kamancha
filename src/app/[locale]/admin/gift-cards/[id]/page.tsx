import Link from "next/link";
import { notFound } from "next/navigation";

import { getGiftCardDetail } from "@/features/gift-cards/application/queries";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { formatMoneyAmount } from "@/lib/money/format";

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function AdminGiftCardDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const [card, dict] = await Promise.all([
    getGiftCardDetail(id),
    getDictionary(locale),
  ]);
  if (!card) {
    notFound();
  }

  const copy = dict.admin.giftCards;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{card.code}</h1>
          <p className="mt-1 text-sm text-gray-600">
            {copy.statuses[card.status] ?? card.status}
          </p>
        </div>
        <Link
          href={`/${locale}/admin/gift-cards`}
          className="text-sm text-gray-600 underline-offset-2 hover:underline"
        >
          {dict.admin.common.cancel}
        </Link>
      </div>

      <dl className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-gray-500">{copy.table.balance}</dt>
          <dd className="text-sm font-medium text-gray-900">
            {formatMoneyAmount(card.balanceAmount, "AMD", locale)} /{" "}
            {formatMoneyAmount(card.initialAmount, "AMD", locale)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">{copy.table.recipient}</dt>
          <dd className="text-sm text-gray-900">
            {card.recipientName} · {card.recipientEmail}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">{copy.table.purchaser}</dt>
          <dd className="text-sm text-gray-900">
            {card.purchaserName}
            {card.purchaserEmail ? ` · ${card.purchaserEmail}` : ""}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">{copy.drawer.expiresOptional}</dt>
          <dd className="text-sm text-gray-900">
            {card.expiresAt
              ? card.expiresAt.toISOString().slice(0, 10)
              : dict.admin.common.none}
          </dd>
        </div>
      </dl>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          {copy.history}
        </h2>
        {card.transactions.length === 0 ? (
          <p className="text-sm text-gray-600">{copy.empty}</p>
        ) : (
          <ul className="divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {card.transactions.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-gray-900">{row.type}</p>
                  <p className="text-xs text-gray-500">
                    {row.createdAt.toISOString().slice(0, 16).replace("T", " ")}{" "}
                    UTC
                  </p>
                </div>
                <p className="font-semibold text-gray-900">
                  {row.delta > 0 ? "+" : ""}
                  {formatMoneyAmount(row.delta, "AMD", locale)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
