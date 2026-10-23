"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragMoveEvent,
  type DragOverEvent,
  type DragStartEvent,
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

import { beginRowLift, endRowLift, moveRowLift } from "@/features/admin/ui/admin-drag-lift";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export { arrayMove, rectSortingStrategy, verticalListSortingStrategy };

let blockClickAfterDrag = false;

export function shouldIgnoreSortableClick(): boolean {
  if (!blockClickAfterDrag) return false;
  blockClickAfterDrag = false;
  return true;
}

export function useAdminSortableSensors(activationDistance = 6) {
  const pointerOptions =
    activationDistance > 0 ? { activationConstraint: { distance: activationDistance } } : {};
  return useSensors(
    useSensor(PointerSensor, pointerOptions),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
}

type PointerPoint = { x: number; y: number };

const followPointer: CollisionDetection = (args) => {
  const hits = pointerWithin(args);
  return hits.length > 0 ? hits : closestCenter(args);
};

function clientPoint(event: Event | null): PointerPoint | null {
  if (!event || !("clientX" in event) || !("clientY" in event)) return null;
  const point = event as MouseEvent;
  if (!Number.isFinite(point.clientX) || !Number.isFinite(point.clientY)) return null;
  return { x: point.clientX, y: point.clientY };
}

type FollowPose = { cursor: PointerPoint; offset: PointerPoint };

function placeFollowOverlay(node: HTMLDivElement | null, pose: FollowPose): void {
  if (!node) return;
  node.style.top = `${pose.cursor.y - pose.offset.y}px`;
  node.style.left = `${pose.cursor.x - pose.offset.x}px`;
}

type AdminSortableRootProps = {
  /** Stable id so server and client share the same drag description. */
  id: string;
  items: UniqueIdentifier[];
  disabled?: boolean;
  strategy?: SortingStrategy;
  activationDistance?: number;
  onDragStart?: () => void;
  onDragOver?: (activeId: string, overId: string) => void;
  onDragCancel?: () => void;
  onDragSettled?: () => void;
  onReorder: (activeId: string, overId: string) => void;
  renderOverlay?: (activeId: string, width: number | undefined) => ReactNode;
  children: ReactNode;
};

export function AdminSortableRoot({
  id,
  items,
  disabled = false,
  strategy = verticalListSortingStrategy,
  activationDistance = 6,
  onDragStart,
  onDragOver,
  onDragCancel,
  onDragSettled,
  onReorder,
  renderOverlay,
  children,
}: AdminSortableRootProps) {
  const sensors = useAdminSortableSensors(activationDistance);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overlayWidth, setOverlayWidth] = useState<number | undefined>();
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const followRef = useRef<FollowPose>({
    cursor: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleDragStart(event: DragStartEvent): void {
    if (disabled) return;
    blockClickAfterDrag = true;
    const id = String(event.active.id);
    const initial = event.active.rect.current.initial;
    const point = clientPoint(event.activatorEvent);
    setActiveId(id);
    setOverlayWidth(initial?.width);
    followRef.current = {
      cursor: point ?? { x: initial?.left ?? 0, y: initial?.top ?? 0 },
      offset:
        initial && point
          ? { x: point.x - initial.left, y: point.y - initial.top }
          : { x: 0, y: 0 },
    };
    onDragStart?.();
  }

  function clearDrag(): void {
    endRowLift();
    setActiveId(null);
    setOverlayWidth(undefined);
    window.setTimeout(() => {
      blockClickAfterDrag = false;
    }, 0);
  }

  function handleDragMove(event: DragMoveEvent): void {
    const point = clientPoint(event.activatorEvent);
    if (!point) return;
    const cursor = { x: point.x + event.delta.x, y: point.y + event.delta.y };
    followRef.current.cursor = cursor;
    moveRowLift(cursor);
    placeFollowOverlay(overlayRef.current, followRef.current);
  }

  useLayoutEffect(() => {
    if (!activeId) return;
    placeFollowOverlay(overlayRef.current, followRef.current);
  });

  function handleDragOver(event: DragOverEvent): void {
    const { active, over } = event;
    if (disabled || !onDragOver || !over || active.id === over.id) return;
    onDragOver(String(active.id), String(over.id));
  }

  function finishDrag(event: DragEndEvent): void {
    const { active, over } = event;
    clearDrag();
    if (!disabled && over && active.id !== over.id) {
      if (onDragOver) onDragOver(String(active.id), String(over.id));
      else onReorder(String(active.id), String(over.id));
    }
    onDragSettled?.();
  }

  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={renderOverlay ? followPointer : closestCenter}
      autoScroll
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragCancel={() => {
        clearDrag();
        onDragCancel?.();
      }}
      onDragEnd={finishDrag}
    >
      <SortableContext items={items} strategy={strategy} disabled={disabled}>
        {children}
      </SortableContext>
      {mounted && renderOverlay && activeId
        ? createPortal(
            <div ref={overlayRef} className="pointer-events-none fixed z-[10000]" style={{ width: overlayWidth }}>{renderOverlay(activeId, overlayWidth)}</div>,
            document.body,
          )
        : null}
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

export function useAdminSortableItem(
  id: string,
  disabled = false,
  options?: { layoutShift?: boolean; dragOverlay?: boolean },
): AdminSortableItemApi {
  const layoutShift = options?.layoutShift !== false;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled });
  const lifted = options?.dragOverlay === true && isDragging;

  return {
    setNodeRef,
    style: layoutShift
      ? {
          transform: lifted ? undefined : CSS.Transform.toString(transform),
          transition: lifted ? undefined : transition,
        }
      : {},
    isDragging,
    attributes,
    listeners,
  };
}

type AdminSortableGripProps = {
  label: string;
  disabled?: boolean;
  liftRow?: boolean;
  attributes: AdminSortableItemApi["attributes"];
  listeners: AdminSortableItemApi["listeners"];
};

export function AdminSortableGrip({
  label,
  disabled = false,
  liftRow = false,
  attributes,
  listeners,
}: AdminSortableGripProps) {
  return (
    <button
      type="button"
      className={`touch-none shrink-0 select-none text-gray-400 ${
        disabled
          ? "cursor-not-allowed opacity-40"
          : "cursor-grab hover:text-gray-600 active:cursor-grabbing"
      }`}
      aria-label={label}
      disabled={disabled}
      {...attributes}
      {...listeners}
      onPointerDown={(event) => {
        if (disabled) return;
        if (liftRow) beginRowLift(event.currentTarget, { x: event.clientX, y: event.clientY });
        listeners?.onPointerDown?.(event);
        event.preventDefault();
      }}
    >
      <GripVertical className="h-4 w-4" strokeWidth={1.75} aria-hidden />
    </button>
  );
}

export function moveItemById<T extends { id: string }>(
  list: T[],
  activeId: string,
  overId: string,
): T[] {
  return moveItemByKey(list, activeId, overId, (item) => item.id);
}

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
