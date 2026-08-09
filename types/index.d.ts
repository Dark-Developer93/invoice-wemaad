export type Currency = "USD" | "EUR" | "EGP";

export interface InvoiceEmailProps {
  clientName: string;
  invoiceNumber: string;
  invoiceDueDate: string;
  invoiceAmount: string;
  invoiceLink: string;
  // false on plans without customBranding (Free, Starter) — shows a "Sent
  // via InvoiceWeMaAd" footer with a link back to the homepage. true on
  // Pro/Business, which removes it for a fully white-labeled email.
  showBranding: boolean;
}

export interface ContactFormEmailProps {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

export interface SystemAlertEmailProps {
  title: string;
  message: string;
  href?: string;
}
