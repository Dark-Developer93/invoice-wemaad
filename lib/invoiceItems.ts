import { z } from "zod";

export const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required").max(500, "Description is too long"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0").max(100000, "Quantity is too large"),
  rate: z.number().min(0.01, "Rate must be greater than 0").max(9999999, "Rate is too large"),
});

export type InvoiceItem = z.infer<typeof invoiceItemSchema>;

// FormData serializes arrays as JSON strings (see lib/toFormData.ts), so accept
// either a parsed array or its JSON-string representation.
export const invoiceItemsSchema = z.preprocess((val) => {
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  }
  return val;
}, z.array(invoiceItemSchema).min(1, "At least one item is required"));

export function calculateInvoiceTotal(items: Array<Pick<InvoiceItem, "quantity" | "rate">>): number {
  const total = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  return Math.round(total * 100) / 100;
}

// Invoice/RecurringInvoice store items as a JSON column (Prisma.JsonValue),
// so any value read back from the DB needs this guard before use as InvoiceItem[].
export function parseInvoiceItems(value: unknown): InvoiceItem[] {
  return Array.isArray(value) ? (value as unknown as InvoiceItem[]) : [];
}
