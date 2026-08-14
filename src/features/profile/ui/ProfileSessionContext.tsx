"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { SessionUser } from "@/lib/auth/session";

const ProfileSessionContext = createContext<SessionUser | null>(null);

type ProfileSessionProviderProps = {
  user: SessionUser;
  children: ReactNode;
};

/** Session already resolved by the profile layout — no extra request on tab change. */
export function ProfileSessionProvider({
  user,
  children,
}: ProfileSessionProviderProps) {
  return (
    <ProfileSessionContext.Provider value={user}>
      {children}
    </ProfileSessionContext.Provider>
  );
}

export function useProfileSession(): SessionUser {
  const user = useContext(ProfileSessionContext);
  if (!user) {
    throw new Error("useProfileSession must be used within ProfileSessionProvider.");
  }
  return user;
}
