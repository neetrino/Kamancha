"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  ADMIN_PAGE_SUBTITLE,
  ADMIN_PAGE_TITLE,
  ADMIN_SECTION_TITLE,
} from "@/features/admin/ui/admin-form-classes";
import {
  AdminSortableGrip,
  AdminSortableRoot,
  moveItemById,
  useAdminSortableItem,
} from "@/features/admin/ui/admin-sortable";
import { ADMIN_BADGE } from "@/features/admin/ui/status-badge";
import { reorderHeroSlidesAction } from "@/features/hero/application/manage-hero";
import type { AdminHeroSlideListItem } from "@/features/hero/application/queries";
import { HeroSlideControls } from "@/features/hero/ui/HeroSlideControls";
import { HeroSlideModal } from "@/features/hero/ui/HeroSlideModal";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { scheduleStateUpdate } from "@/lib/react/schedule-after-paint";

type AdminHeroViewProps = {
  locale: string;
  slides: AdminHeroSlideListItem[];
  initialEditId?: string;
  copy: Dictionary["admin"];
};

type HeroSortableCardProps = {
  slide: AdminHeroSlideListItem;
  locale: string;
  disabled: boolean;
  copy: Dictionary["admin"];
  onEdit: (slide: AdminHeroSlideListItem) => void;
};

function HeroSortableCard({
  slide,
  locale,
  disabled,
  copy,
  onEdit,
}: HeroSortableCardProps) {
  const { setNodeRef, style, isDragging, attributes, listeners } =
    useAdminSortableItem(slide.id, disabled);

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={isDragging ? "relative z-10 opacity-70" : undefined}
    >
      <Card
        className={`p-4 ${isDragging ? "shadow-md ring-1 ring-gray-200" : ""}`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 gap-3">
            <AdminSortableGrip
              label={copy.hero.reorderItemAria.replace("{title}", slide.title)}
              disabled={disabled}
              attributes={attributes}
              listeners={listeners}
            />
            {slide.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
              <img
                src={slide.imageUrl}
                alt=""
                className="h-16 w-24 shrink-0 rounded-lg border border-gray-200 object-cover"
              />
            ) : (
              <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-xs text-gray-400">
                {copy.hero.noImage}
              </div>
            )}
            <div className="min-w-0">
              <p>
                <button
                  type="button"
                  onClick={() => onEdit(slide)}
                  className="text-left font-medium text-gray-900 hover:underline"
                >
                  {slide.title}
                </button>
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-500">
                  {copy.hero.sortOrder.replace(
                    "{order}",
                    String(slide.sortOrder),
                  )}
                </span>
                <span
                  className={`${ADMIN_BADGE} ${
                    slide.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {slide.isActive ? copy.hero.published : copy.hero.draft}
                </span>
              </div>
              {slide.subtitle ? (
                <p className="mt-1 text-sm text-gray-600">{slide.subtitle}</p>
              ) : null}
            </div>
          </div>
          <HeroSlideControls
            locale={locale}
            slideId={slide.id}
            slideTitle={slide.title}
            isActive={slide.isActive}
            onEdit={() => onEdit(slide)}
            copy={copy}
          />
        </div>
      </Card>
    </li>
  );
}

export function AdminHeroView({
  locale,
  slides,
  initialEditId,
  copy,
}: AdminHeroViewProps) {
  const router = useRouter();
  const initialSlide =
    initialEditId != null
      ? (slides.find((slide) => slide.id === initialEditId) ?? null)
      : null;
  const [modalOpen, setModalOpen] = useState(initialSlide != null);
  const [editingSlide, setEditingSlide] =
    useState<AdminHeroSlideListItem | null>(initialSlide);
  const [ordered, setOrdered] = useState(slides);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    scheduleStateUpdate(setOrdered, slides);
  }, [slides]);

  function openCreate(): void {
    setEditingSlide(null);
    setModalOpen(true);
  }

  function openEdit(slide: AdminHeroSlideListItem): void {
    setEditingSlide(slide);
    setModalOpen(true);
  }

  function closeModal(): void {
    setModalOpen(false);
    setEditingSlide(null);
  }

  function handleReorder(activeId: string, overId: string): void {
    if (isPending) return;
    const previous = ordered;
    const next = moveItemById(ordered, activeId, overId);
    if (
      previous.length === next.length &&
      previous.every((item, index) => item.id === next[index]?.id)
    ) {
      return;
    }

    setOrdered(next);
    startTransition(async () => {
      setError(null);
      const result = await reorderHeroSlidesAction(locale, {
        orderedIds: next.map((slide) => slide.id),
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className={ADMIN_PAGE_TITLE}>{copy.hero.title}</h1>
          <p className={`mt-1 ${ADMIN_PAGE_SUBTITLE}`}>
            {slides.length === 1
              ? copy.hero.slideCount.replace("{count}", "1")
              : copy.hero.slideCountPlural.replace(
                  "{count}",
                  String(slides.length),
                )}
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          {copy.hero.createHeroSlide}
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <h2 className={ADMIN_SECTION_TITLE}>
          {copy.hero.slidesHeading.replace("{count}", String(slides.length))}
        </h2>
        {ordered.length > 1 ? (
          <p className="text-xs text-gray-500">{copy.hero.reorderHint}</p>
        ) : null}
      </div>

      {error ? <p className="mb-3 text-sm text-red-700">{error}</p> : null}

      {ordered.length === 0 ? (
        <Card className="p-6">
          <p className="text-center text-sm text-gray-600">{copy.hero.empty}</p>
        </Card>
      ) : (
        <AdminSortableRoot
          items={ordered.map((slide) => slide.id)}
          disabled={isPending}
          onReorder={handleReorder}
        >
          <ul className="flex flex-col gap-3" aria-label={copy.hero.reorderAria}>
            {ordered.map((slide) => (
              <HeroSortableCard
                key={slide.id}
                slide={slide}
                locale={locale}
                disabled={isPending}
                copy={copy}
                onEdit={openEdit}
              />
            ))}
          </ul>
        </AdminSortableRoot>
      )}

      <HeroSlideModal
        locale={locale}
        open={modalOpen}
        onClose={closeModal}
        slide={editingSlide}
        copy={copy}
      />
    </section>
  );
}
