"use client";

import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  listOrderOperatorNotesAction,
  type OrderOperatorNotesResult,
} from "@/features/orders/application/list-order-notes";
import { AddOrderNoteForm } from "@/features/orders/ui/AddOrderNoteForm";
import { OrderOperatorNotesList } from "@/features/orders/ui/OrderOperatorNotesList";
import { PROFILE_INNER_CARD } from "@/features/profile/ui/profile-surface";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AdminOrderSheetNotesProps = {
  locale: string;
  orderNumber: string;
  copy: Dictionary["admin"];
};

/** Operator notes section inside the admin order details drawer. */
export function AdminOrderSheetNotes({
  locale,
  orderNumber,
  copy,
}: AdminOrderSheetNotesProps) {
  const labels = copy.orders.notes;
  const loadFailedLabel = labels.loadFailed;
  const [data, setData] = useState<OrderOperatorNotesResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(true);

  const applyResult = useCallback(
    (result: Awaited<ReturnType<typeof listOrderOperatorNotesAction>>): void => {
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setError(null);
      setData(result.value);
    },
    [],
  );

  const reload = useCallback(async (): Promise<void> => {
    applyResult(await listOrderOperatorNotesAction(locale, orderNumber));
  }, [applyResult, locale, orderNumber]);

  useEffect(() => {
    let cancelled = false;
    listOrderOperatorNotesAction(locale, orderNumber)
      .then((result) => {
        if (!cancelled) {
          applyResult(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(loadFailedLabel);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [applyResult, loadFailedLabel, locale, orderNumber]);

  return (
    <section className={`${PROFILE_INNER_CARD} space-y-3 p-4`}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-start gap-3 text-left"
      >
        <span className="min-w-0 flex-1 font-big-fat-boii text-sm font-normal tracking-wide text-gray-900 uppercase">
          {labels.title}
        </span>
        <ChevronDown
          className={`mt-0.5 h-4 w-4 shrink-0 text-gray-500 transition-transform ${open ? "" : "-rotate-90"}`}
          aria-hidden
        />
      </button>
      {open ? (
        <>
          <AddOrderNoteForm
            locale={locale}
            orderNumber={orderNumber}
            copy={copy}
            onAdded={reload}
          />
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          {data ? (
            <OrderOperatorNotesList
              notes={data.notes}
              emptyLabel=""
              locale={locale}
              deleteLabel={copy.common.delete}
              deleteFailedLabel={labels.deleteFailed}
              confirm={copy.confirm}
              onDeleted={(noteId) =>
                setData((current) =>
                  current
                    ? {
                        ...current,
                        notes: current.notes.filter((note) => note.id !== noteId),
                      }
                    : current,
                )
              }
            />
          ) : null}
        </>
      ) : null}
    </section>
  );
}
