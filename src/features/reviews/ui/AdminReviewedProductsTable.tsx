import Image from "next/image";
import Link from "next/link";

import { Card } from "@/components/ui/Card";
import {
  ADMIN_TABLE,
  ADMIN_TABLE_CARD,
  ADMIN_TABLE_OUTER_SCROLL,
  ADMIN_TABLE_ROW,
  ADMIN_TABLE_STATE_INSET,
  ADMIN_TABLE_TBODY,
  ADMIN_TABLE_TD,
  ADMIN_TABLE_TD_CENTER,
  ADMIN_TABLE_TH,
  ADMIN_TABLE_TH_CENTER,
  ADMIN_TABLE_THEAD,
} from "@/features/admin/ui/admin-table-classes";
import type { AdminReviewedProduct } from "@/features/reviews/application/admin-queries";
import { AdminReviewStars } from "@/features/reviews/ui/AdminReviewStars";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AdminReviewedProductsTableProps = {
  locale: string;
  rows: AdminReviewedProduct[];
  copy: Dictionary["admin"];
};

function formatUtc(date: Date | null, utc: string, none: string): string {
  return date ? `${date.toISOString().slice(0, 16).replace("T", " ")} ${utc}` : none;
}

export function AdminReviewedProductsTable({
  locale,
  rows,
  copy,
}: AdminReviewedProductsTableProps) {
  const t = copy.reviews;

  if (rows.length === 0) {
    return (
      <Card className={ADMIN_TABLE_CARD}>
        <p className={`${ADMIN_TABLE_STATE_INSET} text-sm text-gray-600`}>{t.empty}</p>
      </Card>
    );
  }

  return (
    <Card className={ADMIN_TABLE_CARD}>
      <div className={ADMIN_TABLE_OUTER_SCROLL}>
        <table className={ADMIN_TABLE}>
          <thead className={ADMIN_TABLE_THEAD}>
            <tr>
              <th className={ADMIN_TABLE_TH}>{t.table.product}</th>
              <th className={ADMIN_TABLE_TH_CENTER}>{t.table.rating}</th>
              <th className={ADMIN_TABLE_TH_CENTER}>{t.table.reviews}</th>
              <th className={ADMIN_TABLE_TH}>{t.table.lastReview}</th>
            </tr>
          </thead>
          <tbody className={ADMIN_TABLE_TBODY}>
            {rows.map((row) => (
              <tr key={row.productId} className={ADMIN_TABLE_ROW}>
                <td className={ADMIN_TABLE_TD}>
                  <Link
                    href={`/${locale}/admin/reviews/${row.productId}`}
                    className="flex min-w-[200px] items-center gap-3"
                  >
                    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100">
                      {row.imageUrl ? (
                        <Image src={row.imageUrl} alt="" fill unoptimized className="object-cover" />
                      ) : (
                        <span className="text-[10px] text-gray-400">{copy.common.na}</span>
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-gray-900 hover:underline">
                        {row.title}
                      </span>
                      <span className="block truncate text-xs text-gray-500">{row.sku}</span>
                    </span>
                  </Link>
                </td>
                <td className={ADMIN_TABLE_TD_CENTER}>
                  {row.averageRating == null ? (
                    copy.common.none
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <AdminReviewStars
                        rating={row.averageRating}
                        ariaLabel={t.ratingAria.replace("{rating}", String(row.averageRating))}
                      />
                      <span className="text-gray-700">{row.averageRating}</span>
                    </span>
                  )}
                </td>
                <td className={ADMIN_TABLE_TD_CENTER}>{row.reviewCount}</td>
                <td className={ADMIN_TABLE_TD}>
                  <span className="text-xs text-gray-500">
                    {formatUtc(row.lastReviewAt, copy.common.utc, copy.common.none)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
