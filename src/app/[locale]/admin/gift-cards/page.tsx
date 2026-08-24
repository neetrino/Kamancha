import Link from "next/link";
import { notFound } from "next/navigation";

import { listAdminGiftCards } from "@/features/gift-cards/application/queries";
import { AdminGiftCardsView } from "@/features/gift-cards/ui/AdminGiftCardsView";
import { getStoreGiftCardSettings } from "@/features/settings/application/queries";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export default async function AdminGiftCardsPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const raw = await searchParams;
  const q = firstParam(raw.q);
  const page = Math.max(1, Number(firstParam(raw.page) ?? "1") || 1);
  const pageSize = 50;
  const [{ items, total }, settings, dict] = await Promise.all([
    listAdminGiftCards({
      q,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    }),
    getStoreGiftCardSettings(),
    getDictionary(locale),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <AdminGiftCardsView
        locale={locale}
        cards={items}
        presets={settings.presets}
        q={q}
        copy={{
          giftCards: dict.admin.giftCards,
          common: dict.admin.common,
        }}
      />
      {totalPages > 1 ? (
        <nav className="mt-4 flex items-center gap-3 text-sm text-gray-700">
          {page > 1 ? (
            <Link
              href={`/${locale}/admin/gift-cards?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className="font-medium hover:underline"
            >
              {dict.admin.common.previous}
            </Link>
          ) : null}
          <span>
            {dict.admin.common.pageOf
              .replace("{page}", String(page))
              .replace("{totalPages}", String(totalPages))}
          </span>
          {page < totalPages ? (
            <Link
              href={`/${locale}/admin/gift-cards?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className="font-medium hover:underline"
            >
              {dict.admin.common.next}
            </Link>
          ) : null}
        </nav>
      ) : null}
    </>
  );
}
