"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

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
import { ADMIN_BADGE } from "@/features/admin/ui/status-badge";
import type {
  AdminContactListItem,
  AdminContactMessageDetail,
} from "@/features/contact/application/queries";
import { getAdminContactMessageDetailAction } from "@/features/contact/application/update-contact-status";
import { AdminMessageDetailSheet } from "@/features/contact/ui/AdminMessageDetailSheet";
import { contactStatusBadgeClass } from "@/features/contact/ui/contact-status-badge-class";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AdminMessagesViewProps = {
  locale: string;
  rows: AdminContactListItem[];
  copy: Dictionary["admin"];
};

export function AdminMessagesView({
  locale,
  rows,
  copy,
}: AdminMessagesViewProps) {
  const router = useRouter();
  const t = copy.messages;
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<AdminContactMessageDetail | null>(null);
  const [isDetailPending, startDetailTransition] = useTransition();

  function openDetail(id: string): void {
    setDetailOpen(true);
    setDetail(null);
    startDetailTransition(async () => {
      const message = await getAdminContactMessageDetailAction(locale, id);
      if (!message) {
        setDetailOpen(false);
        return;
      }
      setDetail(message);
    });
  }

  function closeDetail(): void {
    setDetailOpen(false);
    setDetail(null);
  }

  function refreshDetail(): void {
    if (!detail) {
      router.refresh();
      return;
    }
    startDetailTransition(async () => {
      const message = await getAdminContactMessageDetailAction(locale, detail.id);
      if (message) {
        setDetail(message);
      }
      router.refresh();
    });
  }

  return (
    <>
      <Card className={ADMIN_TABLE_CARD}>
        {rows.length === 0 ? (
          <p className={`${ADMIN_TABLE_STATE_INSET} text-sm text-gray-600`}>
            {t.empty}
          </p>
        ) : (
          <div className={ADMIN_TABLE_OUTER_SCROLL}>
            <table className={ADMIN_TABLE}>
              <thead className={ADMIN_TABLE_THEAD}>
                <tr>
                  <th className={ADMIN_TABLE_TH}>{t.table.subject}</th>
                  <th className={ADMIN_TABLE_TH}>{t.table.from}</th>
                  <th className={ADMIN_TABLE_TH_CENTER}>{t.table.status}</th>
                  <th className={ADMIN_TABLE_TH}>{t.table.received}</th>
                </tr>
              </thead>
              <tbody className={ADMIN_TABLE_TBODY}>
                {rows.map((message) => (
                  <tr
                    key={message.id}
                    className={`${ADMIN_TABLE_ROW} cursor-pointer`}
                    onClick={() => openDetail(message.id)}
                  >
                    <td className={ADMIN_TABLE_TD}>
                      <span className="font-medium text-gray-900">
                        {message.subject}
                      </span>
                    </td>
                    <td className={ADMIN_TABLE_TD}>
                      <p className="text-sm text-gray-900">{message.name}</p>
                      <p className="text-xs text-gray-500">{message.email}</p>
                    </td>
                    <td className={ADMIN_TABLE_TD_CENTER}>
                      <span
                        className={`${ADMIN_BADGE} ${contactStatusBadgeClass(message.status)}`}
                      >
                        {message.status}
                      </span>
                      {message.spamScore !== null ? (
                        <p className="mt-1 text-xs text-gray-500">
                          {t.table.spamScore.replace(
                            "{score}",
                            String(message.spamScore),
                          )}
                        </p>
                      ) : null}
                    </td>
                    <td className={ADMIN_TABLE_TD}>
                      <span className="text-xs text-gray-500">
                        {message.createdAt
                          .toISOString()
                          .slice(0, 16)
                          .replace("T", " ")}{" "}
                        {copy.common.utc}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AdminMessageDetailSheet
        open={detailOpen}
        onClose={closeDetail}
        message={detail}
        isLoading={isDetailPending}
        locale={locale}
        copy={copy}
        onStatusUpdated={refreshDetail}
      />
    </>
  );
}
