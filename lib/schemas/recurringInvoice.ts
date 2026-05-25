import { z } from "zod";

export const recurringInvoiceSchema = z.object({
  interval: z.enum(["MONTHLY", "QUARTERLY", "YEARLY"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  invoiceName: z.string().min(1, "Invoice name is required"),
  fromName: z.string().min(1, "Your name is required"),
  fromEmail: z.string().email("Invalid email address"),
  fromAddress: z.string().min(1, "Your address is required"),
  clientId: z.string().min(1, "Client is required"),
  currency: z.string().min(1, "Currency is required"),
  dueDate: z.number().min(0, "Due date is required"),
  invoiceItemDescription: z.string().min(1, "Description is required"),
  invoiceItemQuantity: z.number().min(0.01, "Quantity must be greater than 0"),
  invoiceItemRate: z.number().min(0.01, "Rate must be greater than 0"),
  total: z.number().min(0.01, "$0.01 is minimum"),
  note: z.string().optional(),
});
