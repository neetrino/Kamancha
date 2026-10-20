type Point = { x: number; y: number };

let liftNode: HTMLDivElement | null = null;
let liftSource: HTMLTableRowElement | null = null;
let liftOffset: Point = { x: 0, y: 0 };
let stopListen: (() => void) | null = null;

function watchPointerRelease(): void {
  const move = (event: PointerEvent) => {
    moveRowLift({ x: event.clientX, y: event.clientY });
  };
  const stop = () => endRowLift();
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", stop);
  window.addEventListener("pointercancel", stop);
  stopListen = () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", stop);
    window.removeEventListener("pointercancel", stop);
    stopListen = null;
  };
}

function lockCellWidths(source: HTMLTableRowElement, clone: HTMLTableRowElement): void {
  const cells = source.children;
  const copies = clone.children;
  for (let index = 0; index < cells.length; index += 1) {
    const cell = cells[index];
    const copy = copies[index];
    if (!(cell instanceof HTMLElement) || !(copy instanceof HTMLElement)) continue;
    const width = `${cell.getBoundingClientRect().width}px`;
    copy.style.width = width;
    copy.style.minWidth = width;
    copy.style.maxWidth = width;
  }
}

/** Copies the pressed row onto `document.body` so the lift is visible on that frame. */
export function beginRowLift(handle: HTMLElement, point: Point): void {
  endRowLift();
  const row = handle.closest("tr");
  if (!(row instanceof HTMLTableRowElement)) return;

  const rect = row.getBoundingClientRect();
  const clone = row.cloneNode(true) as HTMLTableRowElement;
  clone.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
  lockCellWidths(row, clone);

  const table = document.createElement("table");
  table.className = row.closest("table")?.className ?? "";
  const body = document.createElement("tbody");
  body.appendChild(clone);
  table.appendChild(body);

  const shell = document.createElement("div");
  shell.className = "admin-drag-lift pointer-events-none fixed z-[10000]";
  shell.style.top = `${rect.top}px`;
  shell.style.left = `${rect.left}px`;
  shell.style.width = `${rect.width}px`;
  shell.appendChild(table);
  document.body.appendChild(shell);
  watchPointerRelease();

  row.classList.add("admin-drag-source");
  liftNode = shell;
  liftSource = row;
  liftOffset = { x: point.x - rect.left, y: point.y - rect.top };
}

export function moveRowLift(point: Point): void {
  if (!liftNode) return;
  liftNode.style.left = `${point.x - liftOffset.x}px`;
  liftNode.style.top = `${point.y - liftOffset.y}px`;
}

export function endRowLift(): void {
  stopListen?.();
  liftNode?.remove();
  liftSource?.classList.remove("admin-drag-source");
  liftNode = null;
  liftSource = null;
}
