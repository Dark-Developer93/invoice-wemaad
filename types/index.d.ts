export type Currency = "USD" | "EUR" | "EGP";

export interface InvoiceEmailProps {
  clientName: string;
  invoiceNumber: string;
  invoiceDueDate: string;
  invoiceAmount: string;
  invoiceLink: string;
}

export interface ContactFormEmailProps {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}
