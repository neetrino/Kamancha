import { notFound } from "next/navigation";

import { AdminPagination } from "@/features/admin/ui/AdminPagination";
import { listAdminPromotions } from "@/features/promotions/application/queries";
import { adminPromotionsFilterSchema } from "@/features/promotions/schemas/admin-promotions";
import { AdminCouponsView } from "@/features/promotions/ui/AdminCouponsView";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AdminCouponsPageProps = {
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

export default async function AdminCouponsPage({
  params,
  searchParams,
}: AdminCouponsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const raw = await searchParams;
  const parsed = adminPromotionsFilterSchema.safeParse({
    kind: "COUPON",
    q: firstParam(raw.q) || undefined,
    active: firstParam(raw.active) || undefined,
    page: firstParam(raw.page) ?? "1",
  });

  const filters = parsed.success
    ? parsed.data
    : {
        kind: "COUPON" as const,
        page: 1 as const,
        q: undefined,
        active: undefined,
      };

  const [{ rows, total, pageSize }, dict] = await Promise.all([
    listAdminPromotions(filters),
    getDictionary(locale),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <AdminCouponsView
        locale={locale}
        coupons={rows}
        copy={{
          coupons: dict.admin.coupons,
          common: dict.admin.common,
          confirm: dict.admin.confirm,
        }}
      />
      <AdminPagination
        page={filters.page}
        totalPages={totalPages}
        ariaLabel={dict.admin.coupons.title}
        previousLabel={dict.admin.common.previous}
        nextLabel={dict.admin.common.next}
        pageOfLabel={dict.admin.common.pageOf}
        prevHref={`/${locale}/admin/coupons?page=${filters.page - 1}`}
        nextHref={`/${locale}/admin/coupons?page=${filters.page + 1}`}
      />
    </>
  );
}
