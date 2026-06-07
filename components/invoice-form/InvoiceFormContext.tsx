"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { UseFormReturn } from "react-hook-form";
import { Prisma, Client } from "@prisma/client";
import * as z from "zod";

import { invoiceSchema } from "@/lib/zodSchemas";
import { Currency } from "@/types";

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export type InvoiceClient = Client & {
  addresses: Array<{
    id: string;
    type: "BILLING" | "SHIPPING" | "OTHER";
    street: string;
    city: string;
    state: string | null;
    country: string;
    zipCode: string;
    isDefault: boolean;
  }>;
  contactPersons: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    position: string | null;
    isPrimary: boolean;
  }>;
};

export type InvoiceData = Prisma.InvoiceGetPayload<{
  include: {
    client: {
      select: {
        name: true;
        email: true;
        addresses: { select: { street: true; isDefault: true } };
      };
    };
  };
}>;

interface InvoiceFormContextValue {
  form: UseFormReturn<InvoiceFormValues>;
  mode: "create" | "edit";
  clients: InvoiceClient[];
  data?: InvoiceData;
  selectedClient: InvoiceClient | null | undefined;
  currency: Currency;
  sendEmail: boolean;
  setSendEmail: (v: boolean) => void;
  isLoading: boolean;
  onClose?: () => void;
  onCancelClick: () => void;
}

const InvoiceFormContext = createContext<InvoiceFormContextValue | null>(null);

export function InvoiceFormProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: InvoiceFormContextValue;
}) {
  return (
    <InvoiceFormContext.Provider value={value}>
      {children}
    </InvoiceFormContext.Provider>
  );
}

export function useInvoiceForm(): InvoiceFormContextValue {
  const ctx = useContext(InvoiceFormContext);
  if (!ctx) throw new Error("useInvoiceForm must be used inside InvoiceFormProvider");
  return ctx;
}
