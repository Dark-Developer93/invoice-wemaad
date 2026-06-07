import { z } from "zod";

import { invoiceItemsSchema } from "@/lib/invoiceItems";

export const invoiceSchema = z.object({
  invoiceName: z.string().min(1, "Invoice Name is required").max(100, "Invoice name is too long"),
  total: z.number().min(0.01, "$0.01 is minimum"),
  status: z.enum(["PAID", "PENDING"]).default("PENDING"),
  date: z.string().min(1, "Date is required"),
  dueDate: z.number().min(0, "Due Date is required"),
  fromName: z.string().min(1, "Your name is required").max(100, "Name is too long"),
  fromEmail: z.string().email("Invalid Email address").max(254, "Email is too long"),
  fromAddress: z.string().min(1, "Your address is required").max(500, "Address is too long"),
  clientId: z.string().min(1, "Client is required"),
  currency: z.enum(["USD", "EUR", "EGP"], {
    errorMap: () => ({ message: "Invalid currency" }),
  }),
  invoiceNumber: z.number().min(1, "Minimum invoice number of 1"),
  note: z.string().max(1000, "Note is too long").optional(),
  items: invoiceItemsSchema,
});
