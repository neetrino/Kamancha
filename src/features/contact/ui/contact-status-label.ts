import type { ContactStatus } from "@/features/contact/domain/contact-rules";

type ContactStatusLabels = {
  unread: string;
  read: string;
  replied: string;
  archived: string;
};

/** Localized label for a contact-message status. */
export function contactStatusLabel(
  status: string,
  labels: ContactStatusLabels,
): string {
  const normalized = status.toUpperCase() as ContactStatus;
  if (normalized === "UNREAD") return labels.unread;
  if (normalized === "READ") return labels.read;
  if (normalized === "REPLIED") return labels.replied;
  if (normalized === "ARCHIVED") return labels.archived;
  return status;
}
