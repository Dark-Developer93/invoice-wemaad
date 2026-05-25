import { z } from "zod";

export const invoiceSchema = z.object({
  invoiceName: z.string().min(1, "Invoice Name is required"),
  total: z.number().min(0.01, "$0.01 is minimum"),
  status: z.enum(["PAID", "PENDING"]).default("PENDING"),
  date: z.string().min(1, "Date is required"),
  dueDate: z.number().min(0, "Due Date is required"),
  fromName: z.string().min(1, "Your name is required"),
  fromEmail: z.string().email("Invalid Email address"),
  fromAddress: z.string().min(1, "Your address is required"),
  clientId: z.string().min(1, "Client is required"),
  currency: z.string().min(1, "Currency is required"),
  invoiceNumber: z.number().min(1, "Minimum invoice number of 1"),
  note: z.string().optional(),
  invoiceItemDescription: z.string().min(1, "Description is required"),
  invoiceItemQuantity: z.number().min(0.01, "Quantity must be greater than 0"),
  invoiceItemRate: z.number().min(0.01, "Rate must be greater than 0"),
});
