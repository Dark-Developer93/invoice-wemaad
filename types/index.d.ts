export type Currency = "USD" | "EUR" | "EGP";

interface InvoiceEmailProps {
  clientName: string;
  invoiceNumber: string;
  invoiceDueDate: string;
  invoiceAmount: string;
  invoiceLink: string;
}

export type NewInvoiceEmailProps = InvoiceEmailProps;

export type UpdatedInvoiceEmailProps = InvoiceEmailProps;

export type ReminderInvoiceEmailProps = InvoiceEmailProps;

export type ContactFormEmailProps = {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
};
