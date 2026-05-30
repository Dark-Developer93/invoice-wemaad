"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { InvoiceEmailProps } from "@/types";

const InvoiceEmailContext = createContext<InvoiceEmailProps | null>(null);

export function InvoiceEmailProvider({
  invoice,
  children,
}: {
  invoice: InvoiceEmailProps;
  children: ReactNode;
}) {
  return (
    <InvoiceEmailContext.Provider value={invoice}>
      {children}
    </InvoiceEmailContext.Provider>
  );
}

export function useInvoiceEmail(): InvoiceEmailProps {
  const ctx = useContext(InvoiceEmailContext);
  if (!ctx) throw new Error("useInvoiceEmail must be used inside InvoiceEmailProvider");
  return ctx;
}
