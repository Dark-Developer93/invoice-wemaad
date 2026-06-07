import { z } from "zod";

import { invoiceItemsSchema } from "@/lib/invoiceItems";

export const recurringInvoiceSchema = z
  .object({
    interval: z.enum(["MONTHLY", "QUARTERLY", "YEARLY"]),
    startDate: z
      .string()
      .min(1, "Start date is required")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    endDate: z
      .union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")])
      .optional(),
    invoiceName: z.string().min(1, "Invoice name is required").max(100, "Invoice name is too long"),
    fromName: z.string().min(1, "Your name is required").max(100, "Name is too long"),
    fromEmail: z.string().email("Invalid email address").max(254, "Email is too long"),
    fromAddress: z.string().min(1, "Your address is required").max(500, "Address is too long"),
    clientId: z.string().min(1, "Client is required"),
    currency: z.enum(["USD", "EUR", "EGP"], {
      errorMap: () => ({ message: "Invalid currency" }),
    }),
    dueDate: z.number().min(0, "Due date is required"),
    items: invoiceItemsSchema,
    total: z.number().min(0.01, "$0.01 is minimum"),
    note: z.string().max(1000, "Note is too long").optional(),
  })
  .refine(
    (data) => {
      if (!data.endDate) return true;
      return new Date(data.endDate) > new Date(data.startDate);
    },
    {
      message: "End date must be after the start date",
      path: ["endDate"],
    }
  );
