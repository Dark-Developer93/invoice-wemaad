"use client";

import { createContext, useContext, ReactNode } from "react";

export interface UserContextValue {
  firstName: string;
  lastName: string;
  address: string;
  email: string;
  companyName: string;
  companyEmail: string;
  companyAddress: string;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({
  user,
  children,
}: {
  user: UserContextValue;
  children: ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}
