"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { getUnreadContactMessageCountAction } from "@/features/contact/application/unread-message-count";

const POLL_MS = 15_000;

type AdminUnreadMessagesContextValue = {
  unreadCount: number;
};

const AdminUnreadMessagesContext =
  createContext<AdminUnreadMessagesContextValue | null>(null);

/** Polls unread contact-message count for the admin sidebar badge. */
export function AdminUnreadMessagesProvider({
  locale,
  children,
}: {
  locale: string;
  children: ReactNode;
}) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function refresh(): Promise<void> {
      const result = await getUnreadContactMessageCountAction(locale);
      if (cancelled || !result.ok) return;
      setUnreadCount(result.value.unreadCount);
    }

    void refresh();
    const timer = window.setInterval(() => {
      void refresh();
    }, POLL_MS);
    window.addEventListener("focus", refresh);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [locale]);

  return (
    <AdminUnreadMessagesContext.Provider value={{ unreadCount }}>
      {children}
    </AdminUnreadMessagesContext.Provider>
  );
}

export function useAdminUnreadMessages(): AdminUnreadMessagesContextValue {
  const value = useContext(AdminUnreadMessagesContext);
  if (!value) {
    throw new Error("useAdminUnreadMessages must be used inside AdminUnreadMessagesProvider.");
  }
  return value;
}
