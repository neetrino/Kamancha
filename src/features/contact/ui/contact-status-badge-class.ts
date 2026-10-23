/** Same pill shape as the order status chips. */
export const CONTACT_STATUS_PILL_CLASS =
  "inline-flex h-8 items-center rounded-full px-3 text-xs font-medium uppercase";

/** Admin inbox badge colors for contact message status. */
export function contactStatusBadgeClass(status: string): string {
  const normalized = status.toUpperCase();
  if (normalized === "UNREAD") return "bg-blue-100 text-blue-800";
  if (normalized === "READ") return "bg-yellow-100 text-yellow-800";
  if (normalized === "REPLIED") return "bg-green-100 text-green-800";
  if (normalized === "ARCHIVED") return "bg-gray-100 text-gray-800";
  return "bg-gray-100 text-gray-800";
}
