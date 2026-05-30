"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { clientFormSchema } from "@/lib/zodSchemas";

export type ClientFormValues = z.infer<typeof clientFormSchema>;

interface ClientFormContextValue {
  form: UseFormReturn<ClientFormValues>;
}

const ClientFormContext = createContext<ClientFormContextValue | null>(null);

export function ClientFormProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: ClientFormContextValue;
}) {
  return (
    <ClientFormContext.Provider value={value}>
      {children}
    </ClientFormContext.Provider>
  );
}

export function useClientForm(): ClientFormContextValue {
  const ctx = useContext(ClientFormContext);
  if (!ctx) throw new Error("useClientForm must be used inside ClientFormProvider");
  return ctx;
}
