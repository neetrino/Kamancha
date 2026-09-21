"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AdminSearchInput } from "@/features/admin/ui/AdminSearchInput";
import { ADMIN_PAGE_TITLE } from "@/features/admin/ui/admin-form-classes";
import {
  AdminSortableGrip,
  AdminSortableRoot,
  moveItemById,
  useAdminSortableItem,
} from "@/features/admin/ui/admin-sortable";
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
import {
  deleteCategoryAction,
  reorderCategoriesAction,
} from "@/features/categories/actions";
import type { AdminCategoryListItem } from "@/features/categories/application/list-admin-categories";
import { AddCategoryDrawer } from "@/features/categories/ui/AddCategoryDrawer";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { scheduleStateUpdate } from "@/lib/react/schedule-after-paint";

type CategoriesViewCopy = {
  categories: Dictionary["admin"]["categories"];
  common: Dictionary["admin"]["common"];
  confirm: Dictionary["admin"]["confirm"];
};

type AdminCategoriesViewProps = {
  locale: string;
  categories: AdminCategoryListItem[];
  copy: CategoriesViewCopy;
};

function sameOrder(
  left: AdminCategoryListItem[],
  right: AdminCategoryListItem[],
): boolean {
  if (left.length !== right.length) return false;
  return left.every((item, index) => item.id === right[index]?.id);
}

type CategoryRowProps = {
  category: AdminCategoryListItem;
  disabled: boolean;
  isPending: boolean;
  copy: CategoriesViewCopy;
  onEdit: (category: AdminCategoryListItem) => void;
  onDelete: (categoryId: string, categoryTitle: string) => void;
};

