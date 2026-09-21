"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  type SortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

export { arrayMove, rectSortingStrategy, verticalListSortingStrategy };

/** Pointer + keyboard sensors matching ToonExpo admin sortable lists. */
export function useAdminSortableSensors() {
  return useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
}

type AdminSortableRootProps = {
  items: UniqueIdentifier[];
  disabled?: boolean;
  /** Defaults to vertical list (ToonExpo homepage style). */
  strategy?: SortingStrategy;
  onReorder: (activeId: string, overId: string) => void;
  children: ReactNode;
};

/**
 * Shared SortableContext for admin orderable lists
 * (categories, hero, cash-change, product images, etc.).
 */
export function AdminSortableRoot({
  items,
  disabled = false,
  strategy = verticalListSortingStrategy,
  onReorder,
  children,
}: AdminSortableRootProps) {
  const sensors = useAdminSortableSensors();

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event;
    if (disabled || !over || active.id === over.id) return;
    onReorder(String(active.id), String(over.id));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={strategy} disabled={disabled}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

export type AdminSortableItemApi = {
  setNodeRef: (node: HTMLElement | null) => void;
  style: CSSProperties;
  isDragging: boolean;
  attributes: ReturnType<typeof useSortable>["attributes"];
  listeners: ReturnType<typeof useSortable>["listeners"];
};

/** Hook for one sortable row/card — apply `setNodeRef` + `style` on the row. */
export function useAdminSortableItem(
  id: string,
  disabled = false,
): AdminSortableItemApi {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled });

  return {
    setNodeRef,
    style: {
      transform: CSS.Transform.toString(transform),
      transition,
    },
    isDragging,
    attributes,
    listeners,
  };
}

type AdminSortableGripProps = {
  label: string;
  disabled?: boolean;
  attributes: AdminSortableItemApi["attributes"];
  listeners: AdminSortableItemApi["listeners"];
};

/** Drag handle button — wire `attributes` + `listeners` from useAdminSortableItem. */
export function AdminSortableGrip({
  label,
  disabled = false,
  attributes,
  listeners,
}: AdminSortableGripProps) {
  return (
    <button
      type="button"
      className={`touch-none shrink-0 text-gray-400 ${
        disabled
          ? "cursor-not-allowed opacity-40"
          : "cursor-grab hover:text-gray-600 active:cursor-grabbing"
      }`}
      aria-label={label}
      disabled={disabled}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-4 w-4" strokeWidth={1.75} aria-hidden />
    </button>
  );
}

/** Moves an item by id within a list (immutable). */
export function moveItemById<T extends { id: string }>(
  list: T[],
  activeId: string,
  overId: string,
): T[] {
  return moveItemByKey(list, activeId, overId, (item) => item.id);
}

/** Moves an item using a custom id getter (e.g. product draft `key`). */
export function moveItemByKey<T>(
  list: T[],
  activeId: string,
  overId: string,
  getId: (item: T) => string,
): T[] {
  const fromIndex = list.findIndex((item) => getId(item) === activeId);
  const toIndex = list.findIndex((item) => getId(item) === overId);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
    return list;
  }
  return arrayMove(list, fromIndex, toIndex);
}
