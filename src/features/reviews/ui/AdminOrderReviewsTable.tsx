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
  ADMIN_TABLE_TH,
  ADMIN_TABLE_THEAD,
} from "@/features/admin/ui/admin-table-classes";
import type { AdminOrderReview } from "@/features/reviews/application/admin-queries";
import { AdminReviewStars } from "@/features/reviews/ui/AdminReviewStars";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AdminOrderReviewsTableProps = {
  locale: string;
  rows: AdminOrderReview[];
  copy: Dictionary["admin"];
};

function formatUtc(date: Date | null, utc: string, none: string): string {
  return date ? `${date.toISOString().slice(0, 16).replace("T", " ")} ${utc}` : none;
}

export function AdminOrderReviewsTable({
  locale,
  rows,
  copy,
}: AdminOrderReviewsTableProps) {
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
              <th className={ADMIN_TABLE_TH}>{t.table.order}</th>
              <th className={ADMIN_TABLE_TH}>{t.table.rating}</th>
              <th className={ADMIN_TABLE_TH}>{t.table.comment}</th>
              <th className={ADMIN_TABLE_TH}>{t.table.author}</th>
              <th className={ADMIN_TABLE_TH}>{t.table.submittedAt}</th>
            </tr>
          </thead>
          <tbody className={ADMIN_TABLE_TBODY}>
            {rows.map((row) => (
              <tr key={row.orderId} className={ADMIN_TABLE_ROW}>
                <td className={ADMIN_TABLE_TD}>
                  <Link
                    href={`/${locale}/admin/orders/${row.orderNumber}`}
                    className="font-medium text-brand-forest hover:underline"
                  >
                    {t.table.orderNumber.replace("{orderNumber}", row.orderNumber)}
                  </Link>
                </td>
                <td className={ADMIN_TABLE_TD}>
                  <span className="inline-flex items-center gap-2">
                    <AdminReviewStars
                      rating={row.rating}
                      ariaLabel={t.ratingAria.replace("{rating}", String(row.rating))}
                    />
                    <span className="text-gray-700">{row.rating}</span>
                  </span>
                </td>
                <td className={ADMIN_TABLE_TD}>
                  <p className="max-w-md whitespace-pre-wrap text-sm text-gray-700">
                    {row.comment?.trim() ? row.comment : t.noComment}
                  </p>
                </td>
                <td className={ADMIN_TABLE_TD}>
                  <span className="block font-medium text-gray-900">{row.authorName}</span>
                  <span className="block text-xs text-gray-500">{row.authorEmail}</span>
                </td>
                <td className={ADMIN_TABLE_TD}>
                  <span className="text-xs text-gray-500">
                    {formatUtc(row.createdAt, copy.common.utc, copy.common.none)}
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