function CategorySortableRow({
  category,
  disabled,
  isPending,
  copy,
  onEdit,
  onDelete,
}: CategoryRowProps) {
  const { setNodeRef, style, isDragging, attributes, listeners } =
    useAdminSortableItem(category.id, disabled);

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`${ADMIN_TABLE_ROW} ${
        isDragging ? "relative z-10 bg-gray-50 opacity-70 shadow-md" : ""
      }`}
    >
      <td className={ADMIN_TABLE_TD}>
        <AdminSortableGrip
          label={copy.categories.reorderItemAria.replace(
            "{title}",
            category.title,
          )}
          disabled={disabled}
          attributes={attributes}
          listeners={listeners}
        />
      </td>
      <td className={ADMIN_TABLE_TD}>
        <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded border border-dashed border-gray-300 bg-gray-50">
          {category.imageUrl ? (
            <Image
              src={category.imageUrl}
              alt=""
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </div>
      </td>
      <td className={ADMIN_TABLE_TD}>
        <p className="font-medium text-gray-900">{category.title}</p>
      </td>
      <td className={ADMIN_TABLE_TD}>
        <span className="text-sm text-gray-500">
          {category.parentTitle ?? copy.categories.noneRootCategory}
        </span>
      </td>
      <td className={ADMIN_TABLE_TD_CENTER}>
        <div className="inline-flex items-center justify-center gap-1">
          <button
            type="button"
            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            aria-label={copy.categories.editAria.replace(
              "{title}",
              category.title,
            )}
            onClick={() => onEdit(category)}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => onDelete(category.id, category.title)}
            className="rounded p-1.5 text-red-600 hover:bg-red-50"
            aria-label={copy.categories.deleteAria.replace(
              "{title}",
              category.title,
            )}
          >
            <Trash2 className="h-4 w-4" />
          </button>
          {category.childCount > 0 ? (
            <span
              className="ml-1 text-gray-400"
              aria-label={copy.categories.subcategoriesAria.replace(
                "{count}",
                String(category.childCount),
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </span>
          ) : null}
        </div>
      </td>
    </tr>
  );
}

export function AdminCategoriesView({
  locale,
  categories,
  copy,
}: AdminCategoriesViewProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<AdminCategoryListItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [ordered, setOrdered] = useState(categories);

  useEffect(() => {
    scheduleStateUpdate(setOrdered, categories);
  }, [categories]);

  const needle = query.trim().toLowerCase();
  const isFiltering = needle.length > 0;
  const reorderDisabled = isFiltering || isPending;

  const visible = useMemo(() => {
    if (!isFiltering) return ordered;
    return ordered.filter((category) =>
      category.title.toLowerCase().includes(needle),
    );
  }, [ordered, isFiltering, needle]);

  function requestDelete(categoryId: string, categoryTitle: string): void {
    setPendingDelete({ id: categoryId, title: categoryTitle });
  }

  function confirmDelete(): void {
    if (!pendingDelete) return;
    const categoryId = pendingDelete.id;

    startTransition(async () => {
      setError(null);
      const result = await deleteCategoryAction(locale, categoryId);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setPendingDelete(null);
      router.refresh();
    });
  }

  function handleReorder(activeId: string, overId: string): void {
    if (reorderDisabled) return;
    const previous = ordered;
    const next = moveItemById(ordered, activeId, overId);
    if (sameOrder(previous, next)) return;

    setOrdered(next);
    startTransition(async () => {
      setError(null);
      const result = await reorderCategoriesAction(locale, {
        orderedIds: next.map((category) => category.id),
      });
      if (!result.ok) {
        setOrdered(previous);
        setError(result.error.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <section>
      <div className="mb-6">
        <h1 className={ADMIN_PAGE_TITLE}>{copy.categories.title}</h1>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <AdminSearchInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={copy.categories.searchPlaceholder}
          className="min-w-0 flex-1"
          aria-label={copy.categories.searchAria}
        />
        <Button
          type="button"
          size="field"
          onClick={() => {
            setEditingCategory(null);
            setDrawerOpen(true);
          }}
          className="shrink-0 gap-1.5 rounded-2xl"
        >
          <Plus className="h-4 w-4" aria-hidden />
          {copy.categories.addCategory}
        </Button>
      </div>

      {isFiltering ? (
        <p className="mb-3 text-xs text-gray-500">
          {copy.categories.clearSearchToReorder}
        </p>
      ) : null}

      {error ? <p className="mb-3 text-sm text-red-700">{error}</p> : null}

      <Card className={ADMIN_TABLE_CARD}>
        {visible.length === 0 ? (
          <p className={`${ADMIN_TABLE_STATE_INSET} text-sm text-gray-600`}>
            {categories.length === 0
              ? copy.categories.empty
              : copy.categories.noMatch}
          </p>
        ) : (
          <div className={ADMIN_TABLE_OUTER_SCROLL}>
            <AdminSortableRoot
              items={visible.map((category) => category.id)}
              disabled={reorderDisabled}
              onReorder={handleReorder}
            >
              <table className={ADMIN_TABLE}>
                <thead className={ADMIN_TABLE_THEAD}>
                  <tr>
                    <th
                      className={`${ADMIN_TABLE_TH} w-8`}
                      aria-label={copy.categories.reorderAria}
                    />
                    <th className={ADMIN_TABLE_TH}>{copy.categories.image}</th>
                    <th className={ADMIN_TABLE_TH}>
                      {copy.categories.categoryTitle}
                    </th>
                    <th className={ADMIN_TABLE_TH}>
                      {copy.categories.category}
                    </th>
                    <th className={ADMIN_TABLE_TH_CENTER}>
                      {copy.common.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className={ADMIN_TABLE_TBODY}>
                  {visible.map((category) => (
                    <CategorySortableRow
                      key={category.id}
                      category={category}
                      disabled={reorderDisabled}
                      isPending={isPending}
                      copy={copy}
                      onEdit={(item) => {
                        setEditingCategory(item);
                        setDrawerOpen(true);
                      }}
                      onDelete={requestDelete}
                    />
                  ))}
                </tbody>
              </table>
            </AdminSortableRoot>
          </div>
        )}
      </Card>

      <AddCategoryDrawer
        locale={locale}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingCategory(null);
        }}
        categories={categories}
        category={editingCategory}
        copy={{
          drawer: copy.categories.drawer,
          common: copy.common,
          confirm: copy.confirm,
        }}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title={copy.confirm.deleteTitle}
        confirmLabel={copy.confirm.confirmLabel}
        cancelLabel={copy.confirm.cancelLabel}
        description={
          pendingDelete
            ? copy.confirm.deleteEntity
                .replace("{entity}", copy.confirm.entityLabels.category)
                .replace("{name}", pendingDelete.title)
            : ""
        }
        isPending={isPending}
        onClose={() => {
          if (!isPending) setPendingDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
